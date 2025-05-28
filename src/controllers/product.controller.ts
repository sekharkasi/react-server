import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { encrypt } from "../helpers/encrypt";
import * as cache from "memory-cache";


export class ProductController{
    static async saveProduct(req: Request, res: Response){

        const {product_name, price_per_unit, image, description, active} = req.body;

        const product = new Product();
        product.product_name = product_name;
        product.price_per_unit = price_per_unit;

        // // Convert base64 to Buffer
        // if (image) {
        //     const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
        //     product.image = Buffer.from(base64Data, 'base64');
        // }
        product.image = image;
        product.description = description;
        product.active = active;


        const productDataSource = AppDataSource.getRepository(Product);
        await productDataSource.save(product);


        return res
                .status(200)
                .json({message: "Product Created Succesfully", product});

    }

    static async getProducts(req: Request, res: Response){
        const productRespository = AppDataSource.getRepository(Product);
        const products = await productRespository.find();

        // const formattedProducts = products.map(product => ({
        //     ...product, 
        //     image: product.image? 
        //             `data:image/png;base64,${product.image.toString('base64')}`  
        //             : null
        // }));

        return res.status(200).json({data: products});
    }

    static async getActiveProducts(req: Request, res: Response){
        const productRespository = AppDataSource.getRepository(Product);
        const products = await productRespository.find({
            where:{active:true}
        });


        //  const formattedProducts = products.map(product => ({
        //     ...product, 
        //     image: product.image? 
        //             `data:image/png;base64,${product.image.toString('base64')}`  
        //             : null
        // }));

        return res.status(200).json({data: products});
    }

    static async deleteProduct(req: Request, res: Response){
        try {
            
            const productId = req.params.id;

            const productRespository = AppDataSource.getRepository(Product);

            const product = await productRespository.findOneBy({id: productId});
            if(!product){
                res.status(400).json({message: "Product not found"});
            }
            await productRespository.remove(product);

            return res.status(200).json({message: "Product deleted succesfully"});

        } catch (error) {
            res.status(400).json({message: "Internal server error"});
        }
    }

    static async updateProduct(req: Request, res: Response){
        try {
            console.log("updateProduct", )
            const productId = req.params.id;

            const productRespository = AppDataSource.getRepository(Product);

            const product = await productRespository.findOneBy({id: productId});
            if(!product){
                res.status(400).json({message: "Product not found"});
            }

            console.log(req.body);
            const {product_name, price_per_unit, image, description, active} = req.body;
            console.log(product_name);
            
            product.product_name = product_name;
            product.price_per_unit = price_per_unit;
            product.image = image;
            product.description = description;
            product.active = active;

            await productRespository.update(productId, {
                product_name: product_name,
                price_per_unit: price_per_unit,
                image: image,
                description: description,
                active: active
            });

            return res.status(200).json({message: "Product updated succesfully"});

        } catch (error) {
            console.log(error);
            res.status(400).json({message: "Internal server error"});
        }
    }
}