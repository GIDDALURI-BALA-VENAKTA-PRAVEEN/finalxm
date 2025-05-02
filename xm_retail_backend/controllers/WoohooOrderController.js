import { signature } from "../Woohooservice/signature.js"; 
import axios from "axios";
import dotenv from "dotenv";
import WoohooOrder from "../models/cardorders.js";
import { sequelize } from "../config/db.js";

dotenv.config();

const woohooOrderUrl = `https://sandbox.woohoo.in/rest/v3/orders`;

export const placeOrder = async (req, res) => {
  try {
    const { sku, price, razorpay_order_id } = req.body;

    // Validation
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

    // console.log("Received SKU:", sku);
    // console.log("Received Price:", price);
    // console.log("Received Razorpay Order ID:", razorpay_order_id);

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({
        success: false,
        error: "Invalid price",
        details: "Price should be a number",
      });
    }
    // console.log("Parsed Price:", parsedPrice);
    if (parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid price",
        details: "Price should be greater than 0",
      });
    }
    // console.log("Parsed Price is valid and greater than 0");

    const refno = razorpay_order_id;

    // Payload
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

    // console.log("Payload for Woohoo API:", payload);
    // console.log("Woohoo Order URL:", woohooOrderUrl);
    const method = "POST";
    
    // Generate signature with proper URL handling
    const { signature: generatedSignature, dateAtClient } = signature(
      method,
      woohooOrderUrl,
      payload
    );
    console.log("Generated Signature:", generatedSignature);
    console.log("Date at Client:", dateAtClient);

    // Make the API request
    const response = await axios.post(woohooOrderUrl, payload, {
      headers: {
        Authorization: `Bearer ${process.env.bearerToken}`,
        Signature: generatedSignature,  // Ensure "Signature" key is used
        DateAtClient: dateAtClient,  // Ensure "DateAtClient" key is used
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

    const placed = response.data;
    // console.log("Woohoo API response:", placed);
    // console.log("stroing in db");

    // Save to DB
    const card = placed.cards[0];
    const payment = placed.payments[0];
    // console.log("Card details:", card);
    // console.log("Product details:", placed.products[card.sku]);


    await WoohooOrder.create({
      orderId: placed.orderId,
      refno: placed.refno,
      sku: card.sku,
      productName: card.productName,
      amount: parseFloat(card.amount),
      cardNumber: card.cardNumber,
      cardPin: card.cardPin || "",
      validity: card.validity ? new Date(card.validity) : null,
      issuanceDate: card.issuanceDate ? new Date(card.issuanceDate) : null,
      recipientName: card.recipientDetails?.name || "",
      recipientEmail: card.recipientDetails?.email || "",
      recipientPhone: card.recipientDetails?.mobileNumber || "",
      balance:payment.balance
    });

    console.log("Woohoo API response status:", response.status);
    console.log("Woohoo API response headers:", response.headers);
    console.log("Woohoo API response data:", response.data);

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
