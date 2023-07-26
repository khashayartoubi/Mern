import express from "express";
import "dotenv/config";
const app = express();
import { connectDB } from "./config/config.ts";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/api/userRoutes.ts";
import uploderRoute from "./routes/api/uploadRoutes.ts";
import cookieParser from "cookie-parser";
import corsOptions from "./midlleware/cors.ts";
import credential from "./midlleware/credential.ts";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fileUpload from "express-fileupload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 8000;

connectDB();
app.use(credential);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
// app.use(bodyParser());
// app.use(express.static(path.join(__dirname, "public/images")));

// * APP ROUTES
app.use("/users", userRoutes);
app.use("/upload", uploderRoute);

mongoose.connection.once("open", () => {
	app.listen(port, () => {
		console.log(`app run in port ${port}`);
	});
});
