import { AppDataSource } from "./data-source";
import express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { userRouter } from "./routes/user.routes";
import { productRouter } from "./routes/product.routes";
import {errorHandler} from "./middleware/errorhandler";
import cors from "cors";
import cookieParser from 'cookie-parser';



//import { movieRouter } from "./routes/movie.routes";
import "reflect-metadata";
dotenv.config();



const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true   
}));


app.use(express.json());
app.use(
    (error, req, res, next)=>{
        errorHandler(error, req, res, next);
    }
    );

app.use(cookieParser());

const { PORT = 3000 } = process.env;

app.use("/auth", userRouter);

//app.use("/getresponse", userRouter);
app.use("/product", productRouter);

app.use("/customer", userRouter);

//app.use("/api", movieRouter);
app.get("*name", (req: Request, res: Response) => {
  res.status(505).json({ message: "Bad Request!" });
});


AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));