import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CartItems } from "../entity/CartItems";

export class CartController {
    static async saveCartItem(req: Request, res: Response) {
        try {

            const {items} = req.body;
            const { product_id, quantity } = items[0];
            
            const currentUser = req["currentUser"];

            console.log("product id ", product_id);
            console.log("quantity ", quantity);

            const cartItemRepository = AppDataSource.getRepository(CartItems);

            // Check if item already exists in cart
            const existingItem = await cartItemRepository.findOne({
                where: {
                    userId: currentUser.id,
                    productId: product_id
                }
            });

            if (existingItem) {
                // Update quantity if item exists
                existingItem.quantity += quantity;
                const updatedItem = await cartItemRepository.save(existingItem);
                return res.status(200).json({ message: "Cart item updated", data: updatedItem });
            }

            // Create new cart item
            const cartItem = new CartItems();
            cartItem.userId = currentUser.id;
            cartItem.productId = product_id;
            cartItem.quantity = quantity;

            const savedCartItem = await cartItemRepository.save(cartItem);
            return res.status(201).json({ message: "Cart item added", data: savedCartItem });

        } catch (error) {
            console.error("Failed to save cart item:", error);
            return res.status(500).json({ message: "Error saving cart item" });
        }
    }

    static async getCartItemsByPersonID(req: Request, res: Response) {
        try {
            const currentUser = req["currentUser"];
            const cartItemRepository = AppDataSource.getRepository(CartItems);

            const cartItems = await cartItemRepository.find({
                where: { userId: currentUser.id },
                relations: ["product"],
                order: { addedAt: "DESC" }
            });

            return res.status(200).json({ data: cartItems });
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
            return res.status(500).json({ message: "Error retrieving cart items" });
        }
    }

    static async deleteCartItemById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const currentUser = req["currentUser"];
            const cartItemRepository = AppDataSource.getRepository(CartItems);

            // Find the cart item and verify ownership
            const cartItem = await cartItemRepository.findOne({
                where: { 
                    id: id,
                    userId: currentUser.id 
                }
            });

            if (!cartItem) {
                return res.status(404).json({ message: "Cart item not found or unauthorized" });
            }

            await cartItemRepository.remove(cartItem);
            return res.status(200).json({ message: "Cart item deleted successfully" });

        } catch (error) {
            console.error("Failed to delete cart item:", error);
            return res.status(500).json({ message: "Error deleting cart item" });
        }
    }
} 