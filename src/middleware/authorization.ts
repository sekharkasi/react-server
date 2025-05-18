import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export const  authorization = (
  roles: string[]) => {

  console.log("authorization called");

  return async (req: Request, res: Response, next: NextFunction) => {
    console.log('before user repo');

    const userRepo = AppDataSource.getRepository(User);

    console.log('user repo');
    const user = await userRepo.findOne({
      where: { email: req["currentUser"].email },
    });
    console.log(user);
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};