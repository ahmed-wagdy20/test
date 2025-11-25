import * as tokenServices from "../utils/tokenServices/tokenServices.js"
import * as dbServices from "../DB/dbServices.js";
import { userCollection } from "../DB/models/users.models.js";
import { roleEnum } from "../DB/models/users.models.js";
import { tokenCollection } from "../DB/models/tokens.models.js";

export const tokenEnum = {
    access: "access",
    refresh: "refresh"
}

export const authentication = ({ tokenType = tokenEnum.access }) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        const [role, token] = authorization.split(" ");

        const signature = {
            access_signature: undefined,
            refresh_signature: undefined,
        };

        switch (role) {
            case roleEnum.user:
                signature.access_signature = process.env.USER_ACCESS_TOKEN_SECRET_KEY;
                signature.refresh_signature = process.env.USER_REFRESH_TOKEN_SECRET_KEY;
                break;
            case roleEnum.admin:
                signature.access_signature = process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY;
                signature.refresh_signature = process.env.ADMIN_REFRESH_TOKEN_SECRET_KEY;
                break;
        }




        const verifiying = tokenServices.verification({
            token,
            secretKey: tokenType == tokenEnum.access ? signature.access_signature : signature.refresh_signature
        });

        if (verifiying.jti && await dbServices.findOne({
            model: tokenCollection,
            condition: {
                jwtid: verifiying.jti
            }
        })) {
            return next(new Error("this token is already revoked", { cause: 403 }))
        }


        const user = await dbServices.findOne({
            model: userCollection,
            condition: {
                _id: verifiying._id
            }
        });


        if (!user) {
            return next(new Error("user not found", { cause: 404 }))
        };

        if (user.changeCredentials?.getTime() > verifiying.iat * 1000) {
            return next(new Error("token is expired", { cause: 401 }))
        }

        req.user = user;
        req.decodedToken = verifiying;
        next()
    }
}