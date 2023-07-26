import { NextFunction, Request, Response } from "express";

import { FileArray, UploadedFile } from "express-fileupload";
import fs from "fs";

const imageUpload = (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.files || Object.values(req.files).flat().length === 0) {
			return res.status(400).json({ message: "not files selected" });
		}
		const files: UploadedFile[] = Object.values(req.files as FileArray).flat();
		const fileTypes: string[] = ["png", "jpeg", "gif", "webp", "pdf"];

		// * CHECK TYPES OF UPLOADED FILES
		files.forEach((file) => {
			if (!fileTypes.includes(file?.mimetype.split("/")[1])) {
				removeTemp(file, file.tempFilePath);
				return res.status(400).json({
					message: "image uploaded mimtype must be png, jpeg, gif,webp",
				});
			}
			// * CHECK SIZE OF UPLOADED FILES (5 mb or less is valid)
			if (file.size > 1024 * 1024 * 500) {
				return res.status(400).json({
					message: "image uploaded size must be less than 5 mb",
				});
			}
		});
		next();
	} catch (error) {
		res.status(500).json("server error");
	}
};

const removeTemp = (file: UploadedFile, path: string) => {
	fs.unlink(path, (err) => {
		throw err;
	});
	// express.mime.type[file.mimetype.split("/")[1]] = 'tmp';
};

export default imageUpload;
