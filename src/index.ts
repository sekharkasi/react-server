import { AppDataSource, connectWithRetry } from "./data-source";
import express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { userRouter } from "./routes/user.routes";
import { productRouter } from "./routes/product.routes";
import {errorHandler} from "./middleware/errorhandler";
import cors from "cors";
import cookieParser from 'cookie-parser';
import cartRouter from "./routes/cart.routes";
import { aiRouter } from "./routes/ai.routes";



//import { movieRouter } from "./routes/movie.routes";
import "reflect-metadata";
import { orderRouter } from "./routes/order.routes";

require('dotenv').config();
dotenv.config();



const app = express();


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true   
}));


app.use(express.json());
app.use(
    (error, req, res, next)=>{
        errorHandler(error, req, res, next);
    }
    );

app.use(cookieParser());

//const { PORT = 3000 } = process.env;
const PORT = parseInt(process.env.PORT || "19200", 10);

app.use("/auth", userRouter);

//app.use("/getresponse", userRouter);
app.use("/product", productRouter);

app.use("/customer", userRouter);

app.use("/order", orderRouter);
app.use("/cart", cartRouter);
app.use("/ai", aiRouter);


//app.use("/api", movieRouter);
app.get("*name", (req: Request, res: Response) => {
  res.status(505).json({ message: "Bad Request!" });
});

/*
AppDataSource.initialize()
  .then(async () => {

    connectWithRetry().then(() => {
        app.listen(PORT, () => {
          console.log("Server is running on http://localhost:" + PORT);
        });
        console.log("Data Source has been initialized!");
      }).catch((err) => {
        console.error('Failed to connect to DB after retries:', err);
        process.exit(1);
      });

  })
  .catch((error) => console.log(error));

  */


  connectWithRetry().then(() => {
    app.listen( PORT,'0.0.0.0',  () => {
      console.log(" Server running on http://localhost:" + PORT);
    });
  }).catch((err) => {
    console.error(" Failed to connect to DB after retries:", err);
    process.exit(1);
  });