import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import InputField from "../components/InputField";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    if (e.target.name === "avatar") setAvatar(e.target.files[0]);
    else setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("fullName", fullName);
    data.append("email", email);
    data.append("username", username);
    data.append("password", password);
    data.append("avatar", avatar);
    if (coverImage) data.append("coverImage", coverImage);

    try {
      const res = await axiosInstance.post("/users/register", data);
      setMessage("Registered Successfully ✔️");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow-lg rounded-lg bg-white">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <InputField label="Full Name" type="text" name="fullName" onChange={(e) => setFullName(e.target.value)} />
        <InputField label="Email" type="email" name="email" onChange={(e) => setEmail(e.target.value)} />
        <InputField label="Username" type="text" name="username" onChange={(e) => setUsername(e.target.value)} />
        <InputField label="Password" type="password" name="password" onChange={(e) => setPassword(e.target.value)} />

        <InputField label="Avatar" type="file" name="avatar" onChange={handleFileChange} />
        <InputField label="Cover Image" type="file" name="coverImage" onChange={handleFileChange} />

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
