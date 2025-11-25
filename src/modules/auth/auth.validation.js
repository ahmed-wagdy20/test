import joi from "joi";
import { generalFields } from "../../middlewares/validation.middlewares.js";
import { flagEnum } from "../user/user.service.js";

const signUpSchema = {
    body: joi.object({
        first_name: generalFields.first_name.required(),
        last_name: generalFields.last_name.required(),
        email: generalFields.email.required(),
        password: generalFields.password.required(),
        phone: generalFields.phone.required(),
        gender: generalFields.gender,
        role: generalFields.role.required(),
    })
};

const loginSchema = {
    body: joi.object({
        email: generalFields.email.required(),
        password: generalFields.password.required(),
    })
};

const loginWithGmailSchema = {
    body: joi.object({
        idToken: generalFields.idToken.required()
    })
};

const confirmEmailSchema = {
    body: joi.object({
        email: generalFields.email.required(),
        otp: generalFields.otp.required()
    })
}

const updatePassword = {
    headers: joi.object({
        authorization: generalFields.authorization.required()
    }).unknown(true),
    body: joi.object({
        oldPassword: generalFields.oldPassword.required(),
        newPassword: generalFields.newPassword.required(),
        flag: joi.string().valid(flagEnum.logOut, flagEnum.logOutFromAllDevices, flagEnum.stayLoggedIn).default(flagEnum.stayLoggedIn).required()
    })
};

const forgetPassword = {
    body: joi.object({
        email: generalFields.email.required()
    })
};

const resetPassword = {
    body: joi.object({
        email: generalFields.email.required(),
        otp: generalFields.otp.required(),
        password: generalFields.password.required()
    })
};

const logOut = {
    headers: joi.object({
        authorization: generalFields.authorization.required()
    }).unknown(true),
    body: joi.object({
        flag: joi.string().valid(...Object.values(flagEnum)).default(flagEnum.stayLoggedIn)
    })
};


export {
    signUpSchema,
    loginSchema,
    loginWithGmailSchema,
    confirmEmailSchema,
    updatePassword,
    forgetPassword,
    resetPassword,
    logOut
}