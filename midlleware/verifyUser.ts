import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
const { ACCESS_TOKEN_SECRET } = process.env;


const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
	const authHeader: string =
		(req.headers.authorization as string) ||
		(req.headers.Authorization as string);
	if (!authHeader) return res.status(403).json({ message: "access denied" });
	if (!authHeader?.startsWith("Bearer "))
		return res.status(401).json({ message: "unauthorization" });
	const token: string = authHeader?.split(" ")[1];
	jwt.verify(token, ACCESS_TOKEN_SECRET as string, (err, decoded) => {
		if (err) return res.status(403).json({ message: "access denied" });
	});
	next();
};
export default verifyJWT;
