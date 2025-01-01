import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = "harshlmao"

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  const decoded = jwt.verify(header as string, JWT_SECRET) as CustomJwtPayload;
  if (decoded) {
    //@ts-ignore
    req.userId = decoded.id;
    next();
  }
  else {
    res.status(403).json({
      message: "You are not logged in"
    })
  }

}