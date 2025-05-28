import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from "typeorm";

import { Order} from "../entity/Order";
import { Product } from "../entity/Product";

  @Entity({name:"order_items"})
  export class OrderItem{
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({nullable: false})
    order_id: string;
    @Column({nullable: false})
    product_id: string;
    @Column({nullable: false})
    price_per_unit: Number;   
    @Column({nullable: false})
    quantity: Number;    

    @ManyToOne(() => Order, (order) => order.order_items)
    @JoinColumn({ name: 'order_id' })
    order: Order;


    @ManyToOne(() => Product)
    @JoinColumn({ name: "product_id" })
    product: Product;

  }