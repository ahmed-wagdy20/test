import { Router } from "express";
import * as authServices from "./auth.service.js";
import { authentication, tokenEnum } from "../../middlewares/authentication.middlewares.js";
import { validation } from "../../middlewares/validation.middlewares.js";
import * as authValidationSchemas from "./auth.validation.js"
import { endPoints } from "../user/authorization.user.js";
import { authorization } from "../../middlewares/authorization.middlewares.js";
const router = Router();

router.post("/signup", validation(authValidationSchemas.signUpSchema), authServices.signup);
router.post("/login", validation(authValidationSchemas.loginSchema), authServices.login);
router.post("/social-login", validation(authValidationSchemas.loginWithGmailSchema), authServices.loginWithGmail);
router.patch("/confirm-email", validation(authValidationSchemas.confirmEmailSchema), authServices.confirmEmail)
router.patch("/update-password", validation(authValidationSchemas.updatePassword), authentication({ tokenType: tokenEnum.access }), authorization({ accessRoles: endPoints.updatePassword }), authServices.updatePassword);
router.patch("/forget-password", validation(authValidationSchemas.forgetPassword), authServices.forgetPassword);
router.patch("/reset-password", validation(authValidationSchemas.resetPassword), authServices.resetPassword);
router.post("/logout", validation(authValidationSchemas.logOut), authentication({ tokenType: tokenEnum.access }), authorization({ accessRoles: endPoints.logOut }), authServices.logOut)



export default router;