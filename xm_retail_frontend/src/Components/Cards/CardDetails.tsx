import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SimilarCards from "./SimilarCards";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
interface CardDetailsType {
  _id: string;
  name: string;
  image: string;
  category: string;
  cashback: string;
  price: number;
  amounts: number[];
  discountedPrice: number;
  validityMonths: number;
}


const CardDetails = () => {
  

 
  const { id } = useParams();
  const [card, setCard] = useState<CardDetailsType | null>(null);
  const [similarCards, setSimilarCards] = useState<CardDetailsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const apiUrl = import.meta.env.VITE_APP_SERVER_BASE_URL;
  const razorpayKey = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;

  // Handle Amount Change
  const handleAmountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAmount(Number(event.target.value) || null);
  };

  // Model close bnt
  const closeModal = () => { setShowRedeemModal(false);  setShowNotesModal(false);};

  // Fetch Card Details
  const fetchCard = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/cards/${id}`);
      setCard(response.data);
      fetchSimilarCards(response.data.category);
    } catch (err) {
      setError((err as Error).message || "Failed to fetch card details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Similar Cards
  const fetchSimilarCards = async (category: string) => {
    try {
      const response = await axios.get(`${apiUrl}/api/cards/category/${category}`);
      const filteredCards = response.data.filter((c: CardDetailsType) => c._id !== id);
      setSimilarCards(filteredCards);
    } catch (err) {
      console.error("Failed to fetch similar products:", err);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Invalid card ID");
      setLoading(false);
      return;
    }
    fetchCard();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!card) return <p className="text-center text-gray-500 mt-10">No card found.</p>;

// Here if we select 10000=>   10000 * 100-45/100 ==> 5500
  const discountedAmount = selectedAmount ? (selectedAmount * (100 - Number(card.cashback))) / 100 : 0;

  // Handle Payment
  const handlePayment = async () => {
    if (!selectedAmount) {
      toast.error("Please select an amount before proceeding.");
      return;
    }

    try {
      
      const response = await axios.post(`${apiUrl}/api/payment/order`, {
        amount: discountedAmount ,
        currency: "INR",
      });
      console.log(response.data);

      const { id: orderId, amount } = response.data.data;
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const razorpayOptions = {
        key: razorpayKey,
        amount: amount,
        currency: "INR",
        name: "XM Retail",
        description: `Purchase of ${card.name} Gift Card`,
        order_id: orderId,
        handler: async (response: any) => {
          console.log("Payment successful:", response);
          toast.success("Payment successful!");
        },
        prefill: {
          name: storedUser.name||"Bala Venkata Praveen Giddaluri",
          email: storedUser.email,
          contact: storedUser.phone
        },
        theme: {
          color: "#f97316",
        },
      };

      const loadRazorpay = (src: string) => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };
      
      const isScriptLoaded = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay.");
        return;
      }
  
      const razorpay = new (window as any).Razorpay(razorpayOptions);
      razorpay.open();
  
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to initiate payment.");

    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-12">
      <Toaster />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex flex-wrap items-center gap-1 mb-6">
        <Link to="/home" className="text-orange-500 hover:underline">Home</Link>
        <span>&gt;</span>
        <span className="font-semibold text-gray-700">{card.name} Gift Card</span>
      </div>

      {/* Card Details */}
      <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="space-y-4">
          <img
            src={`${apiUrl}/uploads/${card.image}`}
            alt={card.name}
            className="w-full h-64 object-contain rounded-lg border"
          />
          <div className="text-sm text-gray-600 space-y-1 text-center lg:text-left">
            
            <p>Vendor: <span className="font-medium">xmretail</span></p>
            <p>Valid for up to <span className="font-medium">{card.validityMonths} months</span></p>
          </div>
          <div className="flex justify-center lg:justify-start gap-4">
            <button
              onClick={() => setShowRedeemModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600"
            >
              How To Redeem
            </button>
            <button
              onClick={() => setShowNotesModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600"
            >
              Points to Note
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6 text-center lg:text-right">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{card.name}</h2>
            <p className="text-red-500 text-xl font-bold mt-1">{card.cashback}% Off</p>
            <p className="text-3xl font-bold text-gray-700 mt-2">₹ {card.price}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Select Amount:</h3>
            <select
              value={selectedAmount ?? ""}
              onChange={handleAmountChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="" disabled>Select an amount</option>
              {card.amounts.map((amount, index) => (
                <option key={index} value={amount}>₹{amount}</option>
              ))}
            </select>
          </div>

          {selectedAmount && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-600">You pay only</p>
              <p className="text-2xl font-bold text-gray-800">₹ {discountedAmount.toFixed(2)}</p>
              
              {/* Buy Now Button */}
              <button
                onClick={handlePayment}
                className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 mt-4"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>

           {/* Redeem Modal */}
           <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg w-[90%] md:w-[700px] lg:w-[900px] relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold mb-4">How to Redeem</h2>
              <p className="text-gray-600">
                Follow the steps below to redeem your gift card:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Go to the vendor's website.</li>
                <li>Select the products you want.</li>
                <li>Enter the gift card code at checkout.</li>
                <li>Enjoy your discount!</li>
              </ul>
              <button
              onClick={() => setShowRedeemModal(false)}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            >
              Close
            </button>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points to Note Modal */}
      <AnimatePresence>
        {showNotesModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg w-[90%] md:w-[700px] lg:w-[900px] relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold mb-4">Points to Note</h2>
              <p className="text-gray-600">
                Here are some important points to consider:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>The gift card is valid for 12 months.</li>
                <li>It cannot be exchanged for cash.</li>
                <li>Only one gift card can be used per order.</li>
                <li>Non-refundable after purchase.</li>
              </ul>
              <button
              onClick={() => setShowNotesModal(false)}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            >
              Close
            </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SimilarCards category={card.category} currentCardId={card._id} />
    </div>
  );
};

export default CardDetails;
