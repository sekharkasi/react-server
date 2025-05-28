import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
  } from "typeorm";

  import { OrderItem} from "../entity/OrderItem";
  import {User } from "../entity/User";


  @Entity({name:"orders"})
  export class Order{

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid", nullable: false })
    user_id: string;

    @Column({nullable: false})
    total_amount: number;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
    
    @Column({nullable: true})
    status: string;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    order_items: OrderItem[];

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;

  }