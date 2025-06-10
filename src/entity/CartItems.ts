import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity({ name: "cart_items" })
export class CartItems {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "user_id", type: "uuid" })
    userId: string;

    @Column({ name: "product_id", type: "uuid" })
    productId: string;

    @Column({ type: "integer" })
    quantity: number;

    @CreateDateColumn({ name: "added_at" })
    addedAt: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Product, { onDelete: "CASCADE" })
    @JoinColumn({ name: "product_id" })
    product: Product;
} 