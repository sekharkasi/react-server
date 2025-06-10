import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authentification } from "../middleware/authentification";

const router = Router();

// All cart routes require authentication
router.use((req, res, next) => authentification(req, res, next));

// Add item to cart
router.post("/add", CartController.saveCartItem);

// Get user's cart items
router.get("/items", CartController.getCartItemsByPersonID);

// Delete cart item
router.delete("/items/:id", CartController.deleteCartItemById);

export default router; 