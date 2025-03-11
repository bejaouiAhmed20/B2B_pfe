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

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    const coupon = await Coupon.findOneBy({ code });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }
    
    // Check if coupon is expired
    const currentDate = new Date();
    if (new Date(coupon.date_fin) < currentDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    
    res.json(coupon);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};