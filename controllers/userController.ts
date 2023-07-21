import { NextFunction, Request, Response } from "express";
import { cookie, validationResult } from "express-validator";
import userModel, { UserDoc } from "../models/userModel.ts";
import codeModel from "./../models/userResetPasswordModel.ts";
import randomstring from "randomstring";
import jwt from "jsonwebtoken";
import {
	sendVerificationEmail,
	sendResetPassword,
} from "../utilities/mailer.js";
import bcrypt from "bcrypt";
// import { ObjectId } from "mongoose";

const { MAIL_JWT_TOKEN, BASE_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } =
	process.env;

export default new (class {
	constructor() {}

	async register(req: Request, res: Response, next: NextFunction) {
		try {
			const { firstName, lastName } = req.body;
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					data: req.body,
					errors: errors.array().map((err) => err.msg),
					message: "validation error",
				});
			}
			const newUser = await new userModel({
				...req.body,
				userName: firstName + " " + lastName,
			}).save();

			const mailVerificationToken = jwt.sign(
				{ id: newUser._id },
				MAIL_JWT_TOKEN as string,
				{ expiresIn: "30m" }
			);

			// * email send services
			const url = `${BASE_URL}/users/activate/${mailVerificationToken}`;

			// interface sendEmail<T, K> {
			// 	(email: T, name: T, url: T): void;
			// }
			// let cc: sendEmail<string, number> = sendVerificationEmail();
			// cc(newUser?.email as string, newUser?.userName as string, url);

			sendVerificationEmail(newUser?.email, newUser?.userName, url);
			res.json("verification link sent by user email");
		} catch (error) {
			res.json(error);
		}
	}
	async login(req: Request, res: Response) {
		const { email, password } = req.body;
		const cookies = req.cookies;

		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ message: errors.array() });

		const foundUser = await userModel.findOne({ email: email });
		if (!foundUser) return res.status(400).json({ message: "user not found" });

		const isValid = await bcrypt.compare(password, foundUser?.password);
		if (!isValid) {
			return res.status(401).json({ message: "user not found" });
		}
		// if(!foundUser.comparePssword(password)){
		// 	res.status(401).json({message: 'user not found'})
		// }

		const accessToken = jwt.sign(
			{ id: foundUser?.id },
			ACCESS_TOKEN_SECRET as string,
			{
				expiresIn: "5m",
			}
		);
		const newRefreshToken = jwt.sign(
			{ id: foundUser?.id },
			REFRESH_TOKEN_SECRET as string,
			{
				expiresIn: "15d",
			}
		);

		let newRefreshTokenArray = !cookies?.jwt
			? foundUser?.refreshToken
			: foundUser?.refreshToken.filter((rt) => rt !== cookies?.jwt);
		if (cookies?.jwt) {
			let refreshToken = cookies.jwt;
			let foundToken = await userModel.findOne({ refreshToken });
			if (!foundToken) {
				newRefreshTokenArray = [];
			}
			res.clearCookie("jwt", {
				httpOnly: true,
				sameSite: "none",
				secure: true,
			});
			foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
		}
		await foundUser.save();
		const { firstName, lastName, picture, userName } = foundUser;
		res.cookie("jwt", newRefreshToken, {
			httpOnly: true,
			sameSite: "none",
			secure: true,
		});
		const userInfo = {
			firstName,
			lastName,
			picture,
			userName,
			accessToken,
		};
		res.status(200).json({
			data: userInfo,
		});
	}
	async activateAccount(req: Request, res: Response) {
		try {
			const { token } = req.body;
			if (!token) return res.status(400).json({ message: "token not valid" });

			try {
				interface JwtPayload {
					id: string;
					iat: number;
					exp: number;
				}
				const user = jwt.verify(token, MAIL_JWT_TOKEN as any) as JwtPayload;

				if (!user) return res.status(400).json({ message: "token not valid" });
				const foundUser = await userModel.findById(user.id);
				if (!foundUser)
					return res.status(400).json({ message: "user not found" });
				if (foundUser?.verify == true)
					res.status(400).json({ message: "user is activated" });
				await userModel.findByIdAndUpdate(user.id, { verify: true });
				// foundUser.verify = true;
				// await foundUser.save();
				res.status(200).json({ message: "user activated successfuly" });
			} catch (ex) {
				res.status(400).send("invalid token");
			}
		} catch (error) {
			res.status(500).send("server error");
		}
	}
	// request for new access token
	async refreshToken(req: Request, res: Response) {
		const cookies = req.cookies;
		if (!cookies?.jwt) return res.status(401).json({ message: "unauthorized" });
		const refreshToken = cookies.jwt;
		res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
		const foundUser = await userModel.findOne({ refreshToken });
		if (!foundUser) {
			jwt.verify(
				refreshToken,
				REFRESH_TOKEN_SECRET as string,
				async (err: any, dec: any) => {
					if (err)
						return res.status(403).json({ message: "permission denied" });
					// const hackedUser: UserDoc | null = await userModel.findOneAndUpdate({
					// 	refreshToken: [],
					// });
					const hackedUser: UserDoc | null = await userModel.findOne({
						id: dec.id,
					});
					hackedUser?.refreshToken as string[];
					hackedUser!.refreshToken = [];
				}
			);
			return res.status(400).json({ message: "user not found" });
		}

		const newRefreshTokenArray = foundUser.refreshToken.filter(
			(rt) => rt !== refreshToken
		);

		jwt.verify(
			refreshToken,
			REFRESH_TOKEN_SECRET as string,
			async (err: any, dec: any) => {
				if (err || foundUser.id !== dec.id)
					return res.status(403).json({ message: "permissin denied" });
				const accessToken = jwt.sign(
					{ id: dec.id },
					ACCESS_TOKEN_SECRET as string
				);
				const newRefreshToken = jwt.sign(
					{ id: dec.id },
					REFRESH_TOKEN_SECRET as string
				);
				foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
				await foundUser.save();
				res.cookie("jwt", newRefreshToken, {
					httpOnly: true,
					sameSite: "none",
					secure: true,
					maxAge: 1000 * 60 * 60 * 24 * 15,
				});
			}
		);

		// const newRefreshToken = jwt.sign(
		// 	{ id: foundUser.id },
		// 	REFRESH_TOKEN_SECRET as string,
		// 	{
		// 		expiresIn: "15d",
		// 	}
		// );
	}
	async userLogout(req: Request, res: Response) {
		const cookies = req.cookies;
		if (!cookies?.jwt)
			return res.status(204).json({ message: "token not found" });
		const refreshToken = cookies?.jwt;
		const foundUser = await userModel.findOne({ refreshToken });
		if (!foundUser) {
			res.clearCookie("jwt", {
				httpOnly: true,
				sameSite: "none",
				secure: true,
			});
		} else {
			// foundUser!.refreshToken as string[];
			foundUser.refreshToken = foundUser.refreshToken.filter(
				(rt) => rt !== refreshToken
			);
			await foundUser.save();
			res.clearCookie("jwt", {
				httpOnly: true,
				sameSite: "none",
				secure: true,
			});
			res.status(200).json({ message: "user logout successfully" });
		}
	}
	async findUser(req: Request, res: Response) {
		const { email } = req.body;
		if (!email) return res.status(404).json({ message: "user not found" });
		const foundUser = await userModel.findOne({ email });
		if (!foundUser) return res.status(404).json({ message: "user not found" });
		res.status(200).json({
			data: foundUser,
			message: "user find successfully",
		});
	}
	async sendResetPasswordCode(req: Request, res: Response) {
		// try {
		const { email } = req.body;
		if (!email) return res.status(404).json({ message: "user not found" });
		const foundUser = await userModel.findOne({ email });
		if (!foundUser) return res.status(404).json({ message: "user not found" });
		await codeModel.findOneAndRemove({ userId: foundUser?._id });
		const code = randomstring.generate(5);
		// const createCodeModel =
		await new codeModel({
			code,
			userId: foundUser._id,
		}).save();
		sendResetPassword(foundUser?.email, foundUser?.firstName, code);
		res.status(200).json({
			// data: createCodeModel,
			message: "reset password code has sent by user email",
		});
		// }
		// catch (error) {
		// 	res.status(500).json({
		// 		error: "server error",
		// 	});
		// }
	}
	async validateRestPasswordCode(req: Request, res: Response) {
		try {
			const { email, code } = req.body;
			if (!email || !code)
				return res.status(400).json({ message: "email or code is invalid" });
			const foundUser = await userModel.findOne({ email: email });
			if (!foundUser)
				return res.status(400).json({ message: "user not found" });
			const resetCode = await codeModel.findOne({ userId: foundUser?.id });

			if (resetCode?.code !== code)
				return res.status(400).json({ message: "code is invalid" });
			res.status(200).json({ message: "user code is correct" });
		} catch (error) {
			res.status(500).json({ message: "server error" });
		}
	}
	async changePassword(req: Request, res: Response) {
		try {
			const { newPassword, code } = req.body;
			if (!code) return res.status(400).json("code not found");
			const foundCode = await codeModel.findOne({ code });
			if (!foundCode) return res.status(400).json("code is invalid");
			const foundUser = await userModel.findById({ _id: foundCode?.userId });
			if (!foundUser)
				return res.status(400).json({ message: "user not found" });
			// foundUser?.password = newPassword,
			foundUser.password = newPassword;
			await new userModel(foundUser).save();
			res.status(200).json({
				data: foundUser,
				message: "user password changed successfully",
			});
		} catch (error) {
			res.status(500).json({ message: "server error" });
		}
	}
})();
