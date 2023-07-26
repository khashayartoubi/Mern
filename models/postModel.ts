import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: ["profilePicture", "cover", null],
		},
		text: {
			type: String,
		},
		image: {
			type: Array,
		},
		user: {
			type: ObjectId,
			ref: "user",
			require: true,
		},
		background: {
			types: String,
		},
		comments: [
			{
				comment: {
					type: String,
				},
				commentBy: {
					type: ObjectId,
					ref: "user",
				},
				commentAt: {
					type: Date,
					default: new Date(),
				},
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Post", postSchema);
