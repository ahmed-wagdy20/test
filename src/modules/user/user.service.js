import { successResponse } from "../../utils/successResponse/sucessResponse.js";
import {  roleEnum } from "../../DB/models/users.models.js";
import * as dbServices from "../../DB/dbServices.js"
import { userCollection } from "../../DB/models/users.models.js";
import * as encryptionServices from "../../utils/encryptionServices/encryptionServices.js"
import { getNewCredentials } from "../../utils/getNewCredentials/getNewCredentials.js";
import { tokenCollection } from "../../DB/models/tokens.models.js";
import { cloudinaryConfig } from "../../utils/multer/cloudinary.js"

export const flagEnum = {
    logOut: "logOut",
    logOutFromAllDevices: "logOutFromAllDevices",
    stayLoggedIn: "stayLoggedIn"
};


const getUser = async (req, res, next) => {
    const phone = encryptionServices.decryption({
        encryptedText: req.user.phone,
        secretKey: process.env.ENCRYPTION_KEY
    });
    req.user.phone = phone;

    const user=await dbServices.find({
        model:userCollection,
        filter:{
            _id:req.user._id
        },
        populate:[{path:"messages"}]
    })

    return successResponse({
        res,
        statusCode: 200,
        message: `user fetched successfully`,
        details: user
    })
};

const getNewCredentialss = async (req, res, next) => {
    const user = req.user;

    const tokens = getNewCredentials(user)


    return successResponse({
        res,
        statusCode: 200,
        message: `${user.first_name} logged in successfully`,
        details: tokens
    })
}


const shareProfile = async (req, res, next) => {

    const { userId } = req.params;

    const user = await dbServices.findOne({
        model: userCollection,
        condition: {
            _id: userId,
            confirm_email: { $exists: true }
        }
    })

    if (!user) {
        return next(new Error("user not found or not confirmed", { cause: 404 }))
    };

    return successResponse({
        res,
        statusCode: 200,
        message: `user shared successfully`,
        details: {
            user
        }
    })



}


const updateProfile = async (req, res, next) => {
    const user = req.user;

    if (req.body.phone) {
        req.body.phone = encryptionServices.encryption({
            plainText: req.body.phone,
            secretKey: process.env.ENCRYPTION_KEY
        })
    }

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: user._id,
            confirm_email: { $exists: true }
        },
        updatedDocs: { ...req.body, $inc: { __v: 1 } }
    });

    return successResponse({
        res,
        statusCode: 200,
        message: `user updated successfully`,
        details: { updatedUser }
    })
};

const freezeProfile = async (req, res, next) => {

    const { userId } = req.params;
    if (userId && req.user.role != roleEnum.admin) {
        return next(new Error("you arent authorized to freeze this account", { cause: 403 }))
    };

    const freezedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: userId || req.user._id,
            freezedAt: { $exists: false },
            freezedBy: { $exists: false }
        },
        updatedDocs: {
            $unset: { restoredAt: true, restordBy: true },
            freezedAt: Date.now(),
            freezedBy: req.user._id
        }
    });

    if (!freezedUser) {
        return next(new Error("invalid account", { cause: 404 }))
    }

    return successResponse({
        res,
        statusCode: 200,
        message: `user freezed successfully`,
        details: freezedUser
    })


}

const restoreProfile = async (req, res, next) => {
    const { userId } = req.params;

    if (userId && req.user.role != roleEnum.admin) {
        return next(new Error("you arent authorized to restore this account", { cause: 403 }))
    };

    if (!userId && req.user._id.toString() != req.user?.freezedBy.toString()) {
        return next(new Error("you arent authorized to restore this accountt", { cause: 403 }))
    }

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: userId || req.user._id,
            restoredAt: { $exists: false },
            restordBy: { $exists: false },
            freezedAt: { $exists: true },
            freezedBy: { $exists: true }
        },
        updatedDocs: {
            $unset: { freezedAt: true, freezedBy: true },
            restoredAt: Date.now(),
            restordBy: req.user._id
        }
    });

    if (!updatedUser) {
        return next(new Error("invalid account", { cause: 404 }))
    };

    return successResponse({
        res,
        statusCode: 200,
        message: `user restored successfully`,
        details: {
            updatedUser
        }
    })
};


const deleteUser = async (req, res, next) => {

    const { userId } = req.params;

    if (req.user.role != roleEnum.admin) {
        return next(new Error("you arent authorized to use delete api!!!!", { cause: 403 }))
    };

    const deletedOne = await dbServices.findOneAndDelete({
        model: userCollection,
        condition: {
            _id: userId,
            freezedAt: { $exists: true }
        }
    });

    if (!deletedOne) {
        return next(new Error("user that you want to delete not found or not freezed", { cause: 404 }))
    };

    return successResponse({
        res,
        statusCode: 200,
        message: `user deleted successfully`
    })
};


const updateProfilePic = async (req, res, next) => {

    console.log(req.file)

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: req.user._id
        },
        updatedDocs: {
            picture: req.file.finalPath
        }

    });

    if (!updateProfilePic) {
        return next(new Error("update profile pic failed please try again", { cause: 500 }))
    };

    return successResponse({
        res,
        statusCode: 201,
        message: `profile picture updated successfully`,
        details: { updatedUser }
    })
};

const updateCoverImages = async (req, res, next) => {

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: req.user._id
        },
        updatedDocs: {
            coverImages: req.files.map((file) => file.finalPath)
        }

    })

    if (!updatedUser) {
        return next(new Error("update cover images failed", { cause: 500 }))
    };

    return successResponse({
        res,
        statusCode: 201,
        message: `cover images updated successfully`,
        details: updatedUser
    })
};



const updateCloudProfileImage = async (req, res, next) => {

    const { public_id, secure_url } = await (await cloudinaryConfig()).uploader.upload(req.file.path, {
        folder: `saraha_app/user/${req.user._id}/profile_image`
    });

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: req.user._id
        },
        updatedDocs: {
            cloudProfileImage: {
                public_id,
                secure_url
            }
        }
    });

    if (!updatedUser) {
        return next(new Error("update profile image failed", { cause: 500 }))
    };


    if (req.user.cloudProfileImage?.public_id) {
        await (await cloudinaryConfig()).uploader.destroy(req.user.cloudProfileImage?.public_id)
    };

    return successResponse({
        res,
        statusCode: 201,
        message: `profile picture updated successfully`,
        details: { updatedUser }
    })


};


const updateCloudCoverImages = async (req, res, next) => {
    const cloudArr = [];
    for (const file of req.files) {
        const cloud = await (await cloudinaryConfig()).uploader.upload(file.path, {
            folder: `saraha_app/user/${req.user._id}/cover_images`
        });
        cloudArr.push({ public_id: cloud.public_id, secure_url: cloud.secure_url })
    };

    const updatedUser = await dbServices.findOneAndUpdate({
        model: userCollection,
        condition: {
            _id: req.user._id
        },
        updatedDocs: {
            cloudCoverImages: cloudArr
        }
    });

    if (!updatedUser) {
        return next(new Error("update cover images failed", { cause: 500 }))
    };

    return successResponse({
        res,
        statusCode: 201,
        message: `cover images updated successfully`,
        details:{updatedUser}
    })
}

export {
    getUser,
    getNewCredentialss,
    shareProfile,
    updateProfile,
    freezeProfile,
    restoreProfile,
    deleteUser,
    updateProfilePic,
    updateCoverImages,
    updateCloudProfileImage,
    updateCloudCoverImages
}