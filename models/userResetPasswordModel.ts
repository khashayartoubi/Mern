import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			require: [true, "code is requires"],
		},
		userId: {
			type: ObjectId,
			ref: "User",
			require: [true, "userId id require"],
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Code", userSchema);
