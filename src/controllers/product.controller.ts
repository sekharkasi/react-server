import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { ProductReviews } from "../entity/ProductReviews";
import { User } from "../entity/User";
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

    // Product Review CRUD Methods
    static async createProductReview(req: Request, res: Response) {
        try {
            const { product_id, rating, review } = req.body;
            const user_id = req.user?.id; // Assuming user is attached by auth middleware

            if (!user_id) {
                return res.status(401).json({ message: "User not authenticated" });
            }

            if (!product_id || !rating) {
                return res.status(400).json({ message: "Product ID and rating are required" });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }

            // Check if product exists
            const productRepository = AppDataSource.getRepository(Product);
            const product = await productRepository.findOneBy({ id: product_id });
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            // Check if user has already reviewed this product
            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const existingReview = await reviewRepository.findOne({
                where: { user_id, product_id }
            });

            if (existingReview) {
                return res.status(400).json({ message: "You have already reviewed this product" });
            }

            const productReview = new ProductReviews();
            productReview.user_id = user_id;
            productReview.product_id = product_id;
            productReview.rating = rating;
            productReview.review = review;

            await reviewRepository.save(productReview);

            return res.status(201).json({ 
                message: "Product review created successfully", 
                review: productReview 
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getProductReviews(req: Request, res: Response) {
        try {
            const { product_id } = req.params;

            if (!product_id) {
                return res.status(400).json({ message: "Product ID is required" });
            }

            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const reviews = await reviewRepository.find({
                where: { product_id },
                relations: ['user'],
                order: { created_at: 'DESC' }
            });

            // Calculate average rating
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

            return res.status(200).json({ 
                data: reviews,
                averageRating: Math.round(averageRating * 100) / 100,
                totalReviews: reviews.length
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getUserReviews(req: Request, res: Response) {
        try {
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ message: "User not authenticated" });
            }

            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const reviews = await reviewRepository.find({
                where: { user_id },
                relations: ['product'],
                order: { created_at: 'DESC' }
            });

            return res.status(200).json({ data: reviews });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async updateProductReview(req: Request, res: Response) {
        try {
            const review_id = req.params.id;
            const { rating, review } = req.body;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ message: "User not authenticated" });
            }

            if (!rating && !review) {
                return res.status(400).json({ message: "Rating or review is required" });
            }

            if (rating && (rating < 1 || rating > 5)) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }

            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const productReview = await reviewRepository.findOne({
                where: { id: parseInt(review_id), user_id }
            });

            if (!productReview) {
                return res.status(404).json({ message: "Review not found or unauthorized" });
            }

            if (rating) productReview.rating = rating;
            if (review !== undefined) productReview.review = review;

            await reviewRepository.save(productReview);

            return res.status(200).json({ 
                message: "Product review updated successfully", 
                review: productReview 
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async deleteProductReview(req: Request, res: Response) {
        try {
            const review_id = req.params.id;
            const user_id = req.user?.id;

            if (!user_id) {
                return res.status(401).json({ message: "User not authenticated" });
            }

            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const productReview = await reviewRepository.findOne({
                where: { id: parseInt(review_id), user_id }
            });

            if (!productReview) {
                return res.status(404).json({ message: "Review not found or unauthorized" });
            }

            await reviewRepository.remove(productReview);

            return res.status(200).json({ message: "Product review deleted successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllReviews(req: Request, res: Response) {
        try {
            const reviewRepository = AppDataSource.getRepository(ProductReviews);
            const reviews = await reviewRepository.find({
                relations: ['user', 'product'],
                order: { created_at: 'DESC' }
            });

            return res.status(200).json({ data: reviews });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}