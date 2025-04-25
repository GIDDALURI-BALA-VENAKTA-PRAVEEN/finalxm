import { getCustomerDetails } from "../controllers/customerController.js";

import express from "express";

const router = express.Router();

router.get("/", getCustomerDetails); // Fetch customer details


export default router;