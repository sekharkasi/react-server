import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Order} from "../entity/Order";
import { OrderItem} from "../entity/OrderItem";
import { encrypt } from "../helpers/encrypt";
import * as cache from "memory-cache";
import { CartItems } from "../entity/CartItems";

export class OrderController{

    static async saveOrder(req: Request, res: Response){
        const currentUser = req["currentUser"];
        const cartItemRepository = AppDataSource.getRepository(CartItems);
        const orderRepository = AppDataSource.getRepository(Order);
        const orderItemRepository = AppDataSource.getRepository(OrderItem);

        // 1. Fetch all cart items for the user, including product info
        const cartItems = await cartItemRepository.find({
            where: { userId: currentUser.id },
            relations: ["product"]
        });

        if (!cartItems.length) {
            return res.status(400).json({ message: "No items in cart" });
        }

        // 2. Prepare order items and calculate total
        let total_amount = 0;
        const orderItems = cartItems.map(cartItem => {
            const orderItem = new OrderItem();
            orderItem.product_id = cartItem.productId;
            orderItem.price_per_unit = cartItem.product.price_per_unit;
            orderItem.quantity = cartItem.quantity;
            total_amount += Number(cartItem.product.price_per_unit) * cartItem.quantity;
            return orderItem;
        });

        // 3. Create and save the order
        const order = new Order();
        order.total_amount = total_amount;
        order.user_id = currentUser.id;
        order.status = "OrderPlaced";
        const savedOrder = await orderRepository.save(order);

        // 4. Assign order_id to each order item and save them
        orderItems.forEach(item => {
            item.order_id = savedOrder.id;
        });
        await orderItemRepository.save(orderItems);

        // 5. Clear the user's cart
        await cartItemRepository.delete({ userId: currentUser.id });

        return res.status(200).json({ message: "Order Created Successfully", savedOrder });
    }

    static async getOrders(req: Request, res: Response) {
        try {
            const OrderRepository = AppDataSource.getRepository(Order);
            // const orders = await OrderRepository.find({
            // relations: ["order_items"],
            // order: { createdAt: "DESC" }, // optional: sorts by most recent
            // });


            if( req["currentUser"].role == "admin"){

                const orders = await AppDataSource
                                    .getRepository(Order)
                                    .createQueryBuilder("order")
                                    .leftJoinAndSelect("order.user", "user")
                                    .leftJoinAndSelect("order.order_items", "order_items")
                                    .leftJoinAndSelect("order_items.product", "Product")
                                    .orderBy("order.createdAt", "DESC")
                                    .getMany();

                        
                return res.status(200).json({ data: orders });
            }
            else{

                const user_id = req["currentUser"].id;

                const orders = await AppDataSource
                                    .getRepository(Order)
                                    .createQueryBuilder("order")
                                    .leftJoinAndSelect("order.user", "user")
                                    .leftJoinAndSelect("order.order_items", "order_items")
                                    .leftJoinAndSelect("order_items.product", "Product")
                                    .where("order.user_id = :userId", {userId : user_id})
                                    .orderBy("order.createdAt", "DESC")
                                    .getMany();
                        
                return res.status(200).json({ data: orders });

            }

        } catch (error) {
            console.error("Failed to fetch orders:", error);
            return res.status(500).json({ message: "Error retrieving orders" });
        }
    }

    static async getOrdersByPersonID(req: Request, res: Response) {
        const { user_id } = req.params;

        try {
            const OrderRepository = AppDataSource.getRepository(Order);
            const orders = await OrderRepository.find({
            where: { user_id },
            relations: ["order_items"],
            order: { createdAt: "DESC" }, // optional: latest first
            });

            return res.status(200).json({ data: orders });
        } catch (error) {
            console.error("Error fetching orders by user_id:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}