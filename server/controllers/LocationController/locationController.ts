import { Request, Response } from 'express';
import { Location } from '../../models/Location';
import fs from 'fs';
import path from 'path';

// Add this interface to properly type the request with file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const location = await Location.findOneBy({ id: req.params.id });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const addLocation = async (req: MulterRequest, res: Response) => {
  try {
    const location = Location.create(req.body);
    
    // Add image URL if file was uploaded
    if (req.file) {
      location.url_image = `/uploads/${req.file.filename}`;
    }
    
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const updateLocation = async (req: MulterRequest, res: Response) => {
  try {
    const location = await Location.findOneBy({ id: req.params.id });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    
    // If there's a new image, delete the old one
    if (req.file && location.url_image) {
      const oldImagePath = path.join(__dirname, '../../../', location.url_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update with new data
    Location.merge(location, req.body);
    
    // Update image URL if a new file was uploaded
    if (req.file) {
      location.url_image = `/uploads/${req.file.filename}`;
    }
    
    await location.save();
    res.json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const location = await Location.findOneBy({ id: req.params.id });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    
    // Delete the image file if it exists
    if (location.url_image) {
      const imagePath = path.join(__dirname, '../../../', location.url_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await location.remove();
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};