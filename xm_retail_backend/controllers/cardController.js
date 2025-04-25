import Card from "../models/Card.js";
import fs from "fs";
import path from "path";

// @desc Get all cards
export const getCards = async (req, res) => {
  try {
    const cards = await Card.findAll();
    res.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
};



export const createCard = async (req, res) => {
  try {
    const { name, cashback, category, details, validityMonths, amounts } = req.body;

    if (!validityMonths) {
      return res.status(400).json({ message: "Validity (months) is required." });
    }

    const newCard = await Card.create({
      name,
      cashback,
      category,
      details,
      validityMonths,
      amounts: amounts.split(",").map(a => a.trim()), // Convert to array
      image: req.file ? req.file.filename : null,
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc Update a card
export const updateCard = async (req, res) => {
  try {
    const { name, cashback, category, details } = req.body;
    const cardId = req.params.id;

    const existingCard = await Card.findByPk(cardId);
    if (!existingCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    let updatedImage = existingCard.image;
    
    // Check if a new image is uploaded
    if (req.file) {
      // Delete the old image if exists
      if (existingCard.image) {
        const oldImagePath = path.join("uploads", existingCard.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updatedImage = req.file.filename; // Set new image
    }

    // Update the card
    await existingCard.update({
      name,
      cashback,
      category,
      details,
      image: updatedImage,
    });

    res.json({ message: "Card updated successfully", card: existingCard });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
};

// @desc Delete a card
export const deleteCard = async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Delete the image file
    if (card.image) {
      const imagePath = path.join("uploads", card.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await card.destroy;
    res.json({ message: "Card deleted" });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
};


// Fetch cards by category

export const getCardsByCategory = async (req, res) => {
  const { category } = req.params;
  console.log("Category param:", category); // Debug log

  if (!category) {
    return res.status(400).json({ message: "Category parameter is required" });
  }

  try {
    const cards = await Card.findAll({
      where: { category }
    });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cards by category",
      error: error.message,
      stack: error.stack
    });
  }
};


