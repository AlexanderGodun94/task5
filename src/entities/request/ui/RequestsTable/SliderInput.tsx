import React, { useState, useEffect } from "react";

interface Props {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
}

interface SliderInputProps {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}



const SliderInput: React.FC<Props> = ({ min, max, step, value, onChange }) => {
    const [inputValue, setInputValue] = useState(value);

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value);
        onChange(newValue);
    };

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value);
        if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            setInputValue(newValue);
            onChange(newValue);
        }
    };

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value);
        setInputValue(newValue);
        onChange(newValue);
    };

    return (
        <div>
            <input type="range" value={value} min={min} max={max} step={step} onChange={handleOnChange} />
            <span>{value}</span>

        </div>
    );
};

export default SliderInput;
