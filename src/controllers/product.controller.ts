import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { encrypt } from "../helpers/encrypt";
import * as cache from "memory-cache";


export class ProductController{
    static async saveProduct(req: Request, res: Response){
        const {product_name, price_per_unit, Image, Description, Active} = req.body;

        const product = new Product();
        product.product_name = product_name;
        product.price_per_unit = price_per_unit;
        product.image = Image;
        product.description = Description;
        product.active = Active;


        const productDataSource = AppDataSource.getRepository(Product);
        await productDataSource.save(product);


        return res
                .status(200)
                .json({message: "Product Created Succesfully", product});

    }

    static async getProducts(req: Request, res: Response){
        const productRespository = AppDataSource.getRepository(Product);
        const products = await productRespository.find();

        return res.status(200).json({data: products});
    }
}