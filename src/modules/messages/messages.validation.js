import joi from "joi";
import { generalFields } from "../../middlewares/validation.middlewares.js";

const sendMessageSchema = {
    params: joi.object({
        userId: generalFields.userId.required()
    }),
    body: joi.object({
        content: joi.string().min(2).max(500)
    }),
    files: joi.array().items({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        size: joi.number().positive().required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        finalPath: joi.string()
    }).min(0).max(3)
};



export{
    sendMessageSchema
}




