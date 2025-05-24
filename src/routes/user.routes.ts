import * as express from "express";
import { authentification } from "../middleware/authentification";
import { UserController } from "../controllers/user.controller";
import { authorization } from "../middleware/authorization";
import { AuthController } from "../controllers/auth.controller";
const Router = express.Router();



Router.get(
    "/users",
    (req, res, next)=>{
      authentification(req, res, next)
    },
  //   authentification,
  //   authorization(["admin"]),
   (req, res)=> {
      UserController.getUsers(req, res);
   }  
  );
  


// Router.get(
//   "/users",
//   (req, res, next)=>{
//     authentification(req, res, next)
//   },
// //   authentification,
// //   authorization(["admin"]),
//  (req, res)=> {
//     UserController.getUsers(req, res);
//  }  
// );


Router.get(
  "/profile",
  (req, res, next)=>{
    authentification(req, res, next)
  },
  //authorization(["user", "admin"]),
  (req, res)=> {
    UserController.getUsers(req, res);
  } 
);


Router.get(
  "/customers",
  (req, res, next)=>{
    authentification(req, res, next)
  },
  authorization(["admin"]),
  (req, res)=> {
    UserController.getCustomers(req, res);
  } 
);

Router.post("/signup",  
    (req, res)=> {
        console.log('singup call reached!', req.body);
        UserController.signup(req, res);
      } 
    );
Router.post("/login", 
    (req, res)=> {
        AuthController.login(req, res);
      }    
    );

    Router.post("/logout", 
      (req, res)=> {
          AuthController.logout(req, res);
        }    
      );    

    Router.get("/getresponse",  
        (req, res)=> {
            console.log('singup call reached!');
            UserController.getresponse(req, res);
          } 
        );

export { Router as userRouter };