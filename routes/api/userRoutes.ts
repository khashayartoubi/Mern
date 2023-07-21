import express from "express";
// import registerValidator from "../../validations/userValidation.ts";
import userController from "../../controllers/userController.ts";
import registerValidator from "../../validations/userValidation.ts";
import loginValidator from "../../validations/userLoginValidation.ts";
const router = express.Router();

router.post("/register", registerValidator(), userController.register);
router.post("/login", loginValidator(), userController.login);
router.post("/activate", userController.activateAccount);
router.post("/logout", userController.userLogout);
router.get("/findUser", userController.findUser);
router.post("/forgetpassword", userController.sendResetPasswordCode);
router.post("/checkResetPasswordCode", userController.validateRestPasswordCode);
router.post("/changePassword", userController.changePassword);

export default router;
