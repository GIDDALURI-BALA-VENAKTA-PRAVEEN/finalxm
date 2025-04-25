import express from 'express';
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from 'crypto';


dotenv.config();

const router = express.Router();

// ✅ Razorpay instance with environment variables
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

// ✅ ROUTE 1: Create Order
router.post('/order', async (req, res) => {
    const { amount } = req.body;  // ✅ Extract amount properly

    try {
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "Valid amount is required." });
        }

        const amountInPaise = Number(amount) * 100;  // ✅ Convert INR to Paise

        const options = {
            amount: amountInPaise,   // ✅ Use the converted amount
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        const order = await razorpayInstance.orders.create(options);
        console.log("Order created:", order);

        res.status(201).json({
            success: true,
            data: order,
        });

    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});



// router.post('/order', async (req, res) => {
//     const amount = 10000;  // ✅ Hardcoded amount

//     try {
//         if (!amount) {
//             return res.status(400).json({ message: "Amount is required." });  // ✅ Remove currency from the message
//         }

//         const options = {
//             amount: Number(amount * 100),  // Convert to paise
//             currency: "INR",               // ✅ Hardcoded currency
//             receipt: crypto.randomBytes(10).toString("hex"),
//         };

//         const order = await razorpayInstance.orders.create(options);
//         console.log("Order created:", order);

//         res.status(201).json({
//             success: true,
//             data: order,
//         });

//     } catch (error) {
//         console.error("Order creation failed:", error);
//         res.status(500).json({ message: "Internal Server Error!" });
//     }
// });

// ✅ ROUTE 2: Verify Payment
router.post('/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        const isAuthentic = expectedSign === razorpay_signature;

        if (isAuthentic) {
            const payment = new Payment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            await payment.save();
            res.json({ message: "Payment Successful" });
        } else {
            res.status(400).json({ message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Verification failed:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

export default router;
