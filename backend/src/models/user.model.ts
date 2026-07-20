import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

export interface IUser extends UserType, Document {
    // can add mongo related attr
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    profilePicture?: string;
    phoneNumber?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
}
const UserMongoSchema: Schema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        profilePicture: { type: String },
        phoneNumber: { type: String },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        walletBalance: { type: Number, default: 0 }
    },
    {
        timestamps: true // createdAt and updatedAt will be automatically added and managed by mongoose
    }
)
export const UserModel = mongoose.model<IUser>
(
    "User", // db.users -> Model Name "User"
    UserMongoSchema
);