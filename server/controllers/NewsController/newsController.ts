import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { News } from '../../models/News';

// Add this interface to properly type the request with file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const getNews = async (req: Request, res: Response) => {
  try {
    const news = await News.find({
      order: {
        date_creation: 'DESC'
      }
    });
    res.json(news);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getNewsById = async (req: Request, res: Response) => {
  try {
    const news = await News.findOneBy({ id: req.params.id });
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json(news);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const addNews = async (req: MulterRequest, res: Response) => {
  try {
    const { titre, contenu } = req.body;
    
    // Create a new News instance directly
    const news = new News();
    news.titre = titre;
    news.contenu = contenu;
    news.image_url = req.file ? `/uploads/${req.file.filename}` : ''; // Use empty string instead of null
    
    // Save the new instance
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const updateNews = async (req: MulterRequest, res: Response) => {
  try {
    const news = await News.findOneBy({ id: req.params.id });
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    
    // If there's a new image, delete the old one
    if (req.file && news.image_url) {
      const oldImagePath = path.join(__dirname, '../../../', news.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update with new data
    Object.assign(news, {
      ...req.body,
      image_url: req.file ? `/uploads/${req.file.filename}` : news.image_url
    });
    
    await news.save();
    res.json(news);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    const news = await News.findOneBy({ id: req.params.id });
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    
    // Delete the image file if it exists
    if (news.image_url) {
      const imagePath = path.join(__dirname, '../../../', news.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await news.remove();
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};