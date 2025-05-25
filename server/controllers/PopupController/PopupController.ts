import { Request, Response } from "express";
import { Popup } from "../../models/Popup";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuration for image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Fix the upload directory path to ensure it's accessible from the server
    const uploadDir = path.join(__dirname, "../../../uploads/popups");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "popup-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// Middleware for image upload
export const uploadPopupImage = upload.single('image');

// Get all popups
export const getAllPopups = async (req: Request, res: Response) => {
  try {
    const popups = await Popup.find({
      order: {
        display_order: "ASC",
        created_at: "DESC",
      },
    });
    res.status(200).json(popups);
  } catch (error) {
    console.error("Error fetching popups:", error);
    res.status(500).json({ message: "Error fetching popups" });
  }
};

// Get active popups
export const getActivePopups = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    const popups = await Popup
      .createQueryBuilder("popup")
      .where("popup.active = :active", { active: true })
      .andWhere(
        "(popup.start_date IS NULL OR popup.start_date <= :currentDate)",
        { currentDate }
      )
      .andWhere(
        "(popup.end_date IS NULL OR popup.end_date >= :currentDate)",
        { currentDate }
      )
      .orderBy("popup.display_order", "ASC")
      .addOrderBy("popup.created_at", "DESC")
      .getMany();
    
    res.status(200).json(popups);
  } catch (error) {
    console.error("Error fetching active popups:", error);
    res.status(500).json({ message: "Error fetching active popups" });
  }
};

// Get popup by ID
export const getPopupById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const popup = await Popup.findOneBy({ id });
    
    if (!popup) {
      return res.status(404).json({ message: "Popup not found" });
    }
    
    res.status(200).json(popup);
  } catch (error) {
    console.error("Error fetching popup:", error);
    res.status(500).json({ message: "Error fetching popup" });
  }
};

// Create a new popup
export const createPopup = async (req: any, res: Response) => {
  try {
    const { title, content, active, type, button_text, button_link, display_order, duration_days, start_date, end_date } = req.body;
    
    // Handle the image file
    let image_url = '';
    if (req.file) {
      // Create the URL path for the uploaded image - ensure it's a web-accessible path
      image_url = `/uploads/popups/${req.file.filename}`;
      console.log("Image uploaded to:", image_url);
    }
    
    // Create the popup with proper type conversions
    const popup = new Popup();
    popup.title = title;
    popup.content = content;
    popup.active = active === undefined ? true : active === 'true';
    // Fix: Use the image_url variable we already set above, don't create a new path
    popup.image_url = image_url;
    popup.type = type || "info";
    popup.button_text = button_text || '';
    popup.button_link = button_link || '';
    popup.display_order = display_order ? parseInt(display_order) : 0;
    popup.duration_days = duration_days ? parseInt(duration_days) : 7;
    popup.start_date = start_date || '';
    popup.end_date = end_date || '';
    
    // Save the popup to the database
    await popup.save();
    
    res.status(201).json(popup);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Update a popup
export const updatePopup = async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const popup = await Popup.findOne({ where: { id } });
    
    if (!popup) {
      return res.status(404).json({ message: 'Popup not found' });
    }
    
    const { title, content, active, type, button_text, button_link, display_order, duration_days, start_date, end_date } = req.body;
    
    // Handle the image file
    if (req.file) {
      // If there's an existing image, you might want to delete it
      if (popup.image_url) {
        const oldImagePath = path.join(__dirname, '../../../', popup.image_url.substring(1));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Update with new image URL
      popup.image_url = `/uploads/popups/${req.file.filename}`;
    }
    
    // Update other fields
    popup.title = title || popup.title;
    popup.content = content || popup.content;
    popup.active = active === undefined ? popup.active : active === 'true';
    popup.type = type || popup.type;
    popup.button_text = button_text !== undefined ? button_text : popup.button_text;
    popup.button_link = button_link !== undefined ? button_link : popup.button_link;
    popup.display_order = display_order !== undefined ? parseInt(display_order) : popup.display_order;
    popup.duration_days = duration_days !== undefined ? parseInt(duration_days) : popup.duration_days;
    popup.start_date = start_date !== undefined ? start_date : popup.start_date;
    popup.end_date = end_date !== undefined ? end_date : popup.end_date;
    
    await popup.save();
    
    res.json(popup);
  } catch (error) {
    console.error('Error updating popup:', error);
    res.status(500).json({ message: 'Error updating popup' });
  }
};

// Delete a popup
export const deletePopup = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const popup = await Popup.findOneBy({ id });
    
    if (!popup) {
      return res.status(404).json({ message: "Popup not found" });
    }
    
    // Delete image if it exists
    if (popup.image_url) {
      const imagePath = path.join(__dirname, "../../../", popup.image_url.substring(1));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Popup.remove(popup);
    res.status(200).json({ message: "Popup deleted successfully" });
  } catch (error) {
    console.error("Error deleting popup:", error);
    res.status(500).json({ message: "Error deleting popup" });
  }
};