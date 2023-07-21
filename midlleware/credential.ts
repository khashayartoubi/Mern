import { NextFunction, Request, Response } from "express";
import allowOrigined from "./origins.ts";

const credential = (req: Request, res: Response, next: NextFunction) => {
	const origin = req.headers.origin;
	if (allowOrigined.includes(origin as string)) {
		res.header("Access-Control-Allow-Credentials", "true");
	}
	next();
};
export default credential;
