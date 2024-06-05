const TextInput = ({ label, name, placeholder, value, onChange, type = 'text' }) => {
    return (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900">
                {label}
            </label>
            <input
                type={type}
                name={name}
                id={name}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder={placeholder}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default TextInput;
