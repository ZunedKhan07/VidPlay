// src/components/InputField.jsx
const InputField = ({ label, type, name, onChange }) => (
    <div className="mb-4">
      <label className="block text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
    </div>
  );
  
  export default InputField;
  