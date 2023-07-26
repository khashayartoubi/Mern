import express from "express";
// import { uploadController } from "../../controllers/uploadController.js";
import imageUpload from "../../midlleware/imageUpload.ts";
import uploadController from "../../controllers/uploadController.js";

const router = express.Router();

router.post("/", imageUpload, uploadController.uploadeImage);
// router.post("/", uploadController);

export default router;
