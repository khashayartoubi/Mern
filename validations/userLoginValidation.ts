import { body, validationResult } from "express-validator";
import User from "../models/userModel.ts";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

const loginValidator = () => {
	const data = [
		body("email")
			.isLength({ min: 4 })
			.withMessage("first name must be at least 4 charackters")
			.isEmail()
			.withMessage("invalid email address")
			.isString()
			.withMessage("invalid email address")
			.custom(async (value) => {
				const emailREG = value.match(
					/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
				);
				if (!emailREG) {
					throw new Error("email is not correct");
				}
			})
			.custom(async (value) => {
				const userEmail = await User.findOne({ email: value });
				if (!userEmail?.email) throw new Error("user not found");
			}),
		body("password")
			.isLength({ min: 4 })
			.withMessage("password must be at least 8  charackters")
			.matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
			.withMessage("password is weak")
	];
	return data;
};
export default loginValidator;
