import { v2 as cloudinary } from "cloudinary";
// import { Request, Response } from "express";
// import { FileArray, UploadedFile } from "express-fileupload";
import fs from "fs";
const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;
// import express from "express";

class UploadController {
	constructor() {
		cloudinary.config({
			cloud_name: CLOUD_NAME,
			api_key: API_KEY,
			api_secret: API_SECRET,
		});
	}

	async uploadeImage(req, res) {
		try {
			const files = Object.values(
				req.files
			).flat();

			let image = [];
			for (const file of files) {
				console.log(file);
				this?.uploadToCludinary(
					file,
					file.tempFilePath + "." + file.mimetype.split("/")[1]
				)
					.then(async (res) => {
						await console.log(res);
						return await image?.push(res);
					})
					.catch((err) => {
						return res.status(400).json({ message: err });
					});
			}
			await console.log(image)
			res.status(200).json({ message: image, data: "" });
		} catch (err) {
			return res.status(500).json({ message: err });
		}
	}
	uploadToCludinary(file, path) {
		new Promise((resolve, reject) => {
			cloudinary.uploader.upload(
				file.tempFilePath,
				{ folder: path },
				(err, res) => {
					if (err) {
						this.removeTemp(file?.tempFilePath);
						return reject(err);
					}
					return resolve({
						url: res,
					});
				}
			);
		});
	}
	removeTemp = (path) => {
		fs.unlink(path, (err) => {
			throw err;
		});
	};
}
export default new UploadController();
// // import express, { Request, Response } from "express";
// import multer from "multer";
// import path from "path";

// async function mkdirp() {
// 	return (await import("mkdirp")).mkdirp;
// }

// export const uploadController = (req, res) => {
// 	return multer.diskStorage({
// 		destination: function (req, file, callback) {
// 			mkdirp("public/images").then((made) => {
// 				callback(null, "public/images");
// 			});
// 		},
// 		filename: function (req, file, callback) {
// 			callback(
// 				null,
// 				file.fieldname + "-" + Date.now() + path.extname(file.originalname)
// 			);
// 		},
// 	});
// 	// console.log(up);
// };
// export.uploadController = new (class {
