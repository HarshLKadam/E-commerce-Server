import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'provide name']
    },

    email: {
        type: String,
        required: [true, 'provide email'],
        unique: true
    },

    password: {
        type: String,
        required: [true, 'provide password']
    },

    avatar: {
        type: String,
        default: ""
    },

    mobile: {
        type: Number,
        default: null
    },

    access_token: {
        type: String,
        default: ""
    },

    refresh_token: {
        type: String,
        default: ""
    },

    verify_email: {
        type: Boolean,
        default: false
    },

    otp: {
        type: String
    },

    otpExpiresIn: {
        type: Date
    },

    last_login_date: {
        type: Date,
        default: ""
    },

    status: {
        type: String,
        enum: ['Active', "InActive", "Suspended"],
        default: "Active"
    },

    address_details: [
        {
            type: Schema.ObjectId,
            ref: "Address"
        }
    ],

    shopping_cart: [
        {
            type: Schema.ObjectId,
            ref: 'CartProduct'
        }
    ],

    order_history: [
        {
            type: Schema.ObjectId,
            ref: 'Order'
        }
    ],

    forgot_password_otp: {
        type: String,
        default: null
    },

    forgot_password_expiry: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    }
}, {
    timestamps: true
}
)

const User = model("User", userSchema)

export default User