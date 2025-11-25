import mongoose from "mongoose";
import { messageCollection } from "../../DB/models/messages.model.js";
import { successResponse } from "../../utils/successResponse/sucessResponse.js";
import * as dbServices from "../../DB/dbServices.js"
import { userCollection } from "../../DB/models/users.models.js";
import { cloudinaryConfig } from "../../utils/multer/cloudinary.js"

const sendMessage = async (req, res, next) => {
    const { userId } = req.params;
    const { content } = req.body;

    const receiverExistance = await dbServices.findOne({
        model: userCollection,
        condition: {
            _id: userId,
            freezedAt: { $exists: false }
        }
    });

    if (!receiverExistance) {
        return next(new Error("invalid receiver account", { cause: 404 }))
    };

    let attachments = [];
    if (req.files) {
        for (const file of req.files) {
            const { public_id, secure_url } = await (await cloudinaryConfig()).uploader.upload(file.path,
                {
                    folder: `saraha_app/messages/${userId}`
                }
            );
            attachments.push({ public_id, secure_url })
        }
    };



    const message = await dbServices.create({
        model: messageCollection,
        docs: {
            content,
            attachments,
            receiverId: userId,
            senderId: req.user?._id
        }
    });

    if (!message) {
        return next(new Error("sending message failed please try again later", { cause: 500 }))
    };

    return successResponse({
        res,
        statusCode: 200,
        message: `message sent successfully`,
        details: message
    })
};





export {
    sendMessage
}