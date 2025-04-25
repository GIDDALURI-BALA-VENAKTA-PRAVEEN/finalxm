import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import enterimg from "./assets/otp.jpeg";
import logo from "./assets/logo.jpeg";
import shop from "./assets/login_home.jpeg";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");

  const [showOtpScreen, setShowOtpScreen] = useState<boolean>(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isOtpInvalid, setIsOtpInvalid] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [showResendButton, setShowResendButton] = useState<boolean>(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const apiUrl = import.meta.env.VITE_APP_SERVER_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (showOtpScreen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [showOtpScreen]);

  useEffect(() => {
    let countdown: number;
    if (showOtpScreen) {
      setTimer(30);
      setShowResendButton(false);
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setShowResendButton(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [showOtpScreen]);

  const requestOtp = async (): Promise<void> => {
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email!");
      return;
    }
    setShowOtpScreen(true);
    try {
      await axios.post(`${apiUrl}/api/auth/send-otp`, { email });
    } catch (error) {
      console.error("Send OTP Error:", error);
      alert("Error sending OTP. Check backend logs.");
    }
  };

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setIsOtpInvalid(false);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") verifyOtp();
  };

  const setInputRef = (el: HTMLInputElement | null, index: number): void => {
    inputRefs.current[index] = el;
  };

  const verifyOtp = async (): Promise<void> => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setIsOtpInvalid(true);
      setOtp(["", "", "", "", "", ""]);
      return;
    }
  
    try {
      const response = await axios.post(`${apiUrl}/api/auth/verify-otp`, {
        email,
        otp: enteredOtp,
      });
  
      if (response.data.message) {
        // Check if the user is new
        const { isNewUser, user, token } = response.data;
  
        if (isNewUser) {
          // If the user is new, show the registration form
          // navigate("/home");
          setShowRegistrationForm(true);
        } else {
          // If the user is not new, save the user and navigate
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token); // Save the token
          navigate("/home");
        }
      } else {
        setIsOtpInvalid(true);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("Verify OTP Error:", error);
      setIsOtpInvalid(true);
      setOtp(["", "", "", "", "", ""]);
    }
  };
  

  const handleResendOtp = (): void => {
    requestOtp();
    setTimer(30);
    const countdowns = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdowns);
          setShowResendButton(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setShowResendButton(false);
  };

  const handleRegistrationSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/user/save-registration`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, phone, pincode }),
      });

      if (!response.ok) throw new Error("Failed to save registration details");

      const data = await response.json();
      const userData = {
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        pincode: data.user.pincode,
        token: "authenticated"
      };

      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/home");
    } catch (error) {
      console.error("Registration submit error:", error);
      alert("Error saving registration details. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 relative">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm text-center">
        {!showOtpScreen ? (
          <>
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            <div className="flex justify-center mb-4">
              <img src={shop} alt="Login Illustration" className="h-32 w-auto object-cover rounded-lg" />
            </div>
            <h2 className="text-lg font-semibold">Welcome</h2>
            <p className="text-gray-500 mb-4">Login with your email</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && requestOtp()}
              className="w-full border border-gray-300 rounded-lg p-2 text-md outline-none"
            />
            <button
              onClick={requestOtp}
              className="w-full bg-black text-white font-semibold py-2 rounded-lg mt-4"
            >
              Request OTP →
            </button>
          </>
        ) : (
          <div>
            <button onClick={() => setShowOtpScreen(false)} className="text-2xl mb-2">←</button>
            <h2 className="text-lg font-semibold">OTP Verification</h2>
            <p className="text-gray-500">OTP sent to {email}</p>
            <div className="flex justify-center my-4">
              <img src={enterimg} alt="OTP Illustration" className="h-32 w-auto object-cover rounded-lg" />
            </div>
            <div className="flex justify-center space-x-2 mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => setInputRef(el, index)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-12 border rounded-lg text-center text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500 ${isOtpInvalid ? "border-red-500" : ""}`}
                />
              ))}
            </div>
            {isOtpInvalid && <p className="text-red-500 text-sm">Invalid OTP. Please try again.</p>}
            <p className="text-gray-600 text-sm mt-2">OTP expires in: {timer}s</p>
            {showResendButton ? (
              <button
                onClick={handleResendOtp}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg mt-2"
              >
                Resend OTP 🔄
              </button>
            ) : (
              <button
                onClick={verifyOtp}
                className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg mt-2"
              >
                Verify OTP ✔
              </button>
            )}
          </div>
        )}
      </div>

      {/* Registration Popup */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-bold mb-2">Complete Registration</h2>
            <p className="text-gray-500 mb-4">Hi {email}, please complete your registration.</p>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-md mb-2"
            />
            <input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-md mb-2"
            />
            <input
              type="text"
              placeholder="Enter your pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-md mb-4"
            />
            <button
              onClick={handleRegistrationSubmit}
              className="w-full bg-black text-white font-semibold py-2 rounded-lg"
            >
              Submit Registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
