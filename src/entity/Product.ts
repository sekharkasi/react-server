import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";

  @Entity({name:"products"})
  export class Product{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    product_name: string;

    @Column({nullable: false})
    price_per_unit: Number;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({type: "bytea", nullable: true})
    image: Buffer;
    
    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    active: Boolean;
  }