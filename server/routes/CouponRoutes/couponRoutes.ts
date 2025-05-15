import express from 'express';
import { 
  getCoupons, 
  getCouponById, 
  addCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponByCode
} from '../../controllers/CouponController/couponController';

const router = express.Router();

router.get('/', getCoupons);
// Add route to get coupon by code - this should come before the /:id route to avoid conflicts
router.get('/:code([a-zA-Z0-9]+)', getCouponByCode as express.RequestHandler);
router.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', getCouponById as express.RequestHandler);
router.post('/', addCoupon as express.RequestHandler);
router.put('/:id', updateCoupon as express.RequestHandler);
router.delete('/:id', deleteCoupon as express.RequestHandler);
// Add the validate coupon route
router.post('/validate', validateCoupon as express.RequestHandler);

export default router;