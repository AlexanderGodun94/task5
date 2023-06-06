import SliderInput from "./SliderInput";

interface InputFieldProps {
    value: string;
    onChange: (value: string) => void;
}

const InputField = ({ value, onChange }: InputFieldProps) => {
    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        onChange(newValue);
    };

    return (
        <div>
            <input type="number" value={value} min={0} max={1000} step={1} onChange={handleOnChange} />
        </div>
    );
};

export default InputField;
