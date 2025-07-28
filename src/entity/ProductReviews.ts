import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity({ name: "product_reviews" })
export class ProductReviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", nullable: false })
  user_id: string;

  @Column({ type: "uuid", nullable: false })
  product_id: string;

  @Column({ type: "integer", nullable: false })
  rating: number;

  @Column({ type: "text", nullable: true })
  review: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;
} 