import { body, validationResult } from "express-validator";
import User from "../models/userModel.ts";
import { NextFunction, Request, Response } from "express";

const registerValidator = () => {
	const data = [
		body("firstName")
			.isLength({ min: 4 })
			.withMessage("first name must be at least 4 charackters"),
		body("lastName")
			.isLength({ min: 4 })
			.withMessage("last name must be at least 4 charackters"),
		body("email")
			.isLength({ min: 4 })
			.withMessage("email name must be at least 4 charackters")
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
                console.log(userEmail?.email);
				if (userEmail?.email) throw new Error("email already exist");
			}),
		body("password")
			.isLength({ min: 4 })
			.withMessage("password must be at least 8  charackters")
			.matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
			.withMessage("password is weak"),
		// body("bYear")
		// 	.not()
		// 	.isEmpty()
		// 	.withMessage("bYear can not be empty")
		// 	.isInt({ min: 1950 })
		// 	.withMessage("bYear must be greather than 1950"),
		// body("bMounth")
		// 	.not()
		// 	.isEmpty()
		// 	.withMessage("bMounth can not be empty")
		// 	.isInt({ min: 1, max: 12 })
		// 	.withMessage("bMounth must be greather than 1 and less than 12"),
		// body("bDay")
		// 	.not()
		// 	.isEmpty()
		// 	.withMessage("bDay can not be empty")
		// 	.isInt({ min: 1, max: 31 })
		// 	.withMessage("bDay must be greather than 1 and less than 31"),
		// body("gender")
		// 	.isIn(["male", "female", "custom"])
		// 	.withMessage("gender can be male,female or custom"),
		// (req: Request, res: Response, next: NextFunction) => {
		// 	const errors = validationResult(req);
		// 	if (!errors.isEmpty()) {
		// 		return res.status(400).json({
		// 			data: [],
		// 			errors: errors.array(),
		// 			message: "validation error",
		// 		});
		// 	}
		// 	next();
		// },
	];
	return data;
};
export default registerValidator;
