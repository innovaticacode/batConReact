import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import { T } from 'antd/lib/upload/utils';

function CreateProduct({ user }) {
    const [productFormFieldTitles, setProductFormFieldTitles] = useState([]);
    const [productFormFields, setProductFormFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [selectedTitle, setSelectedTitle] = useState();
    const [selectedSubtitle, setSelectedSubtitle] = useState();
    const [getSubtitles, setGetSubtitles] = useState([]);
    const [selectedFormFields, setSelectedFormFields] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const titlesResponse = await axios.get(
                'http://127.0.0.1:8000/api/product_form_field_active_titles'
            );
            setProductFormFieldTitles(titlesResponse.data.data);

            const fieldsResponse = await axios.get(
                'http://127.0.0.1:8000/api/product_form_active_fields'
            );
            setProductFormFields(fieldsResponse.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
        axios
            .get(
                'http://127.0.0.1:8000/api/product_form_field_active_subtitles/',
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            )
            .then((response) => {
                setGetSubtitles(response.data.data);
            });

        // Create a new FormData object to hold filtered values
        const newFormData = {};

        // Filter the form fields based on selected title and subtitle
        const fieldsForTitle = productFormFields.filter(
            (field) =>
                field.product_form_field_title_id === selectedTitle &&
                field.product_form_field_subtitle_id === selectedSubtitle
        );

        // Loop through fields and add non-null .file and .note values
        fieldsForTitle.forEach((field) => {
            const fieldId = field.id;

            if (field.field_type === 'input' && field.input_type === 'file') {
                if (formData[`${fieldId}.file`]) {
                    newFormData[`${fieldId}.file`] =
                        formData[`${fieldId}.file`];
                }
                if (formData[`${fieldId}.note`]) {
                    newFormData[`${fieldId}.note`] =
                        formData[`${fieldId}.note`];
                }
            } else {
                if (formData[`${fieldId}`]) {
                    newFormData[`${fieldId}`] = formData[`${fieldId}`];
                }
                if (formData[`${fieldId}.note`]) {
                    newFormData[`${fieldId}.note`] =
                        formData[`${fieldId}.note`];
                }
            }
        });

        setFormData(newFormData);
    }, [selectedTitle, selectedSubtitle]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        console.log('deneme');

        const requiredFieldsForTitle = selectedFormFields.filter(
            (field) => field.required === true
        );

        const missingFields = requiredFieldsForTitle.filter((field) => {
            const fieldValue = formData[field.id];
            const fileValue = formData[`${field.id}.file`];
            return !fieldValue && !fileValue;
        });

        if (missingFields.length > 0) {
            notification.error({
                message: 'Opp! Something went wrong.',
                description: 'Fill in the required fields !',
                duration: 500,
            });
            return;
        }

        const formDataArray = [];

        const titleId = selectedTitle;

        const titleName = formData[`${titleId}.name`];
        const titleUserId = user?.id;

        if (!titleName || !titleUserId) {
            notification.error({
                message: 'Opp! Something went wrong.',
                description: 'Fill in the required fields !',
                duration: 500,
            });
            return;
        }

        const fieldsForTitle = selectedFormFields.filter(
            (field) =>
                field.product_form_field_title_id === titleId &&
                field.product_form_field_subtitle_id === selectedSubtitle
        );

        const formDataForTitle = {
            product_form_field_title_id: titleId,
            fields: {},
            name: titleName,
            user_id: titleUserId,
        };

        fieldsForTitle.forEach((field) => {
            const fieldId = field.id;
            const noteValue = formData[`${fieldId}.note`];
            const fileValue = formData[`${fieldId}.file`];

            formDataForTitle.fields[`${fieldId}.note`] = noteValue || '';

            if (
                field.field_type === 'input' &&
                field.input_type === 'file' &&
                fileValue
            ) {
                formDataForTitle.fields[`${fieldId}.file`] = fileValue;
                data.append(`${fieldId}.file`, fileValue);
            } else {
                formDataForTitle.fields[fieldId] = formData[fieldId] || '';
            }
        });

        formDataArray.push(formDataForTitle);
        console.log(formData);

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/products',
                { products: formDataArray },
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            if (response.data.status === 201) {
                notification.success({
                    message: 'Success!',
                    description: response.data.message,
                    duration: 500,
                });
                setFormData(new FormData());
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSliderValuesChange = (fieldName, newValues) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldName]: newValues,
        }));
    };

    useEffect(() => {
        if (selectedSubtitle) {
            setSelectedFormFields(
                productFormFields.filter(
                    (field) =>
                        field.product_form_field_subtitle_id ===
                        selectedSubtitle
                )
            );
        }
    }, [selectedTitle, selectedSubtitle]);

    const [currentStep, setCurrentStep] = useState(1);

    const handleTitleSelect = (titleId) => {
        setSelectedTitle(titleId);
    };

    const handleSubtitleSelect = (subtitleId) => {
        setSelectedSubtitle(subtitleId);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleNext = () => {
        if (selectedTitle) {
            setCurrentStep(currentStep + 1);
        } else {
            notification.error({
                message: 'Opp! Something went wrong.',
                description: 'Select at least one title !',
                duration: 500,
            });
        }
    };

    const handleNextSubtitle = () => {
        if (selectedSubtitle) {
            setCurrentStep(currentStep + 1);
        } else {
            notification.error({
                message: 'Opp! Something went wrong.',
                description: 'Select at least one subtitle !',
                duration: 500,
            });
        }
    };

    const getTitleName = () => {
        const title = productFormFieldTitles.find(
            (title) => title.id === selectedTitle
        );
        return title ? title.name : '';
    };

    const getSubtitleName = () => {
        const subtitle = getSubtitles.find(
            (subtitle) => subtitle.id === selectedSubtitle
        );
        return subtitle ? subtitle.name : '';
    };

    const [expandedField, setExpandedField] = useState(null);
    const [expandedFields, setExpandedFields] = useState([]);

    const toggleNoteField = (fieldId) => {
        if (expandedFields.includes(fieldId)) {
            setExpandedFields(expandedFields.filter((id) => id !== fieldId));
        } else {
            setExpandedFields([...expandedFields, fieldId]);
        }
    };

    // const toggleNoteField = (fieldId) => {
    //     if (expandedField === fieldId) {
    //         setExpandedField(null);
    //     } else {
    //         setExpandedField(fieldId);
    //     }
    // };

    return (
        <>
            <div className="ps-page__dashboard">
                <div className=" bg-gray-100 mb-5">
                    <div className="d-flex justify-content-between flex-wrap mt-4">
                        {currentStep === 1 && (
                            <div className="w-full mx-auto w-100">
                                <h3 className="font-bold text-xl text-center mb-5">
                                    Choose Title
                                </h3>
                                <div>
                                    <ul className="w-full list-none mx-auto text-center mt-5 p-0">
                                        {productFormFieldTitles.map((title) => (
                                            <>
                                                <li className="mb-2">
                                                    <Button
                                                        className="selectTitleButton"
                                                        type="button"
                                                        variant={
                                                            title.id ===
                                                            selectedTitle
                                                                ? 'warning'
                                                                : 'secondary'
                                                        }
                                                        value={selectedTitle}
                                                        onClick={() =>
                                                            handleTitleSelect(
                                                                title.id
                                                            )
                                                        }>
                                                        {title.name}
                                                    </Button>
                                                </li>
                                            </>
                                        ))}
                                    </ul>
                                    <div className="w-100">
                                        <Button
                                            onClick={handleNext}
                                            className="float-right right-0">
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <div className="w-full mx-auto w-100">
                                <h3 className="font-bold text-xl text-center mb-5">
                                    Choose Subtitle
                                </h3>
                                <div>
                                    <ul className="w-full list-none mx-auto text-center mt-2 p-0">
                                        {getSubtitles
                                            .filter(
                                                (subtitle) =>
                                                    subtitle.product_form_field_title_id ===
                                                    selectedTitle
                                            )
                                            .map((subtitle) => (
                                                <li
                                                    key={subtitle.id}
                                                    className="mb-2">
                                                    <Button
                                                        className="selectTitleButton"
                                                        type="button"
                                                        variant={
                                                            subtitle.id ===
                                                            selectedSubtitle
                                                                ? 'warning'
                                                                : 'secondary'
                                                        }
                                                        onClick={() =>
                                                            handleSubtitleSelect(
                                                                subtitle.id
                                                            )
                                                        }>
                                                        {subtitle.name}
                                                    </Button>
                                                </li>
                                            ))}
                                    </ul>
                                    <div className="d-flex justify-content-between w-100">
                                        <Button onClick={handleBack}>
                                            Back
                                        </Button>
                                        <Button onClick={handleNextSubtitle}>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {currentStep === 3 && (
                            <div className="w-full mx-auto w-100">
                                <div>
                                    <form
                                        onSubmit={handleSubmit}
                                        encType="multipart/form-data">
                                        <div
                                            key={selectedTitle}
                                            className=" bg-gray-100 mb-5">
                                            <div className="font-bold text-xl mb-3 text-center">
                                                {getTitleName()}
                                            </div>
                                            <div className="font-bold text-xl mb-3 text-center">
                                                {getSubtitleName()}
                                            </div>
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
                                                            name={`${selectedTitle}.name`}
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Name"
                                                            value={
                                                                formData[
                                                                    `${selectedTitle}.name`
                                                                ] || ''
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedFormFields.map((field) => (
                                                <>
                                                    <div className="d-flex justify-content-between mb-3 align-items-center">
                                                        <div>
                                                            {field.name}
                                                            {field.required && (
                                                                <span className="font-bold text-red ml-2">
                                                                    (*)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            onClick={() =>
                                                                toggleNoteField(
                                                                    field.id
                                                                )
                                                            }
                                                            style={{
                                                                backgroundColor: expandedFields.includes(
                                                                    field.id
                                                                )
                                                                    ? '#FF0000'
                                                                    : '#FCB800',
                                                                borderColor: expandedFields.includes(
                                                                    field.id
                                                                )
                                                                    ? '#FF0000'
                                                                    : '#FCB800',
                                                                color: expandedFields.includes(
                                                                    field.id
                                                                )
                                                                    ? 'white'
                                                                    : 'black',
                                                            }}>
                                                            {!expandedFields.includes(
                                                                field.id
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

                                                    {field.note && (
                                                        <span className="mt-3 pt-4">
                                                            Note: {field.note}
                                                        </span>
                                                    )}
                                                    {field.field_type ===
                                                        'input' &&
                                                    field.input_type ===
                                                        'range' ? (
                                                        <MultiRangeSlider
                                                            valuePropName=""
                                                            min={
                                                                field.range_min
                                                            }
                                                            max={
                                                                field.range_max
                                                            }
                                                            name={`${field.id}`}
                                                            handleSliderValuesChange={
                                                                handleSliderValuesChange
                                                            }
                                                        />
                                                    ) : field.field_type ===
                                                          'input' &&
                                                      field.input_type ===
                                                          'file' ? (
                                                        <>
                                                            <>
                                                                {field.file_type ===
                                                                    'single' && (
                                                                    <span className="font-bold">
                                                                        Single
                                                                        File
                                                                        Upload
                                                                    </span>
                                                                )}
                                                                {field.file_type ===
                                                                    'multiple' && (
                                                                    <span className="font-bold">
                                                                        Multiple
                                                                        File
                                                                        Upload
                                                                    </span>
                                                                )}
                                                                <>
                                                                    <Form.Item
                                                                        name={`${field.id}`}
                                                                        valuePropName=""
                                                                        rules={[
                                                                            {
                                                                                required:
                                                                                    field.required,
                                                                                message: `Please input your ${field.name.toLowerCase()}!`,
                                                                            },
                                                                        ]}>
                                                                        <Input
                                                                            style={{
                                                                                paddingTop:
                                                                                    '10px',
                                                                            }}
                                                                            name={`${field.id}`}
                                                                            className="form-control"
                                                                            type="file"
                                                                            placeholder={
                                                                                field.input_placeholder
                                                                            }
                                                                            value={
                                                                                formData[
                                                                                    `${field.id}`
                                                                                ]
                                                                            }
                                                                            accept={
                                                                                field.file_accept
                                                                            }
                                                                            multiple={
                                                                                field.file_type ===
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
                                                    ) : field.field_type ===
                                                      'input' ? (
                                                        <>
                                                            <Form.Item
                                                                name={`${field.id}`}
                                                                valuePropName=""
                                                                rules={[
                                                                    {
                                                                        required:
                                                                            field.required,
                                                                        message: `Please input your ${field.name.toLowerCase()}!`,
                                                                    },
                                                                ]}>
                                                                <Input
                                                                    name={`${field.id}`}
                                                                    className="form-control"
                                                                    type={
                                                                        field.input_type
                                                                    }
                                                                    placeholder={
                                                                        field.input_placeholder
                                                                    }
                                                                    value={
                                                                        formData[
                                                                            `${field.id}`
                                                                        ]
                                                                    }
                                                                    onChange={
                                                                        handleChange
                                                                    }
                                                                />
                                                            </Form.Item>
                                                        </>
                                                    ) : field.field_type ===
                                                      'select' ? (
                                                        <div className="form-group">
                                                            <select
                                                                className="form-control"
                                                                placeholder="Select an option"
                                                                style={{
                                                                    width:
                                                                        '100%',
                                                                }}
                                                                value={
                                                                    formData[
                                                                        `${field.id}`
                                                                    ] ||
                                                                    undefined
                                                                }
                                                                name={`${field.id}`}
                                                                onChange={
                                                                    handleChange
                                                                }>
                                                                {field.select_options.map(
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
                                                    ) : field.field_type ===
                                                      'textarea' ? (
                                                        <Form.Item
                                                            name={`${field.id}`}
                                                            valuePropName=""
                                                            rules={[
                                                                {
                                                                    required:
                                                                        field.required,
                                                                    message: `Please input your ${field.name.toLowerCase()}!`,
                                                                },
                                                            ]}>
                                                            <TextArea
                                                                name={`${field.id}`}
                                                                className="block px-4 py-3 min-w-full xl:min-w-[350px]"
                                                                value={
                                                                    formData[
                                                                        `${field.id}`
                                                                    ] || ''
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                            />
                                                        </Form.Item>
                                                    ) : field.field_type ===
                                                      'radio' ? (
                                                        <>
                                                            <Form.Item
                                                                name={`${field.id}`}
                                                                valuePropName="checked"
                                                                rules={[
                                                                    {
                                                                        required:
                                                                            field.required,
                                                                        message: `Please select an option for ${field.name.toLowerCase()}!`,
                                                                    },
                                                                ]}>
                                                                <Radio.Group
                                                                    name={`${field.id}`}
                                                                    value={
                                                                        formData[
                                                                            field
                                                                                .id
                                                                        ]
                                                                    }>
                                                                    {field.radio_label.map(
                                                                        (
                                                                            label,
                                                                            index
                                                                        ) => (
                                                                            <Radio
                                                                                onChange={
                                                                                    handleChange
                                                                                }
                                                                                name={`${field.id}`}
                                                                                key={
                                                                                    index
                                                                                }
                                                                                checked={
                                                                                    formData[
                                                                                        field
                                                                                            .id
                                                                                    ] &&
                                                                                    formData[
                                                                                        field
                                                                                            .id
                                                                                    ][
                                                                                        label
                                                                                            .value
                                                                                    ]
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
                                                    ) : field.field_type ===
                                                      'checkbox' ? (
                                                        <>
                                                            <div
                                                                className={`form-group`}
                                                                style={{
                                                                    ...(field
                                                                        .checkbox_label
                                                                        .length >
                                                                    10
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
                                                                {field.checkbox_label.map(
                                                                    (
                                                                        label,
                                                                        index
                                                                    ) => {
                                                                        const isChecked =
                                                                            formData[
                                                                                field
                                                                                    .id
                                                                            ] &&
                                                                            formData[
                                                                                field
                                                                                    .id
                                                                            ].includes(
                                                                                label.value
                                                                            ); // Kontrol için value değerini formData içinde ara

                                                                        return (
                                                                            <Checkbox
                                                                                key={
                                                                                    index
                                                                                }
                                                                                name={`${field.id}`}
                                                                                value={
                                                                                    label.value
                                                                                }
                                                                                checked={
                                                                                    isChecked
                                                                                }
                                                                                onChange={() =>
                                                                                    toggleCheckbox(
                                                                                        field.id,
                                                                                        label.value
                                                                                    )
                                                                                }>
                                                                                {field.checkbox_link ? (
                                                                                    <a
                                                                                        href={
                                                                                            field.checkbox_link
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
                                                        field.id
                                                    ) && (
                                                        <Form.Item
                                                            name={`${field.id}`}
                                                            valuePropName=""
                                                            rules={[
                                                                {
                                                                    required:
                                                                        field.required,
                                                                    message: `Please input your ${field.name.toLowerCase()}!`,
                                                                },
                                                            ]}>
                                                            <TextArea
                                                                name={`${field.id}.note`}
                                                                className="w-full"
                                                                placeholder="Note"
                                                                value={
                                                                    formData[
                                                                        `${field.id}.note`
                                                                    ] || ''
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                            />
                                                        </Form.Item>
                                                    )}
                                                </>
                                            ))}
                                        </div>

                                        <div className="d-flex justify-content-between w-100">
                                            <Button
                                                type="button"
                                                onClick={handleBack}>
                                                Back
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={handleSubmit}
                                                type="submit">
                                                Create
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateProduct;
