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



export {Router as productRouter}