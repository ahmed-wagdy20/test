import { nanoid } from "nanoid";
import { roleEnum } from "../../DB/models/users.models.js";
import * as tokenServices from "../tokenServices/tokenServices.js"

export const getNewCredentials = (user) => {
    const jtiCode = nanoid();
    const accessToken = tokenServices.creation({
        payLoad: {
            _id: user._id,
            email: user.email
        },
        secretKey: user.role === roleEnum.user ? process.env.USER_ACCESS_TOKEN_SECRET_KEY : process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
        options: {
            issuer: "saraha_app",
            subject: "auth",
            expiresIn: "7d",
            jwtid: jtiCode
        }
    });


    const refreshToken = tokenServices.creation({
        payLoad: {
            _id: user._id,
            email: user.email
        },
        secretKey: user.role == roleEnum.user ? process.env.USER_REFRESH_TOKEN_SECRET_KEY : process.env.ADMIN_REFRESH_TOKEN_SECRET_KEY,
        options: {
            issuer: "saraha_app",
            subject: "auth",
            expiresIn: "30d",
            jwtid: jtiCode
        }
    });
    return { accessToken, refreshToken }
}