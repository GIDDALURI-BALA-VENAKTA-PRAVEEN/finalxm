import React from "react";
import { useNavigate } from "react-router-dom";
const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white shadow-md p-4">
        <h1 className="text-xl font-bold">Home</h1>
        <button
          onClick={() => navigate("/profile")}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Profile
        </button>
      </nav>

      {/* Categories */}
      <div className="categories mt-6">
        <div className="category-card banking">BANKING</div>
        <div className="category-card sales">BIGGEST SALES</div>
        <div className="category-card electronics">ELECTRONICS</div>
        <div className="category-card mobiles">MOBILES</div>
      </div>

      {/* Main Content */}
      <main className="flex justify-center items-center h-[80vh]">
        <h2 className="text-2xl font-semibold">Welcome to the Home Page!</h2>
      </main>

    </div>
  );
};

export default Home;
