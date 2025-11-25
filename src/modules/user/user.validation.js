import joi from "joi"
import { generalFields } from "../../middlewares/validation.middlewares.js";




const getone = {
    headers: joi.object({
        authorization: generalFields.authorization.required()
    }).unknown(true)
}

const getNewCredentialsSchema = {
    headers: joi.object({
        authorization: generalFields.authorization.required()
    }).unknown(true)

};


const shareProfileSchema = {
    params: joi.object({
        userId: generalFields.userId.required()
    })
};


const updateProfileSchema = {
    body: joi.object({
        first_name: generalFields.first_name,
        last_name: generalFields.last_name,
        phone: generalFields.phone,
        gender: generalFields.gender,
        picture: generalFields.picture
    })
};

const freezeProfile = {
    params: joi.object({
        userId: generalFields.userId
    }),
    headers: joi.object({
        authorization: generalFields.authorization.required()
    }).unknown(true)
};

const restoreProfile = {
    params: joi.object({
        userId: generalFields.userId
    }),
    headers: joi.object({
        authorization: generalFields.authorization.required()
    }).unknown(true)
}


const deleteUser = {
    params: joi.object({
        userId: generalFields.userId
    }),
    headers: joi.object({
        authorization: generalFields.authorization.required()
    }).unknown(true)
}



const updateProfilePic = {
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        size: joi.number().positive(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        finalPath: joi.string()
    }).required()
};


const updateCoverImages = {
    files: joi.array().items({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        size: joi.number().positive(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        finalPath: joi.string()
    }).required()
}



export {
    getone,
    getNewCredentialsSchema,
    shareProfileSchema,
    updateProfileSchema,
    freezeProfile,
    restoreProfile,
    deleteUser,
    updateProfilePic,
    updateCoverImages
}