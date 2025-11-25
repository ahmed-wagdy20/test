import mongoose from "mongoose";

const tokenCollectionSchema = new mongoose.Schema({
    jwtid: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    expiresIn: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

export const tokenCollection = mongoose.models.tokens || mongoose.model("tokens", tokenCollectionSchema)