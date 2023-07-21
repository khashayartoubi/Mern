import mongoose from "mongoose";
import userModel from "./userModel.ts";
import randomString from "randomstring";
import bcrypt from "bcrypt";
export interface UserDoc extends Document {
	firstName: string;
	lastName: string;
	userName: string;
	email: string;
	password: string;
	picture: string;
	verify: boolean;
	refreshToken: string[];
	comparePssword: (pw: string) => Promise<boolean>;
}
const userSchema = new mongoose.Schema<UserDoc>(
	{
		firstName: {
			type: String,
			require: [true, "first name is required"],
			trim: true,
			text: true,
		},
		lastName: {
			type: String,
			require: [true, "last name is required"],
			trim: true,
			text: true,
		},
		userName: {
			type: String,
			require: [true, "user name is required"],
			trim: true,
			text: true,
			unique: true,
		},
		email: {
			type: String,
			require: [true, "email is requires"],
		},
		password: {
			type: String,
			require: [true, "password is requires"],
		},
		picture: {
			type: String,
			trim: true,
			default:
				"data:image/jpeg;base64,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",
		},
		// cover: {
		// 	type: String,
		// 	trim: true,
		// },
		// gender: {
		// 	type: String,
		// 	require: [true, "Gender is required"],
		// },
		// bYear: {
		// 	type: Number,
		// 	require: true,
		// 	trim: true,
		// },
		// bMounth: {
		// 	type: Number,
		// 	require: true,
		// 	trim: true,
		// },
		// bDay: {
		// 	type: Number,
		// 	require: true,
		// 	trim: true,
		// },
		verify: {
			type: Boolean,
			default: false,
		},
		// friends: {
		// 	type: Array,
		// 	default: [],
		// },
		// following: {
		// 	type: Array,
		// 	default: [],
		// },
		// followers: {
		// 	type: Array,
		// 	default: [],
		// },
		// requests: {
		// 	type: Array,
		// 	default: [],
		// },
		// searchs: [
		// 	{
		// 		user: {
		// 			type: ObjectId,
		// 			ref: "User",
		// 		},
		// 	},
		// ],
		// details: {
		// 	bio: {
		// 		type: String,
		// 	},
		// 	othreName: {
		// 		type: String,
		// 	},
		// 	work: {
		// 		type: String,
		// 	},
		// 	jobPalce: {
		// 		type: String,
		// 	},
		// 	colleg: {
		// 		type: String,
		// 	},
		// 	currentCity: {
		// 		type: String,
		// 	},
		// 	hometone: {
		// 		type: String,
		// 	},
		// 	relationShip: {
		// 		type: String,
		// 		enum: ["Single", "In a relationship", "married", "Divorced"],
		// 	},
		// 	instagram: {
		// 		type: String,
		// 	},
		// 	savedPost: [
		// 		{
		// 			post: {
		// 				type: ObjectId,
		// 				ref: "post",
		// 			},
		// 			savedAt: {
		// 				type: ObjectId,
		// 				default: new Date(),
		// 			},
		// 		},
		// 	],
		refreshToken: {
			type: [],
		},
		// },
	},
	{ timestamps: true }
);
userSchema.pre("save", async function (next) {
	// console.log(this);
	let user = this;
	if (!user.isModified("password")) return next();
	try {
		// const salt = await bcrypt.genSalt(12);
		// user.password = await bcrypt
		// 	.hash(user?.password as string, salt)
		// 	.toString();

		const salt = await bcrypt.genSalt(12);
		user.password = await bcrypt.hash(user.password, salt);

		return next();
	} catch (error: unknown | any) {
		return next(error);
	}
});

userSchema.methods.generatUsername = async function () {
	let user = null;
	let username = this.userName;

	do {
		user = await userModel.findOne({ username });
		if (user) username += randomString.generate(4);
	} while (user);
	return username;
};

userSchema.methods.comparePssword = async function (password: string) {
	return bcrypt.compare(password, this.password);
};
export default mongoose.model("User", userSchema);
