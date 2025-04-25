import Image from "../models/imageModel.js";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(path.resolve(), "uploads");

export const uploadImage = async (req, res) => {
  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    const newImage = new Image({ url: imageUrl });
    await newImage.save();
    res.status(201).json({ message: "Image uploaded successfully", url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" });
  }
};



export const getImages = async (req, res) => 
  {
  try {
    let images = await Image.find().limit(9); // Fetch up to 9 images
    const fullImages = Array(9).fill(null).map((_, index) => images[index]?.url || null);
    res.json(fullImages);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { url } = req.body;
    const imagePath = path.join(UPLOADS_DIR, path.basename(url));

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Image.deleteOne({ url });
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete image" });
  }
};
