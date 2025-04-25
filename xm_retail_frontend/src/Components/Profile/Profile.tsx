import  { useEffect, useState } from "react";

import { FaUserCircle } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";



export default function Profile( ) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [isEditing, setIsEditing] = useState(false);
  const apiUrl = import.meta.env.VITE_APP_SERVER_BASE_URL; 
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/user/profile?email=${storedUser.email}`
        );
        setUser(response.data);
        
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Failed to load profile. Redirecting to login...");
        navigate("/");
      }
    };
    if (storedUser.email) fetchUserProfile();
    else {
      alert("No user data found. Redirecting to login...");
      navigate("/");
    }
  }, [navigate, storedUser.email]);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      await axios.put(`${apiUrl}/api/user/update-profile`, user);
      localStorage.setItem("user", JSON.stringify(user));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Try again.");
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage")); // Trigger update in Nav
    window.location.href = "/"; // Redirect to home
    
  };
  

  return (

    
    <div className="p-6 bg-gray-100 min-h-screen">

      
      {/* Breadcrumb */}
      <div className="text-gray-500 text-sm mb-4">
        <span
          className="text-orange-500 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Home
        </span>{" "}/ <span className="font-semibold">Profile Page</span>
      </div>

      {/* Profile Section */}
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <FaUserCircle className="text-6xl text-gray-400" />
          <div>
            <h2 className="text-xl font-bold">
              Welcome <span className="text-orange-500">{user.name}</span> 👋
            </h2>
            {!isEditing && (
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                <IoCall /> {user.phone || "Not Provided"}
                <MdEmail /> {user.email}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Save Profile
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Edit Profile
            </button>
          )}
          <button className="border border-gray-300 px-4 py-2 rounded-lg">
            Contact Us
          </button>
        </div>

        {isEditing && (
          <div className="mt-6">
            <label className="block text-gray-600">Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full border p-2 rounded-lg mt-2"
            />

            <label className="block text-gray-600 mt-4">Email</label>
            <input
              type="text"
              value={user.email}
              className="w-full border p-2 rounded-lg mt-2"
              disabled
            />

<label className="block text-gray-600 mt-4">Phone</label>
<input
  type="text"
  value={user.phone}
  onChange={(e) => {
    const input = e.target.value;
    if (/^\d{0,10}$/.test(input)) {
      setUser({ ...user, phone: input });
    }
  }}
  className="w-full border p-2 rounded-lg mt-2"
/>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="mt-6 bg-purple-600 text-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto flex justify-between">
        <div>
          <p className="text-sm">Total Savings</p>
          <h3 className="text-2xl font-bold">₹0</h3>
        </div>
        <div>
          <p className="text-sm">Total Bought</p>
          <h3 className="text-2xl font-bold">0</h3>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg">
          View Refunds
        </button>
      </div>

      {/* My Gift Cards Section */}
      <div className="mt-6 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold">My Gift Cards</h3>
        <div className="mt-4 bg-gray-200 p-6 rounded-2xl flex justify-center">
          <button className="bg-black text-white px-6 py-2 rounded-lg">
            Buy Card +
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-6 max-w-4xl mx-auto text-gray-600 text-sm flex justify-between items-center">
        <div>
          <p>Terms of Service</p>
          <p>Privacy Policy</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      
      </div>
    </div>
  );
}
