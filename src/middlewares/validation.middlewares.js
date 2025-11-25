import joi from "joi";
import { genderEnum } from "../DB/models/users.models.js";
import { roleEnum } from "../DB/models/users.models.js";
import { Types } from "mongoose";

export const generalFields = {
    first_name: joi.string().min(2).max(20).messages({
        "string.min": `sorry your first name is too short`,
        "string.max": `sorry your first name is too long`,
        "any.required": `sorry your first name is required`
    }),
    last_name: joi.string().min(2).max(20).messages({
        "string.min": `sorry your last name is too short`,
        "string.max": `sorry your last name is too long`,
        "any.required": `sorry your last name is required`
    }),
    email: joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net", "org", "gov"] }
    }).messages({
        "string.email": "sorry email not valid",
        "any.required": "sorry email is required",
        "string.empty": "email shouldnt be empty"
    }),
    password: joi.string().messages({
        "any.required": "password is required"
    }),
    phone: joi.string().pattern(/^(\+2)?(02)?01[0125]\d{8}$/).messages({
        "any.required": "sorry phone is required",
        "string.pattern.base": "invalid phone number"
    }),
    gender: joi.string().valid(genderEnum.male, genderEnum.female).default(genderEnum.male),
    role: joi.string().valid(roleEnum.user, roleEnum.admin).default(roleEnum.user).messages({
        "any.required": "sorry role is required"
    }),
    idToken: joi.string().messages({
        "any.required": "sorry idToken is required"
    }),
    otp: joi.string().messages({
        "any.required": "sorry otp is required"
    }),

    authorization: joi.string().messages({
        "string.empty": "authorization shouldnt be empty",
        "object.base": `authorization shouldnt be empty`,
        "any.required": `authorizaion is required`
    }),

    userId: joi.string().custom((value, helper) => {
        return Types.ObjectId.isValid(value) || helper.message("invalid objectId format")
    }),

    oldPassword: joi.string(),
    newPassword: joi.string().not(joi.ref("oldPassword")).messages({
        "any.invalid": `new password used before please change it`,
        "string.empty": `new password shouldnt be empty`
    }),

    picture: joi.string()
}








export const validation = (schema) => {
    const validationErrorDetails = [];
    return async (req, res, next) => {
        for (const key of Object.keys(schema)) {
            const validationProcess = schema[key].validate(req[key], { abortEarly: false });
            if (validationProcess.error) {
                validationErrorDetails.push({ key, details: validationProcess.error.details })
            }
        };

        if (validationErrorDetails.length) {
            return res.status(400).json({
                message: `validation error`,
                details: validationErrorDetails
            })
        };
        return next()
    }
}