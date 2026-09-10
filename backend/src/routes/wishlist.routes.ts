import { Router } from 'express';
import { wishlistController, addWishlistSchema } from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';

const router = Router();

// All wishlist operations require an authenticated user session
router.use(requireAuth);

router.get('/', wishlistController.getWishlist);
router.post('/', validateBody(addWishlistSchema), wishlistController.addToWishlist);
router.delete('/:movieId', wishlistController.removeFromWishlist);
router.get('/check/:movieId', wishlistController.checkStatus);

export default router;
