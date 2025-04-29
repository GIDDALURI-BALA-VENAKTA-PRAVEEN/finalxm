import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("user") !== null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (productSku) {
          const response = await axios.get(`http://localhost:4000/api/woohoo/product/details/${productSku}`);
          const data = response.data;
          if (data) {
            setProduct(data);
            if (data.price?.denominations?.length) {
              setSelectedDenomination(data.price.denominations[0]);
            }
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSku]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDenominationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDenomination(e.target.value);
  };

  const handleBuyNowClick = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!selectedDenomination) {
      alert("Please select a denomination");
      return;
    }

    setIsPaymentProcessing(true);

    try {
      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setIsPaymentProcessing(false);
        return;
      }

      // Create an order
      const orderResponse = await axios.post("http://localhost:4000/api/payment/order", {
        amount:selectedDenomination, // Convert to paise
        currency: "INR",
      });

      const orderData = orderResponse.data.data;

      if (!orderData || !orderData.id) {
        alert("Failed to create order. Please try again.");
        setIsPaymentProcessing(false);
        return;
      }

      alert(parseInt(selectedDenomination) * 100);
      alert(orderData.id);
      alert(orderData.amount);
      alert(orderData.currency);
      alert("rzp_test_2NV3jO0RkTKRVr");


      const options = {
        key:"rzp_test_2NV3jO0RkTKRVr", 
        amount: parseInt(selectedDenomination) * 100, 
        currency: "INR",
        name: product?.name || "Product",
        description: product?.shortDescription || "Purchase",
        image: product?.images?.base || "/placeholder-image.jpg",
        order_id: orderData.id,
        handler: async (response: any) => {
          setIsPaymentProcessing(false);
          alert(`Payment successful! Order ID: ${response.razorpay_order_id}`);
          alert(`Payment ID: ${response.razorpay_payment_id}`);
          alert(`Signature: ${response.razorpay_signature}`);
          alert(`Denomination: ${selectedDenomination}`);
            alert("Payment successful!"); 
            

            // const verifyResponse = await axios.post("http://localhost:4000/api/payment/verify", paymentData);

            // if (verifyResponse.data.message === "Payment Successful") {
            //   alert("Payment Successful!");
            //   navigate(`/order/${orderData.id}`);
            // } else {
            //   alert("Payment verification failed. Please contact support.");
            // }
          // } catch (err) {
          //   console.error("Error verifying payment:", err);
          //   alert("Payment verification failed. Please try again.");
          //   alert("Error verifying payment. Please try again.");
          // }
        },
        prefill: {
          name: "John Doe",
          email: "john.doe@example.com",
          contact: "+919876543210",
        },
        theme: {
          color: "#F37254",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment popup closed");
            setIsPaymentProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading product details...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center text-gray-600">Product not found</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">{product.name}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <img
            src={product.images.base || product.images.thumbnail || "/placeholder-image.jpg"}
            alt={product.name}
            className="w-full h-96 object-cover rounded-xl"
          />
        </div>
        <div className="md:w-2/3">
          <p className="text-lg mb-4">{product.shortDescription}</p>
          <p className="text-sm text-gray-600">{product.description}</p>

          <div className="mt-6">
            <p>
              <strong>Price Range: </strong>
              {product.price.currency.symbol}{product.price.min} - {product.price.currency.symbol}{product.price.max}
            </p>

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
                      {product.price.currency.symbol}{amount}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleBuyNowClick}
              disabled={isPaymentProcessing}
              className={`${
                isPaymentProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-6 py-2 rounded`}
            >
              {isPaymentProcessing ? "Processing..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
