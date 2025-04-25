import axios from "axios";
import { generateWoohooSignature } from "../generateSignature.js";

const woohooCategoryProducts = (categoryId) =>
  `https://sandbox.woohoo.in/rest/v3/catalog/categories/${categoryId}/products`;

export const getWoohooCategoryProducts = async (req, res) => {
  try {
    const { categoryId } = req.params; // ✅ Use params instead of query
    console.log(`Fetching products for category ID: ${categoryId}`);
    const method = "GET";

    const { signature, dateAtClient } = generateWoohooSignature(
      woohooCategoryProducts(categoryId),
      method,
      process.env.clientSecret
    );

    const response = await axios.get(woohooCategoryProducts(categoryId), {
      headers: {
        Authorization: `Bearer ${process.env.bearerToken}`,
        signature,
        dateAtClient,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

    res.json(response.data);
    console.log(`Woohoo Category Products response: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.log(`Woohoo API error: ${error.message}`);
    res.status(500).json({ error: "Woohoo API failed", details: error.message });
  }
};
