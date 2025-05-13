import React, { useState } from "react";
import CardApp from "./Components/Cards/CardApp";
import Categorycards from "./Components/Cards/categorycards";
import Product from "./Components/Cards/WoohooAllCards";
import Carousel from "./Components/Carousel/Carousels";
import Category from "./Components/categories/Category";
import Nav from "./Components/NavBar/Nav";
import "./App.css";

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  return (
    <>
      <Nav />

      {/* Main Banner/Slider */}
      <Carousel />

      {/* Top Category Selectors (with click handlers) */}
      <Category setSelectedCategory={setSelectedCategory} />

      {/* Product Cards based on selected category */}
      <CardApp selectedCategory={selectedCategory} />

      {/* Category Highlights */}
      <Categorycards />

      {/* Woohoo All Cards Section */}
      <Product />
    </>
  );
};

export default App;
