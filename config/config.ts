import mongoose, { ConnectOptions } from "mongoose";

export const connectDB = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URI as string, {useNewUrlParser: true} as ConnectOptions);
		console.log('connected to database');
	} catch (error) {
		console.log(error);
	}
};
