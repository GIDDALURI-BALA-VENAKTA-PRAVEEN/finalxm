import axios from 'axios';
import { generateWoohooSignature } from '../generateSignature.js';

const woohoocatalog = 'https://sandbox.woohoo.in/rest/v3/catalog/products';

export const getWoohooProducts = async (req, res) => {
  try {
    const method = 'GET';
    const { signature, dateAtClient } = generateWoohooSignature(
      woohoocatalog,
      method,
      process.env.clientSecret
    );

    const response = await axios.get(woohoocatalog, {
      headers: {
        Authorization: `Bearer ${process.env.bearerToken}`,
        signature,
        dateAtClient,
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(`Woohoo API error: ${error.message}`);
    res.status(500).json({ error: 'woohoo API failed', details: error.message });
  }
};
