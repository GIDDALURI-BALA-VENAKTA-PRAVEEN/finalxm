import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { motion, AnimatePresence } from "framer-motion";

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
  const [orderData, setOrderData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
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

  // useEffect(() => {
  //   try {
  //     const response =  axios.get(
  //       `http://localhost:4000/api/user/profile?email=${storedUser.email}`
  //     );
  //     // setUser(response.data);
      
  //     // localStorage.setItem("user", JSON.stringify(response.data));
  //   } catch (error) {
  //     console.error("Error fetching profile:", error);
  //     alert("Failed to load profile. Redirecting to login...");
  //     navigate("/");
  //   }
  // },[]);
    

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

      const orderResponse = await axios.post("http://localhost:4000/api/payment/order", {
        amount: selectedDenomination,
        currency: "INR",

      });

      const orderData = orderResponse.data.data;

      if (!orderData || !orderData.id) {
        alert("Failed to create order. Please try again.");
        setIsPaymentProcessing(false);
        return;
      }

      const options = {
        key: "rzp_test_lqwCQUylHVfPtp",
        amount: parseInt(selectedDenomination) * 100,
        currency: "INR",
        name: product?.name || "Product",
        description: product?.shortDescription || "Purchase",
        image: product?.images?.base || "/placeholder-image.jpg",
        order_id: orderData.id,
        handler: async (response: any) => {
          setIsPaymentProcessing(false);
          try {
            const verifyResponse = await axios.post("http://localhost:4000/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              try {
                const orderApiResponse = await axios.post("http://localhost:4000/api/order/place-order", {
                  sku: product?.sku,
                  price: selectedDenomination,
                  razorpay_order_id: response.razorpay_order_id,
                });
              
                const orderData = orderApiResponse.data.data; 
                const card = orderApiResponse.data.data.cards[0];
                // const payment = orderApiResponse.data.data.payment[0];
                // alert(JSON.stringify(card, null, 2));
                // alert(JSON.stringify(orderData, null, 2));


                setOrderData(card); 
                // alert(orderData.message);
                setShowSuccessModal(true); 
              
              } catch (err) {
                console.error("Order placement failed:", err);
                alert("Failed to place order.");
              }
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Verification failed. Please try again.");
          }
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
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading product details...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center text-gray-600">Product not found</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* <div> {storedUser.email}</div> */}
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
              {product.price.currency.symbol}
              {product.price.min} - {product.price.currency.symbol}
              {product.price.max}
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

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          Back to Products
        </button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ y: "-100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
            >
              <h2 className="text-xl font-bold mb-4 text-green-600">Payment & Order Successful!</h2>
              {orderData ? (
                <div className="text-sm text-gray-700 space-y-2">

                  {/* <p><strong>Order ID:</strong> {orderData.orderId || "N/A"}</p> */}
                  <p><strong>SKU:</strong> {orderData.sku}</p>
                  <p><strong>Product Name:</strong> {product.name}</p>
                  <p><strong>Price:</strong> ₹{orderData.amount}</p>
                  <p><strong>Card Number:</strong> {orderData.cardNumber}</p>
                  <p><strong>Card Type:</strong> {orderData.cardPin}</p>
                  <p><strong>Card validity:</strong> {orderData.validity}</p>
                  <p><strong>Card IssueDate:</strong> {orderData.issuanceDate}</p>
                  

                  <p><strong>Status:</strong> {orderData.status || "Confirmed"}</p>
                </div>
              ) : (
                <p>Loading order details...</p>
              )}
              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
export { ProductDetails };
export type { Product };
