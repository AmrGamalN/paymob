import CarRoutes from './routes/car/car.route';
import CategoryRoutes from './routes/car/category.route';
import WishlistRoutes from './routes/car/wishlist.route';
import OrdertRoutes from './routes/car/order.route';
import BookingtRoutes from './routes/car/booking.route';
import express, { Request, Response } from 'express';
const router = express.Router();

router.get('/health-check', (req: Request, res: Response) => {
  res.send('Server is running');
});

router.use('/cars', CarRoutes);
router.use('/categories', CategoryRoutes);
router.use('/wishlists', WishlistRoutes);
router.use('/orders', OrdertRoutes);
router.use('/bookings', BookingtRoutes);

export default router;
