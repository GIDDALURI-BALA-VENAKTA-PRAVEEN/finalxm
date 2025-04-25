import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Define the type for the product
interface Product {
  sku: string;
  name: string;
  description: string;
  shortDescription: string;
  price: {
    price: string;
    type: string;
    min: string;
    max: string;
    denominations?: string[];
    currency: {
      code: string;
      symbol: string;
      numericCode: string;
    };
  };
  images: {
    thumbnail: string;
    mobile: string;
    base: string;
    small: string;
  };
  currency: string;
  url: string;
}

const ProductDetails: React.FC = () => {
  const { productSku } = useParams<{ productSku: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDenomination, setSelectedDenomination] = useState<string>("");
  const navigate = useNavigate();

  // Check if the user is logged in (this example assumes a `user` object in localStorage)
  const isLoggedIn = localStorage.getItem("user") !== null;

  useEffect(() => {
    if (productSku) {
      axios
        .get(`http://localhost:4000/api/woohoo/product/details/${productSku}`)
        .then((response) => {
          const data = response.data;
          console.log("Woohoo Product Details API Response:", data);

          if (data) {
            setProduct(data);
            if (data.price?.denominations?.length) {
              setSelectedDenomination(data.price.denominations[0]);
            }
          } else {
            setProduct(null);
            setError("Product not found");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching product details:", error);
          setError("Failed to load product details");
          setLoading(false);
        });
    }
  }, [productSku]);

  const handleDenominationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDenomination(e.target.value);
  };

  const handleBuyNowClick = () => {
    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      navigate("/login");
    } else {
      // Redirect to payment page with the selected denomination
      navigate(`/payment/${product?.sku}/${selectedDenomination}`);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading product details...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center text-gray-600">Product not found</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">{product.name}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="md:w-1/3">
          <img
            src={product.images.base || product.images.thumbnail || "/placeholder-image.jpg"}
            alt={product.name}
            className="w-full h-96 object-cover rounded-xl"
          />
        </div>

        {/* Product Info */}
        <div className="md:w-2/3">
          <p className="text-lg mb-4">{product.shortDescription}</p>
          <p className="text-sm text-gray-600">{product.description}</p>

          <div className="mt-6">
            <p>
              <strong>Price Range: </strong>
              {product.price.currency.symbol}
              {product.price.min} - {product.price.currency.symbol}
              {product.price.max}
            </p>

            {/* Denomination Dropdown */}
            {product.price.denominations && (
              <div className="mt-4">
                <label htmlFor="denomination" className="block mb-1 font-medium">
                  Select Denomination:
                </label>
                <select
                  id="denomination"
                  value={selectedDenomination}
                  onChange={handleDenominationChange}
                  className="border border-gray-300 rounded px-4 py-2"
                >
                  {product.price.denominations.map((amount, index) => (
                    <option key={index} value={amount}>
                      {product.price.currency.symbol}
                      {amount}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleBuyNowClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
