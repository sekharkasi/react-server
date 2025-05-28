import * as express from "express";
import { authentification } from "../middleware/authentification";
import { authorization } from "../middleware/authorization";
import { AuthController } from "../controllers/auth.controller";
import { OrderController } from "../controllers/order.controller";
const Router = express.Router();


Router.get(
  "/orders/user/:user_id",
  (req, res, next)=>{
    authentification(req, res, next)
  },
  //authorization(["user", "admin"]),
  (req, res)=> {
    OrderController.getOrdersByPersonID(req, res);
  } 
);

Router.get(
  "/orders",
  (req, res, next)=>{
    authentification(req, res, next)
  },
  //authorization(["user", "admin"]),
  (req, res)=> {
    OrderController.getOrders(req, res);
  } 
);

Router.post("/saveorder",  
    (req, res, next)=>{
        authentification(req, res, next)
    },
    (req, res)=> {        
        OrderController.saveOrder(req, res);
      } 
    );

export { Router as orderRouter };