import * as express from "express";
import { authentification } from "../middleware/authentification";
import { authorization } from "../middleware/authorization";
import { ProductController } from "../controllers/product.controller";
const Router = express.Router();

Router.get(
    "/products",
    (req, res, next)=>{
        console.log("products api called AUTENTICATION");
        authentification(req, res, next)
      },
      (req, res, next)=>{
        console.log("products api called AUTHORIZATION");
        authorization(["admin"])( req, res, next);
      },
      (req, res)=> {

        console.log('get products is calling ');
        ProductController.getProducts(req, res);
     } 
)

Router.get(
    "/activeproducts",
    (req, res, next)=>{
        console.log("products api called AUTENTICATION");
        authentification(req, res, next)
      },
      (req, res)=> {

        console.log('get products is calling ');
        ProductController.getActiveProducts(req, res);
     } 
)

Router.post(
    "/add",
    (req, res, next)=>{
        authentification(req, res, next)
      },
      (req, res, next)=>{
        authorization(["admin"])( req, res, next);
      },
      (req, res)=> {
        ProductController.saveProduct(req, res);
     } 
);


Router.delete(
    "/:id",
    (req, res, next)=>{
        console.log("products api called AUTENTICATION");
        authentification(req, res, next)
      },
      (req, res, next)=>{
        console.log("products api called AUTHORIZATION");
        authorization(["admin"])( req, res, next);
      },
      (req, res)=> {

        console.log('get products is calling ');
        ProductController.deleteProduct(req, res);
     } 
)


Router.put(
    "/:id",
    (req, res, next)=>{
        console.log("products api called AUTENTICATION");
        authentification(req, res, next)
      },
      (req, res, next)=>{
        console.log("products api called AUTHORIZATION");
        authorization(["admin"])( req, res, next);
      },
      (req, res)=> {

        console.log('get products is calling ');
        ProductController.updateProduct(req, res);
     } 
)

// Product Review Routes
Router.post(
    "/reviews",
    (req, res, next)=>{
        console.log("product review api called AUTHENTICATION");
        authentification(req, res, next)
      },
      (req, res)=> {
        console.log('create product review is calling ');
        ProductController.createProductReview(req, res);
     } 
)

Router.get(
    "/reviews/:product_id",
    (req, res, next)=>{
        console.log("product review api called AUTHENTICATION");
        authentification(req, res, next)
      },
      (req, res)=> {
        console.log('get product reviews is calling ');
        ProductController.getProductReviews(req, res);
     } 
)

Router.get(
    "/reviews/user/my-reviews",
    (req, res, next)=>{
        console.log("user reviews api called AUTHENTICATION");
        authentification(req, res, next)
      },
      (req, res)=> {
        console.log('get user reviews is calling ');
        ProductController.getUserReviews(req, res);
     } 
)

Router.put(
    "/reviews/:id",
    (req, res, next)=>{
        console.log("update review api called AUTHENTICATION");
        authentification(req, res, next)
      },
      (req, res)=> {
        console.log('update product review is calling ');
        ProductController.updateProductReview(req, res);
     } 
)

Router.delete(
    "/reviews/:id",
    (req, res, next)=>{
        console.log("delete review api called AUTHENTICATION");
        authentification(req, res, next)
      },
      (req, res)=> {
        console.log('delete product review is calling ');
        ProductController.deleteProductReview(req, res);
     } 
)

Router.get(
    "/reviews",
    (req, res, next)=>{
        console.log("all reviews api called AUTHENTICATION");
        authentification(req, res, next)
      },
      (req, res, next)=>{
        console.log("all reviews api called AUTHORIZATION");
        authorization(["admin"])( req, res, next);
      },
      (req, res)=> {
        console.log('get all reviews is calling ');
        ProductController.getAllReviews(req, res);
     } 
)

export {Router as productRouter}