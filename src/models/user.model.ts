import mongoose from "mongoose";
import { User } from "../types/User";
import { encrypt } from "../utils/encryption";

const schema = mongoose.Schema;

const UserSchema = new schema<User>({
    username: {
        type: schema.Types.String,
        required: true
    },
    password: {
        type: schema.Types.String,
        required: true
    },
    nama: {
        type: schema.Types.String,
        required: true
    },
    role: {
        type: schema.Types.String,
        enum: ['admin', 'pengurus'],
        default: "pengurus"
    },
    is_active: {
        type: schema.Types.Boolean,
        default: false
    },

}, {
    timestamps: true
})
UserSchema.pre('save', function (next) {
    const user = this;
    user.password = encrypt(user.password);
    next();
})

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
}

const userModels = mongoose.model("User", UserSchema);
export default userModels;