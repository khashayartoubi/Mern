import express from "express";
import "dotenv/config";
const app = express();
import { connectDB } from "./config/config.ts";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/api/userRoutes.js";
import cookieParser from "cookie-parser";
import corsOptions from "./midlleware/cors.ts";
import credential from "./midlleware/credential.ts";
const port = process.env.PORT || 8000;

connectDB();
app.use(credential);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/users", userRoutes);

mongoose.connection.once("open", () => {
	app.listen(port, () => {
		console.log(`app run in port ${port}`);
	});
});
