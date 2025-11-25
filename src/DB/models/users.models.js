
import mongoose from "mongoose";



export const genderEnum = {
    male: "male",
    female: "female"
};

export const providerEnum = {
    system: "system",
    google: "google"
};

export const roleEnum = {
    user: `user`,
    admin: `admin`
}



const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        minLength: [2, "sorry your first name is too short"],
        maxLength: [20, "sorry your first name is too long"],
        required: true
    },
    last_name: {
        type: String,
        minLength: [2, "sorry your last name is too short"],
        maxLength: [20, "sorry your last name is too long"],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider == providerEnum.system ? true : false
        }
    },
    phone: String,
    gender: {
        type: String,
        enum: {
            values: Object.values(genderEnum),
            message: `sorry your gender must be male or female only`
        },
        default: genderEnum.male
    },
    picture: String,
    provider: {
        type: String,
        enum: {
            values: Object.values(providerEnum),
            message: `email provider must be system or google`
        },
        default: providerEnum.system
    },
    confirm_email: Date,
    role: {
        type: String,
        enum: {
            values: Object.values(roleEnum),
            message: `role must be admin or user`
        },
        default: roleEnum.user
    },
    confirm_otp: {
        type: String
    },
    freezedAt: Date,
    freezedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    restoredAt: Date,
    restordBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    forgetPasswordOtp: String,
    changeCredentials: Date,
    coverImages: [String],
    cloudProfileImage: { public_id: String, secure_url: String },
    cloudCoverImages: [{ public_id: String, secure_url: String }]
}, {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

userSchema.virtual("messages", {
    localField: "_id",
    foreignField: "receiverId",
    ref: "messages"
})

export const userCollection = mongoose.models.users || mongoose.model("users", userSchema)