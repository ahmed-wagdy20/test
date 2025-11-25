import { userCollection } from "../../DB/models/users.models.js"
import * as dbServices from "../../DB/dbServices.js"
import { successResponse } from "../../utils/successResponse/sucessResponse.js";
import * as hashingServices from "../../utils/hashServices/hashServices.js";
import * as encryptionServices from "../../utils/encryptionServices/encryptionServices.js";
import { OAuth2Client } from "google-auth-library"
import { providerEnum } from "../../DB/models/users.models.js";
import { emailTemplate } from "../../utils/email/emailTemplate.js";
import { customAlphabet } from 'nanoid';
import { event } from "../../utils/events/event.js";
import { getNewCredentials } from "../../utils/getNewCredentials/getNewCredentials.js";
import { flagEnum } from "../user/user.service.js";
import {emailTemplateForgetPassword} from "../../utils/email/forgetPasswordTempelate.js"

const signup = async (req, res, next) => {

    const { first_name, last_name, email, password, phone, gender, role } = req.body;



    const userExistance = await dbServices.findOne({
        model: userCollection,
        condition: {
            email
        }
    });

    if (userExistance) {
        return next(new Error("email is already exist"))
    };


    const hashedPassword = await hashingServices.hashing({
        plainText: password,
        salt: +process.env.SALT
    });

    const encryptedPhone = encryptionServices.encryption({
        plainText: phone,
        secretKey: process.env.ENCRYPTION_KEY
    });

    const otpCode = customAlphabet("0123456789", 6)();
    const hashedOtp = await hashingServices.hashing({
        plainText: otpCode,
        salt: +process.env.SALT
    })

    const user = await dbServices.create({
        model: userCollection,
        docs: {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            phone: encryptedPhone,
            gender,
            role,
            confirm_otp: hashedOtp
        }
    });


    const sendOtp = event.emit("sendEmail", {
        to: email,
        subject: "Confirmation_Message",
        html: emailTemplate(otpCode, first_name, "Confirmation_Message"),
        cc: "dentist.ahmed.wagdy@gmail.com",
        attachments: [{
            filename: "try.txt",
            content: ""
        }]
    })




    return successResponse({
        res,
        statusCode: 201,
        message: `user created successfully`,
        details: user
    })


};

const login = async (req, res, next) => {

    const { email, password } = req.body;
    const user = await dbServices.findOne({
        model: userCollection,
        condition: {
            email
        }
    });

    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    };


    const comparingPassword = await hashingServices.comparing({
        plainText: password,
        hashedText: user.password
    });

    if (!comparingPassword) {
        return next(new Error("invalid credentials", { cause: 409 }))
    };


    const tokens=getNewCredentials(user)


    return successResponse({
        res,
        statusCode: 200,
        message: `${user.first_name} logged in successfully`,
        details: tokens
    })
}


const idTokenVerification = async (idToken) => {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload
}

const loginWithGmail = async (req, res, next) => {

    const { idToken } = req.body;

    const payLoad = await idTokenVerification(idToken)


    const { email, email_verified, picture, given_name, family_name } = payLoad;

    if (!email_verified) {
        return next(new Error("email not verified", { cause: 401 }))
    };

    const user = await dbServices.findOne({
        model: userCollection,
        condition: {
            email
        }
    });

    if (user) {
        if (user.provider == providerEnum.google) {
           const tokens=getNewCredentials(user)
            return successResponse({
                res,
                statusCode: 200,
                message: `${user.first_name} logged in successfully`,
                details: tokens
            })
        }
    };

    const userCreation = await dbServices.create({
        model: userCollection,
        docs: {
            email,
            first_name: given_name,
            last_name: family_name,
            picture,
            provider: providerEnum.google,
            confirm_email: Date.now()

        }
    });

    return successResponse({
        res,
        statusCode: 201,
        message: `user created successfully`,
        details: { userCreation }
    })
};

const confirmEmail = async (req, res, next) => {

    const { otp, email } = req.body;

    const user = await dbServices.findOne({
        model: userCollection,
        condition: {
            email,
            confirm_email: { $exists: false },
            confirm_otp: { $exists: true }

        }
    });

    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    };

    const comparingOtp = await hashingServices.comparing({
        plainText: otp,
        hashedText: user.confirm_otp
    });

    if (!comparingOtp) {
        return next(new Error("wrong otp", { cause: 409 }))
    };

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            email
        },
        updatedDocs: {
            $unset: { confirm_otp: true },
            $set: { confirm_email: Date.now() },
            $inc: { __v: 1 }
        },
        options: {
            new: true
        }
    });

    return successResponse({
        res,
        statusCode: 200,
        message: `user confirmed successfully`,
        details: updatedUser
    })
}

const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword, flag } = req.body;

    if (oldPassword === newPassword) {
        return next(new Error("new-password is invalid"))
    };

    const comparing = await hashingServices.comparing({
        plainText: oldPassword,
        hashedText: req.user.password
    });

    if (!comparing) {
        return next(new Error("old-password is incorrect", { cause: 401 }))
    };

    const updatedFlag = {};

    switch (flag) {
        case flagEnum.logOutFromAllDevices:
            updatedFlag.changeCredentials = Date.now();
            break;
        case flagEnum.logOut:
            await dbServices.create({
                model: tokenCollection,
                docs: {
                    jwtid: req.decodedToken.jti,
                    userId: req.user._id,
                    expiresIn: Date.now() - req.decodedToken.iat
                }
            });
            break;
        default: break;

    };

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: req.user._id
        },
        updatedDocs: {
            password: await hashingServices.hashing({
                plainText: newPassword,
                salt: 12
            }),
            $inc: { __v: 1 },
            ...updatedFlag
        }
    });

    if (!updatePassword) {
        return next(new Error("updating password failed please try again", { cause: 500 }))
    };

    return successResponse({
        res,
        statusCode: 200,
        message: `password updated successfully`,
        details: updatedUser
    })
};


const forgetPassword = async (req, res, next) => {

    const { email } = req.body;

    const user = await dbServices.findOne({
        model: userCollection,
        condition: {
            email,
            provider: providerEnum.system,
            confirm_email: { $exists: true },
            freezedAt: { $exists: false }
        }
    });

    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    };

    const otp = customAlphabet("0123456789", 6)();

    event.emit("sendEmail", {
        to: email,
        subject: `forget-password-otp`,
        html: emailTemplateForgetPassword(otp, user.first_name, "forget-password-otp"),
        cc: process.env.EMAIL
    })

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            email
        },
        updatedDocs: {
            forgetPasswordOtp: await hashingServices.hashing({
                plainText: otp,
                salt: 12
            })
        }
    });

    if (!updatedUser) {
        return next(new Error("internal server error,please try again", { cause: 500 }))
    }

    return successResponse({
        res,
        statusCode: 200,
        message: `otp sent successfully`,
        details: updatedUser
    })


};


const resetPassword = async (req, res, next) => {
    const { email, otp, password } = req.body;

    const user = await dbServices.findOne({
        model: userCollection,
        condition: {
            email,
            forgetPasswordOtp: { $exists: true }
        }
    });

    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    };

    const comparing = await hashingServices.comparing({
        plainText: otp,
        hashedText: user.forgetPasswordOtp
    });

    if (!comparing) {
        return next(new Error("wrong otp", { cause: 400 }))
    };

    const updatedUser = await dbServices.updateOne({
        model: userCollection,
        filter: {
            email
        },
        updateDocs: {
            $unset: { forgetPasswordOtp: true },
            password: await hashingServices.hashing({
                plainText: password,
                salt: 12
            }),
            $inc: { __v: 1 }
        }
    });

    if (!updatedUser.modifiedCount) {
        return next(new Error("update password failed", { cause: 500 }))
    }

    return successResponse({
        res,
        statusCode: 200,
        message: `password updated successfully`,
        details: updatedUser
    })

};

const logOut = async (req, res, next) => {


    const { flag } = req.body;
    let status = 200;
    switch (flag) {
        case flagEnum.logOutFromAllDevices:
            status = 200;
            await dbServices.findOneAndUpdate({
                model: userCollection,
                condition: {
                    _id: req.user._id
                },
                updatedDocs: {
                    changeCredentials: Date.now()
                }
            });
            break;
        case flagEnum.logOut:
            status = 201;
            await dbServices.create({
                model: tokenCollection,
                docs: {
                    jwtid: req.decodedToken.jti,
                    userId: req.user._id,
                    expiresIn: Date.now() - req.decodedToken.exp
                }
            });
            break;
    }




    return successResponse({
        res,
        statusCode: status,
        message: `user logged-out successfully`
    })

};



export {
    signup,
    login,
    loginWithGmail,
    confirmEmail,
    updatePassword,
    forgetPassword,
    resetPassword,
    logOut
}