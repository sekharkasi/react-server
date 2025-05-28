import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Order} from "../entity/Order";
import { OrderItem} from "../entity/OrderItem";
import { encrypt } from "../helpers/encrypt";
import * as cache from "memory-cache";

export class OrderController{

    static async saveOrder(req: Request, res: Response){
        const {items} = req.body;
        const currentUser = req["currentUser"];

        console.log("currentUser",currentUser);

        var total_amount =0;

        const orderItems = items.map(i=> {
            const orderItem = new OrderItem();
            //orderItem.order_id = savedOrder.id;
            orderItem.product_id = i.id;
            orderItem.price_per_unit = i.price_per_unit;
            orderItem.quantity = i.quantity;
            total_amount +=  Number(i.price_per_unit) * i.quantity;
            return orderItem;
        });

        const order = new Order();
        order.total_amount = total_amount;
        order.user_id = currentUser.id;
        order.status = "OrderPlaced";
        //order.order_items = orderItems;

        console.log("order to be saved", order);
        const OrderDataSource = AppDataSource.getRepository(Order);

        console.log("currentUser.id", currentUser.id);

        console.log("Final Order Before Save", JSON.stringify(order, null, 2));

        const savedOrder = await OrderDataSource.save(order);

        // const savedOrder = await OrderDataSource.save({
        //      user_id: currentUser.id,
        //      total_amount: total_amount,
        //      status: "OrderPlaced",
        // });

        orderItems.forEach(element => {
            element.order_id = savedOrder.id;
        });

        const OrderItemDataSource = AppDataSource.getRepository(OrderItem);
        await OrderItemDataSource.save(orderItems);

        return res
                .status(200)
                .json({message: "Order Created Succesfully", savedOrder});

    }

    static async getOrders(req: Request, res: Response) {
        try {
            const OrderRepository = AppDataSource.getRepository(Order);
            // const orders = await OrderRepository.find({
            // relations: ["order_items"],
            // order: { createdAt: "DESC" }, // optional: sorts by most recent
            // });

           const orders = await AppDataSource
                            .getRepository(Order)
                            .createQueryBuilder("order")
                            .leftJoinAndSelect("order.user", "user")
                            .leftJoinAndSelect("order.order_items", "order_items")
                            .leftJoinAndSelect("order_items.product", "Product")
                            .orderBy("order.createdAt", "DESC")
                            .getMany();


            return res.status(200).json({ data: orders });

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