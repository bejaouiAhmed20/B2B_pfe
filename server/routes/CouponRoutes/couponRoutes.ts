import express from 'express';
import { 
  getCoupons, 
  getCouponById, 
  addCoupon, 
  updateCoupon, 
  deleteCoupon,
  validateCoupon
} from '../../controllers/CouponController/couponController';

const router = express.Router();

router.get('/', getCoupons );
router.get('/:id', getCouponById as express.RequestHandler);
router.post('/', addCoupon as express.RequestHandler);
router.put('/:id', updateCoupon as express.RequestHandler);
router.delete('/:id', deleteCoupon as express.RequestHandler);
router.post('/validate', validateCoupon as express.RequestHandler);

export default router;