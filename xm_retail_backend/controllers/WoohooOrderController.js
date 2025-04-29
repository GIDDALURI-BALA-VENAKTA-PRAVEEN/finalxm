import { generateWoohooSignature } from "../generateSignature.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const woohooOrderUrl = `https://sandbox.woohoo.in/rest/v3/orders`;

export const placeOrder = async (req, res) => {
  try {
    const { sku, price, razorpay_order_id } = req.body;

    // Validation (keep your existing validation code)
    if (!sku || !price || !razorpay_order_id) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters",
        details: !sku
          ? "sku is required"
          : !price
          ? "price is required"
          : "razorpay_order_id is required",
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({
        success: false,
        error: "Invalid price",
        details: "Price should be a number",
      });
    }

    const refno = razorpay_order_id;

    // Payload (keep your existing payload)
    const payload = {
      address: {
        salutation: "Mr.",
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        telephone: "+919876543210",
        line1: "123 Main Street",
        city: "Bangalore",
        region: "Karnataka",
        country: "IN",
        postcode: "560001",
        billToThis: true,
      },
      payments: [
        {
          code: "svc",
          amount: parsedPrice,
          poNumber: `PO-${Date.now()}`,
        },
      ],
      products: [
        {
          sku,
          price: parsedPrice,
          qty: 1,
          currency: 356,
          giftMessage: "Enjoy your gift!",
        },
      ],
      refno,
      remarks: "Synchronous digital gift card order",
      deliveryMode: "API",
      syncOnly: true,
    };

    const method = "POST";
    
    // Generate signature with proper URL handling
    const { signature, dateAtClient } = generateWoohooSignature(
      woohooOrderUrl,
      method,
      process.env.clientSecret
    );

    // Make the API request
    const response = await axios.post(woohooOrderUrl, payload, {
      headers: {
        Authorization: `Bearer ${process.env.bearerToken}`,
        Signature: signature,  // Ensure "Signature" key is used
        DateAtClient: dateAtClient,  // Ensure "DateAtClient" key is used
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

    console.log("Response from Woohoo API:", response.data);
    const result = response.data;
   
    res.status(200).json({
      success: true,
      data: result,
    });

    console.log("Order created successfully:", result);
    console.log("Reference No:", refno);
  } catch (error) {
    console.error("Order creation failed:", error.message);
    console.error("Error details:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: "Order creation failed",
      details: error.response?.data || error.message,
    });
  }
};
