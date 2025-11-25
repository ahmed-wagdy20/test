import { Router } from "express";
import * as messageServices from "./messages.service.js";
import { cloudUpload } from "../../utils/multer/cloudMulter.js"
import { fileValidation } from "../../utils/multer/multer.utils.js";
import { validation } from "../../middlewares/validation.middlewares.js";
import * as messageSchema from "../messages/messages.validation.js";
import { authentication, tokenEnum } from "../../middlewares/authentication.middlewares.js";
const router = Router();

router.post("/send-message/:userId", cloudUpload({ validation: fileValidation.images }).array("attachments", 3), validation(messageSchema.sendMessageSchema), messageServices.sendMessage)
router.post("/send-message-auth/:userId",authentication({tokenType:tokenEnum.access}), cloudUpload({ validation: fileValidation.images }).array("attachments", 3), validation(messageSchema.sendMessageSchema), messageServices.sendMessage)




export default router