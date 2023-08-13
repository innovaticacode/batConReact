import React, { useEffect, useState } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import {
    Form,
    Input,
    Select,
    notification,
    Radio,
    Checkbox,
    Slider,
    Button,
} from 'antd';
import MultiRangeSlider from './MultiRangeSlider';
import axios from 'axios';

const EditProduct = ({ product, onCancel, user }) => {
    const [productFormEntries, setProductFormEntries] = useState([]);
    const [getProduct, setGetProduct] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProduct();
    }, [user]);

    const [expandedFields, setExpandedFields] = useState([]);

    const toggleNoteField = (fieldId) => {
        if (expandedFields.includes(fieldId)) {
            setExpandedFields(expandedFields.filter((id) => id !== fieldId));
        } else {
            setExpandedFields([...expandedFields, fieldId]);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/products/${product.id}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            const productData = response.data.product;
            const formEntriesData = response.data.entries;
            setGetProduct(productData);

            const data = new FormData();

            const newFormData = {
                name: productData?.name || '',
                user_id: productData?.user?.id || '',
            };

            console.log(formEntriesData);
            formEntriesData.forEach((item) => {
                item.fields.forEach((fieldItem) => {
                    if (fieldItem.entry) {
                        const fieldName = fieldItem.field.id.toString();
                        const isFileField =
                            fieldItem.field.input_type === 'file';
                        const fieldKey = isFileField
                            ? `${fieldName}_file`
                            : fieldName;
                        newFormData[`${fieldKey}`] = fieldItem.entry.value;
                        data.append(`${fieldKey}`, fieldItem.entry.value);
                        newFormData[`${fieldName}_note`] =
                            fieldItem.entry.note || '';

                        if (
                            newFormData[`${fieldItem.field.id}_note`] &&
                            !expandedFields.includes(fieldItem.field.id)
                        ) {
                            toggleNoteField(fieldItem.field.id);
                        }

                        if (fieldItem.field.field_type === 'checkbox') {
                            const selectedValues = fieldItem.entry.value
                                .split(',')
                                .map((value) => value.trim());
                            const checkboxDat = {};
                            fieldItem.field.checkbox_label.forEach((label) => {
                                checkboxData[
                                    label.option
                                ] = selectedValues.includes(label.option);
                            });
                            newFormData[`${fieldKey}`] = isFileField
                                ? checkboxData
                                : selectedValues.join(', ');
                        } else if (
                            fieldItem.field.field_type === 'input' &&
                            fieldItem.field.input_type === 'range'
                        ) {
                            newFormData[
                                `${fieldKey}`
                            ] = fieldItem.entry.value.split(',').map(Number);
                        }
                    }
                });
            });

            setFormData(newFormData);
            setProductFormEntries(formEntriesData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        // Check if the input type is checkbox
        if (type === 'checkbox') {
            if (checked) {
                // Eğer checkbox işaretlenmişse, formData nesnesine sadece o değeri ekleyin.
                // Diğer değerleri değiştirmeyin.
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    [name]: { ...prevFormData[name], [value]: value },
                }));
            } else {
                // Eğer checkbox işaretlenmemişse, formData nesnesinden o değeri çıkarın.
                // Diğer değerleri değiştirmeyin.
                setFormData((prevFormData) => {
                    const updatedData = { ...prevFormData[name] };
                    delete updatedData[value];
                    return { ...prevFormData, [name]: updatedData };
                });
            }
        } else if (type === 'file') {
            const field = productFormFields.find(
                (field) => field.id === Number(name)
            );

            if (
                field &&
                field.field_type === 'input' &&
                field.input_type === 'file'
            ) {
                if (field.file_type === 'single') {
                    const fileSizeLimit = parseInt(files[0].size);

                    if (parseInt(field.file_size) > fileSizeLimit) {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            [`${name}.file`]: files[0] ? files[0] : '',
                            [`${name}.note`]: formData[`${name}.note`] || '',
                        }));
                    } else {
                        notification.error({
                            message: 'Opp! Something went wrong.',
                            description: 'File size exceeds the limit !',
                            duration: 500,
                        });
                    }
                } else if (field.file_type === 'multiple') {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const fileSizeLimit = parseInt(file.size);
                        if (parseInt(field.file_size) > fileSizeLimit) {
                            const newFiles = Array.from(files);
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                [`${name}.file`]: newFiles ? newFiles : '',
                                [`${name}.note`]:
                                    formData[`${name}.note`] || '',
                            }));
                        } else {
                            notification.error({
                                message: 'Opp! Something went wrong.',
                                description: 'File size exceeds the limit !',
                                duration: 500,
                            });
                        }
                    }
                }
            }
        } else if (type == 'range') {
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();

        const requiredFields = productFormEntries.filter(
            (field) => field.required === true
        );
        const missingFields = requiredFields.filter(
            (field) => !formData[field.id]
        );

        if (missingFields.length > 0) {
            toast.error('Fill in the required fields!');
            return;
        }

        const updatedData = { ...formData }; // Daha sonra güncellenmiş verileri ekleyeceğiniz bir nesne oluşturun

        await axios
            .put(
                `http://127.0.0.1:8000/api/products/${product.id}`,
                { updatedData }, // Güncellenmiş verileri JSON olarak gönderin
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            )
            .then((response) => {
                if (response.data.status == 201) {
                    toast.success(response.data.message);
                    setFormData(new FormData());
                    fetchProduct();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSliderValuesChange = (fieldName, newValues) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldName]: newValues,
        }));
    };

    return (
        <div className="ps-page__dashboard">
            <h4>Edit Product</h4>
            <div className="w-full mx-auto w-100">
                <div>
                    <form onSubmit={handleEdit} encType="multipart/form-data">
                        <div key={product.id} className=" bg-gray-100 mb-5">
                            <div className="d-flex justify-content-between mt-4 mb-5">
                                <div className="w-100">
                                    <div className="ml-2 max-sm:ml-0 ">
                                        <label className="w-20">
                                            Name{' '}
                                            <span className="font-bold text-red ml-2">
                                                (*)
                                            </span>
                                        </label>
                                        <Input
                                            name="name"
                                            className="form-control"
                                            type="text"
                                            placeholder="Name"
                                            value={
                                                formData['name']
                                                    ? formData['name']
                                                    : product.name
                                            }
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            {productFormEntries.map((item, itemIndex) => (
                                <>
                                    <h4> {item.title.name}</h4>
                                    <hr />
                                    {item.fields.map(
                                        (fieldItem, fieldIndex) => (
                                            <>
                                                <div className="d-flex justify-content-between mb-3 align-items-center">
                                                    <div>
                                                        {fieldItem.field.name}
                                                        {fieldItem.field
                                                            .required ? (
                                                            <span className="font-bold text-red ml-2">
                                                                (*)
                                                            </span>
                                                        ) : (
                                                            ' '
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            toggleNoteField(
                                                                fieldItem.field
                                                                    .id
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor: expandedFields.includes(
                                                                fieldItem.field
                                                                    .id
                                                            )
                                                                ? '#FF0000'
                                                                : '#FCB800',
                                                            borderColor: expandedFields.includes(
                                                                fieldItem.field
                                                                    .id
                                                            )
                                                                ? '#FF0000'
                                                                : '#FCB800',
                                                            color: expandedFields.includes(
                                                                fieldItem.field
                                                                    .id
                                                            )
                                                                ? 'white'
                                                                : 'black',
                                                        }}>
                                                        {!expandedFields.includes(
                                                            fieldItem.field.id
                                                        ) ? (
                                                            <span
                                                                style={{
                                                                    fontWeight: 600,
                                                                }}>
                                                                Add Note
                                                            </span>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    fontWeight: 600,
                                                                }}>
                                                                Remove Note
                                                            </span>
                                                        )}
                                                    </Button>
                                                </div>

                                                {fieldItem.field.note && (
                                                    <span className="mt-3 pt-4">
                                                        Note:{' '}
                                                        {fieldItem.field.note}
                                                    </span>
                                                )}
                                                {fieldItem.field.field_type ===
                                                    'input' &&
                                                fieldItem.field.input_type ===
                                                    'range' ? (
                                                    <MultiRangeSlider
                                                        valuePropName=""
                                                        min={
                                                            fieldItem.field
                                                                .range_min
                                                        }
                                                        max={
                                                            fieldItem.field
                                                                .range_max
                                                        }
                                                        name={`${fieldItem.field.id}`}
                                                        value={fieldItem.entry.value
                                                            .split(',')
                                                            .map(Number)}
                                                        handleSliderValuesChange={
                                                            handleSliderValuesChange
                                                        }
                                                    />
                                                ) : fieldItem.field
                                                      .field_type === 'input' &&
                                                  fieldItem.field.input_type ===
                                                      'file' ? (
                                                    <>
                                                        <>
                                                            {fieldItem.field
                                                                .file_type ===
                                                                'single' && (
                                                                <>
                                                                    <span className="font-bold">
                                                                        Single
                                                                        File
                                                                        Upload
                                                                    </span>
                                                                    <div className="grid grid-cols-12 gap-3 mt-5 intro-y sm:gap-6">
                                                                        <div
                                                                            key={
                                                                                fieldItem
                                                                                    .entry
                                                                                    .type
                                                                            }
                                                                            className="col-span-6 intro-y sm:col-span-4 md:col-span-3 2xl:col-span-3">
                                                                            <div className="relative px-3 pt-5 pb-3 rounded-md file box sm:px-3 zoom-in">
                                                                                {(() => {
                                                                                    if (
                                                                                        fieldItem
                                                                                            .entry
                                                                                            .type ===
                                                                                            'png' ||
                                                                                        fieldItem
                                                                                            .entry
                                                                                            .type ===
                                                                                            'jpeg'
                                                                                    )
                                                                                        return (
                                                                                            <img
                                                                                                src={
                                                                                                    `http://127.0.0.1:8000/storage/files/` +
                                                                                                    formData[
                                                                                                        `${fieldItem.field.id}_file`
                                                                                                    ]
                                                                                                }
                                                                                                className="w-full rounded-md"
                                                                                            />
                                                                                        );
                                                                                    else if (
                                                                                        fieldItem
                                                                                            .entry
                                                                                            .type ==
                                                                                        'pdf'
                                                                                    )
                                                                                        return (
                                                                                            <>
                                                                                                <a
                                                                                                    target="_blank"
                                                                                                    href={
                                                                                                        `http://127.0.0.1:8000/storage/files/` +
                                                                                                        formData[
                                                                                                            `${fieldItem.field.id}_file`
                                                                                                        ]
                                                                                                    }>
                                                                                                    <i className="fa fa-file"></i>
                                                                                                </a>
                                                                                            </>
                                                                                        );
                                                                                    else
                                                                                        return (
                                                                                            <>
                                                                                                <a
                                                                                                    target="_blank"
                                                                                                    href={
                                                                                                        `http://127.0.0.1:8000/storage/files/` +
                                                                                                        formData[
                                                                                                            `${fieldItem.field.id}_file`
                                                                                                        ]
                                                                                                    }>
                                                                                                    <i className="fa fa-file"></i>
                                                                                                </a>
                                                                                            </>
                                                                                        );
                                                                                })()}
                                                                                {/* <Menu className="absolute top-0 right-0 ml-auto mr-2">
                                              <Menu.Button
                                                as="a"
                                                className="block w-5 h-5"
                                              >
                                                <Lucide
                                                  icon="MoreVertical"
                                                  className="w-5 h-5 text-slate-500 rotate-90"
                                                />
                                              </Menu.Button>
                                              <Menu.Items className="w-40">
                                                <Menu.Item
                                                  onClick={() =>
                                                    handleFileDelete(
                                                      fieldItem.field.id,
                                                      fieldItem.entry.id
                                                    )
                                                  }
                                                >
                                                  <Lucide
                                                    icon="Trash"
                                                    className="w-4 h-4 mr-2"
                                                  />
                                                  Delete
                                                </Menu.Item>
                                              </Menu.Items>
                                            </Menu> */}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {fieldItem.field
                                                                .file_type ===
                                                                'multiple' && (
                                                                <>
                                                                    <span className="font-bold">
                                                                        Multiple
                                                                        File
                                                                        Upload
                                                                    </span>
                                                                    <div className="grid grid-cols-12 gap-3 mt-5 intro-y sm:gap-6">
                                                                        {fieldItem.entry.value.map(
                                                                            (
                                                                                value
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        fieldItem
                                                                                            .entry
                                                                                            .type
                                                                                    }
                                                                                    className="col-span-6 intro-y sm:col-span-4 md:col-span-3 2xl:col-span-3">
                                                                                    <div className="relative px-3 pt-5 pb-3 rounded-md file box sm:px-3 zoom-in">
                                                                                        {(() => {
                                                                                            if (
                                                                                                value.type ==
                                                                                                    'png' ||
                                                                                                value.type ==
                                                                                                    'jpeg'
                                                                                            )
                                                                                                return (
                                                                                                    <img
                                                                                                        src={
                                                                                                            `http://127.0.0.1:8000/storage/files/` +
                                                                                                            value.file
                                                                                                        }
                                                                                                        alt=""
                                                                                                        srcset=""
                                                                                                        className="w-full rounded-md"
                                                                                                    />
                                                                                                );
                                                                                            else if (
                                                                                                value.type ==
                                                                                                'pdf'
                                                                                            )
                                                                                                return (
                                                                                                    <i className="fa fa-file"></i>
                                                                                                );
                                                                                            else if (
                                                                                                value.type ==
                                                                                                'mp4'
                                                                                            )
                                                                                                return (
                                                                                                    <i className="fa fa-file"></i>
                                                                                                );
                                                                                        })()}
                                                                                        {/* <Menu className="absolute top-0 right-0 ml-auto mr-2">
                                                                                            <Menu.Button
                                                                                                as="a"
                                                                                                className="block w-5 h-5">
                                                                                                <Lucide
                                                                                                    icon="MoreVertical"
                                                                                                    className="w-5 h-5 text-slate-500 rotate-90"
                                                                                                />
                                                                                            </Menu.Button>
                                                                                            <Menu.Items className="w-40">
                                                                                                <Menu.Item
                                                                                                    onClick={() =>
                                                                                                        handleFileDelete(
                                                                                                            fieldItem
                                                                                                                .field
                                                                                                                .id,
                                                                                                            value.id
                                                                                                        )
                                                                                                    }>
                                                                                                    <Lucide
                                                                                                        icon="Trash"
                                                                                                        className="w-4 h-4 mr-2"
                                                                                                    />{' '}
                                                                                                    Delete
                                                                                                </Menu.Item>
                                                                                            </Menu.Items>
                                                                                        </Menu> */}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                            <>
                                                                <Form.Item
                                                                    name={`${fieldItem.field.id}`}
                                                                    valuePropName=""
                                                                    rules={[
                                                                        {
                                                                            required:
                                                                                fieldItem
                                                                                    .field
                                                                                    .required,
                                                                            message: `Please input your ${fieldItem.field.name.toLowerCase()}!`,
                                                                        },
                                                                    ]}>
                                                                    <Input
                                                                        style={{
                                                                            paddingTop:
                                                                                '10px',
                                                                        }}
                                                                        name={`${fieldItem.field.id}`}
                                                                        className="form-control"
                                                                        type="file"
                                                                        placeholder={
                                                                            fieldItem
                                                                                .field
                                                                                .input_placeholder
                                                                        }
                                                                        value={
                                                                            formData[
                                                                                `${fieldItem.field.id}`
                                                                            ] ||
                                                                            ''
                                                                        }
                                                                        accept={
                                                                            fieldItem
                                                                                .field
                                                                                .file_accept
                                                                        }
                                                                        multiple={
                                                                            fieldItem
                                                                                .field
                                                                                .file_type ===
                                                                            'multiple'
                                                                        }
                                                                        onChange={
                                                                            handleChange
                                                                        }
                                                                    />
                                                                </Form.Item>
                                                            </>
                                                        </>
                                                    </>
                                                ) : fieldItem.field
                                                      .field_type ===
                                                  'input' ? (
                                                    <>
                                                        <Form.Item
                                                            name={`${fieldItem.field.id}`}
                                                            valuePropName=""
                                                            rules={[
                                                                {
                                                                    required:
                                                                        fieldItem
                                                                            .field
                                                                            .required,
                                                                    message: `Please input your ${fieldItem.field.name.toLowerCase()}!`,
                                                                },
                                                            ]}>
                                                            <Input
                                                                name={`${fieldItem.field.id}`}
                                                                className="form-control"
                                                                type={
                                                                    fieldItem
                                                                        .field
                                                                        .input_type
                                                                }
                                                                placeholder={
                                                                    fieldItem
                                                                        .field
                                                                        .input_placeholder
                                                                }
                                                                value={
                                                                    formData[
                                                                        `${fieldItem.field.id}`
                                                                    ]
                                                                        ? formData[
                                                                              `${fieldItem.field.id}`
                                                                          ]
                                                                        : fieldItem
                                                                              .entry
                                                                              .value
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                            />
                                                        </Form.Item>
                                                    </>
                                                ) : fieldItem.field
                                                      .field_type ===
                                                  'select' ? (
                                                    <div className="form-group">
                                                        <select
                                                            className="form-control"
                                                            placeholder="Select an option"
                                                            style={{
                                                                width: '100%',
                                                            }}
                                                            value={
                                                                formData[
                                                                    `${fieldItem.field.id}`
                                                                ]
                                                                    ? formData[
                                                                          `${fieldItem.field.id}`
                                                                      ]
                                                                    : fieldItem
                                                                          .entry
                                                                          .value
                                                            }
                                                            name={`${fieldItem.field.id}`}
                                                            onChange={
                                                                handleChange
                                                            }>
                                                            {fieldItem.field.select_options.map(
                                                                (
                                                                    option,
                                                                    index
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }>
                                                                        {
                                                                            option.key
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                ) : fieldItem.field
                                                      .field_type ===
                                                  'textarea' ? (
                                                    <Form.Item
                                                        name={`${fieldItem.field.id}`}
                                                        valuePropName=""
                                                        rules={[
                                                            {
                                                                required:
                                                                    fieldItem
                                                                        .field
                                                                        .required,
                                                                message: `Please input your ${fieldItem.field.name.toLowerCase()}!`,
                                                            },
                                                        ]}>
                                                        <TextArea
                                                            name={`${fieldItem.field.id}`}
                                                            className="block px-4 py-3 min-w-full xl:min-w-[350px]"
                                                            value={
                                                                formData[
                                                                    `${fieldItem.field.id}`
                                                                ]
                                                                    ? formData[
                                                                          `${fieldItem.field.id}`
                                                                      ]
                                                                    : fieldItem
                                                                          .entry
                                                                          .value
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                        />
                                                    </Form.Item>
                                                ) : fieldItem.field
                                                      .field_type ===
                                                  'radio' ? (
                                                    <>
                                                        <Form.Item
                                                            name={`${fieldItem.field.id}`}
                                                            valuePropName="checked"
                                                            rules={[
                                                                {
                                                                    required:
                                                                        fieldItem
                                                                            .field
                                                                            .required,
                                                                    message: `Please select an option for ${fieldItem.field.name.toLowerCase()}!`,
                                                                },
                                                            ]}>
                                                            <Radio.Group
                                                                name={`${fieldItem.field.id}`}
                                                                value={
                                                                    formData[
                                                                        fieldItem
                                                                            .field
                                                                            .id
                                                                    ]
                                                                }>
                                                                {fieldItem.field.radio_label.map(
                                                                    (
                                                                        label,
                                                                        index
                                                                    ) => (
                                                                        <Radio
                                                                            onChange={
                                                                                handleChange
                                                                            }
                                                                            name={`${fieldItem.field.id}`}
                                                                            key={
                                                                                index
                                                                            }
                                                                            checked={
                                                                                formData[
                                                                                    `${fieldItem.field.id}`
                                                                                ]
                                                                                    ? formData[
                                                                                          `${fieldItem.field.id}`
                                                                                      ] ===
                                                                                      label.value
                                                                                    : fieldItem
                                                                                          .entry
                                                                                          .value
                                                                            }
                                                                            value={
                                                                                label.value
                                                                            }>
                                                                            {
                                                                                label.option
                                                                            }
                                                                        </Radio>
                                                                    )
                                                                )}
                                                            </Radio.Group>
                                                        </Form.Item>
                                                    </>
                                                ) : fieldItem.field
                                                      .field_type ===
                                                  'checkbox' ? (
                                                    <>
                                                        <div
                                                            className={`form-group`}
                                                            style={{
                                                                ...(fieldItem
                                                                    .field
                                                                    .checkbox_label
                                                                    .length > 10
                                                                    ? {
                                                                          overflowY:
                                                                              'scroll',
                                                                          maxHeight:
                                                                              '300px',
                                                                          paddingTop:
                                                                              '10px',
                                                                          display:
                                                                              'flex',
                                                                          flexWrap:
                                                                              'nowrap',
                                                                          flexDirection:
                                                                              'column',
                                                                      }
                                                                    : {
                                                                          paddingTop:
                                                                              '10px',
                                                                          display:
                                                                              'flex',
                                                                          flexWrap:
                                                                              'nowrap',
                                                                          flexDirection:
                                                                              'column',
                                                                      }),
                                                            }}>
                                                            {fieldItem.field.checkbox_label.map(
                                                                (
                                                                    label,
                                                                    index
                                                                ) => {
                                                                    const isChecked =
                                                                        formData[
                                                                            fieldItem
                                                                                .field
                                                                                .id
                                                                        ] &&
                                                                        formData[
                                                                            fieldItem
                                                                                .field
                                                                                .id
                                                                        ].includes(
                                                                            label.value
                                                                        ); // Kontrol için value değerini formData içinde ara

                                                                    return (
                                                                        <Checkbox
                                                                            key={
                                                                                index
                                                                            }
                                                                            name={`${fieldItem.field.id}`}
                                                                            value={
                                                                                label.value
                                                                            }
                                                                            checked={
                                                                                isChecked
                                                                            }
                                                                            onChange={() =>
                                                                                toggleCheckbox(
                                                                                    fieldItem
                                                                                        .field
                                                                                        .id,
                                                                                    label.value
                                                                                )
                                                                            }>
                                                                            {fieldItem
                                                                                .field
                                                                                .checkbox_link ? (
                                                                                <a
                                                                                    href={
                                                                                        fieldItem
                                                                                            .field
                                                                                            .checkbox_link
                                                                                    }
                                                                                    target="_blank"
                                                                                    className="text-primary">
                                                                                    {
                                                                                        label.option
                                                                                    }
                                                                                </a>
                                                                            ) : (
                                                                                label.option
                                                                            )}
                                                                        </Checkbox>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </>
                                                ) : null}

                                                {expandedFields.includes(
                                                    fieldItem.field.id
                                                ) && (
                                                    <Form.Item
                                                        name={`${fieldItem.field.id}`}
                                                        valuePropName=""
                                                        rules={[
                                                            {
                                                                required:
                                                                    fieldItem
                                                                        .field
                                                                        .required,
                                                                message: `Please input your ${fieldItem.field.name.toLowerCase()}!`,
                                                            },
                                                        ]}>
                                                        <TextArea
                                                            name={`${fieldItem.field.id}.note`}
                                                            className="w-full"
                                                            placeholder="Note"
                                                            value={
                                                                formData[
                                                                    `${fieldItem.field.id}.note`
                                                                ]
                                                                    ? formData[
                                                                          `${fieldItem.field.id}.note`
                                                                      ]
                                                                    : fieldItem
                                                                          .entry
                                                                          .note
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                        />
                                                    </Form.Item>
                                                )}
                                            </>
                                        )
                                    )}
                                </>
                            ))}
                        </div>

                        <div className="d-flex justify-content-between w-100">
                            <Button
                                variant="primary"
                                onClick={handleEdit}
                                type="submit">
                                Edit
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            <Button onClick={onCancel}>Cancel</Button>
        </div>
    );
};

export default EditProduct;
