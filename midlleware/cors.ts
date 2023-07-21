// import { CorsOptions } from "cors";
import allowOrigined from "../midlleware/origins.ts";

const corsOptions = {
	origin: (origin: any, callback: any) => {
		if (allowOrigined.indexOf(origin) != -1 || !origin)
			return callback(null, true);
		else return callback(new Error("not allowed by CORS"));
	},
	optionsSuccessStatus: 200,
};

export default corsOptions;
