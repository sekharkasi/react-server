import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export const authentification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  //console.log(req.headers.get("cookie"));
  console.log("cookie::", req.cookies);
  const cookie = req.cookies;


  if (!cookie) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = cookie.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  if (!decode) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("decode", decode);

  req["currentUser"] = decode;
  next();
};