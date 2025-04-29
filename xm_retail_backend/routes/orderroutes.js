import express from 'express';
import {placeOrder} from '../controllers/WoohooOrderController.js'; 
import { getOrderDetails } from '../controllers/WoohooOrderDetailsController.js'; 
const router = express.Router();

// Route to place Woohoo order
router.post('/place-order',placeOrder);

// Route to get order details by orderId
router.get('/details/:orderId',getOrderDetails);

export default router;
