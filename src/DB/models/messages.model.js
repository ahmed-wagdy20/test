import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    content: {
        type: String,
        minLength: [2, `sorry your message is too short`],
        maxLength: [500, `sorry your message is too long`],
        required: function () {
            return this.attachments?.length ? false : true
        }
    },
    attachments: [{
        public_id: String,
        secure_url: String
    }],
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }



}, {
    timestamps: true
});



const messageCollection = mongoose.models.messages || mongoose.model("messages", messageSchema);




export {
    messageCollection
}