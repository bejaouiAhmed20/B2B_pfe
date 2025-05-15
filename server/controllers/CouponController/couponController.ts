import { Request, Response } from 'express';
import { Coupon } from '../../models/Coupon';

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({
      order: {
        date_creation: 'DESC'
      }
    });
    res.json(coupons);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getCouponById = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findOneBy({ id: req.params.id });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const addCoupon = async (req: Request, res: Response) => {
  try {
    const { code, reduction, reduction_type, date_fin } = req.body;
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOneBy({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    
    // Create a new Coupon instance
    const coupon = new Coupon();
    coupon.code = code;
    coupon.reduction = reduction;
    coupon.reduction_type = reduction_type;
    coupon.date_fin = new Date(date_fin);
    
    // Save the new instance
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findOneBy({ id: req.params.id });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    
    // If code is being updated, check if the new code already exists
    if (req.body.code && req.body.code !== coupon.code) {
      const existingCoupon = await Coupon.findOneBy({ code: req.body.code });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
    }
    
    // Update with new data
    Object.assign(coupon, {
      ...req.body,
      date_fin: req.body.date_fin ? new Date(req.body.date_fin) : coupon.date_fin
    });
    
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findOneBy({ id: req.params.id });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    
    await coupon.remove();
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Add this new function to validate coupons
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        valid: false, 
        message: "Code coupon requis" 
      });
    }
    
    // Find the coupon by code
    const coupon = await Coupon.findOneBy({ code });
    
    if (!coupon) {
      return res.status(404).json({ 
        valid: false, 
        message: "Code coupon invalide" 
      });
    }
    
    // Check if coupon is expired - Fix the date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const expiryDate = new Date(coupon.date_fin);
    expiryDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Add one day to expiry date to make it valid until end of the expiry date
    expiryDate.setDate(expiryDate.getDate() + 1);
    
    if (today >= expiryDate) {
      return res.status(400).json({ 
        valid: false, 
        message: "Ce coupon a expiré" 
      });
    }
    
    // Coupon is valid
    return res.status(200).json({
      valid: true,
      message: "Coupon valide",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        reduction: coupon.reduction,
        reduction_type: coupon.reduction_type,
        date_fin: coupon.date_fin
      }
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      valid: false,
      message: "Une erreur s'est produite lors de la validation du coupon" 
    });
  }
};

// Add this new function to get coupon by code
export const getCouponByCode = async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    
    // Find the coupon by code
    const coupon = await Coupon.findOneBy({ code });
    
    if (!coupon) {
      return res.status(404).json({ message: "Code coupon invalide" });
    }
    
    // Check if coupon is expired
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const expiryDate = new Date(coupon.date_fin);
    expiryDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Add one day to expiry date to make it valid until end of the expiry date
    expiryDate.setDate(expiryDate.getDate() + 1);
    
    if (today >= expiryDate) {
      return res.status(400).json({ message: "Ce coupon a expiré" });
    }
    
    // Return the coupon
    res.json({
      id: coupon.id,
      code: coupon.code,
      reduction: coupon.reduction,
      reduction_type: coupon.reduction_type,
      date_fin: coupon.date_fin
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération du coupon" });
  }
};
