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
} from 'antd';
import MultiRangeSlider from './MultiRangeSlider';

const CompanyRegistrationFormContent = ({
    user,
    updateUserAndActiveAccount,
}) => {
    const [formData, setFormData] = useState({});
    const [selectedFormFields, setSelectedFormFields] = useState([]);
    const [groupFieldsx, setGroupFieldsx] = useState({});

    useEffect(() => {
        fetchData();
    }, [user, selectedFormFields]);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `https://enisreact.innovaticacode.com/laravel/public/api/company_registration_form_active_fields`,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            const datas = response.data.data;

            datas.forEach((element) => {
                element.select_options = JSON.parse(element.select_options);
                element.checkbox_label = JSON.parse(element.checkbox_label);
                element.radio_label = JSON.parse(element.radio_label);
            });

            const requiredFieldsForUser = datas.filter(
                (field) => field.user_type === user.role
            );

            const nullUserTypeFields = datas.filter(
                (field) => field.user_type == null
            );

            setSelectedFormFields([
                ...requiredFieldsForUser,
                ...nullUserTypeFields,
            ]);

            const groups = [];

            selectedFormFields.forEach((field) => {
                if (
                    field.input_group !== undefined &&
                    field.input_group !== null
                ) {
                    if (!groups[field.input_group]) {
                        groups[field.input_group] = [];
                    }
                    groups[field.input_group].push(field);
                } else {
                    if (!groups[0]) {
                        groups[0] = [];
                    }
                    groups[0].push(field);
                }
            });

            setGroupFieldsx(groups);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        console.log(user);
        if (user.companyRegistrationFormEntries.length > 0) {
            const newcompanyRegistrationFormEntries = { ...formData };
            user.companyRegistrationFormEntries.forEach((entry) => {
                newcompanyRegistrationFormEntries[entry.form_field_id] =
                    entry.value;
            });
            setFormData(newcompanyRegistrationFormEntries);
        } else {
            const formData = { ...formData };
            selectedFormFields.forEach((field) => {
                if (
                    field.field_type === 'input' &&
                    field.input_type === 'email'
                ) {
                    formData[field.id] = user.email;
                }
            });
            setFormData(formData);
        }
    }, [user]);

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
            const field = selectedFormFields.find(
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
                        console.log(file);
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
        } else if (type == 'select') {
            console.log(type);
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
                description: 'Fill in the required fields!',
                duration: 500,
            });
            return;
        }

        selectedFormFields.forEach((field) => {
            const fieldId = field.id;
            const fileValue = formData[`${fieldId}.file`];

            if (
                field.field_type === 'input' &&
                field.input_type === 'file' &&
                fileValue
            ) {
                formData[`${fieldId}.file`] = fileValue;
                data.append(`${fieldId}.file`, fileValue);
            } else {
                formData[fieldId] = formData[fieldId] || '';
            }
        });

        formData['user_id'] = user.id;

        try {
            const response = await axios.post(
                'https://enisreact.innovaticacode.com/laravel/public/api/company_registration_entries',
                { entries: formData },
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            if (response.data.status === 201) {
                notification.success({
                    message: 'Success !',
                    description: response.data.message,
                    duration: 500,
                });
                updateUserAndActiveAccount();
            }
        } catch (error) {
            console.error(error);
        }
    };
    const toggleCheckbox = (fieldId, value) => {
        setFormData((prevFormData) => {
            const currentValue = prevFormData[fieldId];

            if (!currentValue) {
                return {
                    ...prevFormData,
                    [fieldId]: [value],
                };
            }

            let valueArray;
            if (
                typeof currentValue === 'string' &&
                currentValue.includes(',')
            ) {
                valueArray = currentValue.split(',').map((item) => item.trim()); // Virgülle ayrılmış metini diziye çevir
            } else {
                valueArray = [currentValue]; // Tekli metini diziye çevir
            }

            if (valueArray.includes(value)) {
                const newValueArray = valueArray.filter((val) => val !== value);
                return {
                    ...prevFormData,
                    [fieldId]:
                        newValueArray.length === 0
                            ? null
                            : newValueArray.join(', '),
                };
            } else {
                const newValueArray = [...valueArray, value];
                return {
                    ...prevFormData,
                    [fieldId]: newValueArray.join(', '),
                };
            }
        });
        console.log(formData);
    };

    const handleSliderValuesChange = (fieldName, newValues) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldName]: newValues,
        }));
    };

    const [searchCheckboxTerms, setSearchCheckboxTerms] = useState({});

    const handleSearchCheckboxChange = (fieldId, value) => {
        setSearchCheckboxTerms((prevSearchTerms) => ({
            ...prevSearchTerms,
            [fieldId]: value,
        }));
    };
    return (
        <>
            <div className="ps-page__dashboard mb-5">
                <h3>Company Registration Form</h3>
                <hr />
                <form
                    onSubmit={handleSubmit}
                    className="mt-5"
                    encType="multipart/form-data">
                    {Object.keys(groupFieldsx).map((key, index) => (
                        <div key={index}>
                            {
                                <>
                                    {key != 0 && (
                                        <>
                                            <h4 className="mt-5 mb-2">
                                                {key != 0 && key}
                                            </h4>
                                            <hr />
                                        </>
                                    )}
                                    {groupFieldsx[key].map((field) => (
                                        <div key={field.id} className="mb-3">
                                            {field.name}{' '}
                                            {field.required && (
                                                <span className="font-bold text-red">
                                                    (*)
                                                </span>
                                            )}
                                            <br />
                                            {field.note && (
                                                <span className="mt-3 pt-4">
                                                    Note: {field.note}
                                                </span>
                                            )}
                                            {field.field_type === 'input' &&
                                            field.input_type === 'range' ? (
                                                <>
                                                    <MultiRangeSlider
                                                        max={field.range_max}
                                                        min={field.range_min}
                                                        handleSliderValuesChange={
                                                            handleSliderValuesChange
                                                        }
                                                    />
                                                    <p>
                                                        {field.range_min} -{' '}
                                                        {field.range_max}
                                                    </p>
                                                </>
                                            ) : field.field_type === 'input' &&
                                              field.input_type === 'file' ? (
                                                <>
                                                    <>
                                                        {field.file_type ===
                                                            'single' && (
                                                            <span className="font-bold">
                                                                Single File
                                                                Upload <br />
                                                                Max Size:{' '}
                                                                {
                                                                    field.file_size
                                                                }{' '}
                                                                <br />
                                                                File Types:{' '}
                                                                {
                                                                    field.file_accept
                                                                }
                                                            </span>
                                                        )}
                                                        {field.file_type ===
                                                            'multiple' && (
                                                            <span className="font-bold">
                                                                Multiple File
                                                                Upload <br />
                                                                Max Size:{' '}
                                                                {
                                                                    field.file_size
                                                                }{' '}
                                                                <br />
                                                                File Types:{' '}
                                                                {
                                                                    field.file_accept
                                                                }
                                                            </span>
                                                        )}
                                                        <>
                                                            <Input
                                                                name={`${field.id}`}
                                                                className="form-control"
                                                                type={file}
                                                                style={{
                                                                    paddingTop: '10px',
                                                                }}
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
                                                        </>
                                                    </>
                                                </>
                                            ) : field.field_type === 'input' ? (
                                                <>
                                                    <Input
                                                        name={`${field.id}`}
                                                        className="form-control"
                                                        type={field.input_type}
                                                        placeholder={
                                                            field.input_placeholder
                                                        }
                                                        value={
                                                            formData[
                                                                `${field.id}`
                                                            ]
                                                        }
                                                        onChange={handleChange}
                                                    />
                                                </>
                                            ) : field.field_type ===
                                              'select' ? (
                                                <>
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
                                                </>
                                            ) : field.field_type ===
                                              'textarea' ? (
                                                <TextArea
                                                    name={`${field.id}`}
                                                    className="block px-4 py-3 min-w-full xl:min-w-[350px]"
                                                    value={
                                                        formData[
                                                            `${field.id}`
                                                        ] || ''
                                                    }
                                                    onChange={handleChange}
                                                />
                                            ) : field.field_type === 'radio' ? (
                                                <>
                                                    <Radio.Group
                                                        name={`${field.id}`}
                                                        value={
                                                            formData[field.id]
                                                        }>
                                                        {field.radio_label.map(
                                                            (label, index) => (
                                                                <Radio
                                                                    onChange={
                                                                        handleChange
                                                                    }
                                                                    name={`${field.id}`}
                                                                    key={index}
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
                                                </>
                                            ) : field.field_type ===
                                              'checkbox' ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        placeholder="Search"
                                                        className="form-control mb-3 mt-3"
                                                        value={
                                                            searchCheckboxTerms[
                                                                field.id
                                                            ] || ''
                                                        }
                                                        onChange={(e) =>
                                                            handleSearchCheckboxChange(
                                                                field.id,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <div
                                                        className={`form-group`}
                                                        style={{
                                                            ...(field
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
                                                        {field.checkbox_label
                                                            .filter((label) =>
                                                                label.option
                                                                    .toLowerCase()
                                                                    .includes(
                                                                        (
                                                                            searchCheckboxTerms[
                                                                                field
                                                                                    .id
                                                                            ] ||
                                                                            ''
                                                                        ).toLowerCase()
                                                                    )
                                                            )
                                                            .map(
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
                                        </div>
                                    ))}
                                </>
                            }
                        </div>
                    ))}
                    <button type="submit" className="ps-btn ">
                        Create Account
                    </button>
                </form>
            </div>
        </>
    );
};

export default CompanyRegistrationFormContent;
