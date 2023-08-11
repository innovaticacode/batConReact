import React, { useState, useEffect } from 'react';

const MultiRangeSlider = ({
    min,
    max,
    name,
    value,
    handleSliderValuesChange,
}) => {
    const [values, setValues] = useState([min, max]);

    useEffect(() => {
        if (value && Array.isArray(value) && value.length === 2) {
            setValues(value);
        }
    }, []);

    const handleChange = (e) => {
        const index = parseInt(e.target.dataset.index || '0');
        const newValue = [...values];
        newValue[index] = parseFloat(e.target.value);

        if (index === 0 && newValue[0] > newValue[1]) {
            newValue[1] = newValue[0];
        } else if (index === 1 && newValue[1] < newValue[0]) {
            newValue[0] = newValue[1];
        }

        setValues(newValue);
        handleSliderValuesChange(name, newValue);
    };

    return (
        <div className="multi-range-slider">
            <div className="values">
                <span>{values[0]}</span>
                <span> - </span>
                <span>{values[1]}</span>
            </div>
            <div className="slider-label min">{min}</div>
            <div className="slider-label max">{max}</div>
            <input
                type="range"
                min={min}
                step="0.1"
                max={max}
                value={values[0]}
                data-index="0"
                onChange={handleChange}
            />
            <input
                type="range"
                min={min}
                max={max}
                step="0.1"
                value={values[1]}
                data-index="1"
                onChange={handleChange}
            />
        </div>
    );
};

export default MultiRangeSlider;
