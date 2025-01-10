import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmailfun from "../config/sendEmail.js";
import verifyEmailTemplate from '../utils/verifyEmailtemplate.js'
import generateAccesstoken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true
});


const registerUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide email, name, and password",
                error: true,
                success: false
            });
        }

        // Validate email format
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
                error: true,
                success: false
            });
        }

        // Check if user already exists
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({
                message: "You are already registered with this email",
                error: true,
                success: false
            });
        }

        // Generate OTP and hash password
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Create new user
        const newUser = new User({
            name: name,
            email: email,
            password: hashPassword,
            otp: verifyCode,
            otpExpiresIn: Date.now() + 10 * 60 * 1000,
        });

        await newUser.save();

        // Send verification email
        await sendEmailfun(
            email,
            "Verification email from FarmerBuddy",
            "",
            verifyEmailTemplate(name, verifyCode)
        );

        // Generate JWT token for further verification
        const token = jwt.sign(
            {
                email: newUser.email,
                id: newUser._id
            },
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            success: true,
            error: false,
            message: 'User registered successfully! Please verify your email.',
            token: token
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

const verifyEmailController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const isOtpValid = user.otp === otp;
        const isNotExpired = user.otpExpiresIn > Date.now();

        if (isOtpValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpiresIn = null;
            await user.save();

            return res.status(200).json({
                message: 'Email verified successfully',
                error: false,
                success: true
            });
        }

        return res.status(400).json({
            message: isOtpValid ? "OTP has expired" : "Invalid OTP",
            error: true,
            success: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};


const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400)
                .json({
                    message: 'please provide a valid password or email',
                    error: true,
                    success: false
                })
        }

        const user = await User.findOne({
            email: email
        })

        if (!user) {
            return res.status(400)
                .json({
                    message: 'user is not registered ',
                    error: true,
                    success: false
                })
        }

        if (user.status !== "Active") {
            res.status(400)
                .json({
                    message: "contact to admin",
                    error: true,
                    success: false
                })
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password)

        if (!isPasswordValid) {
            res.status(500)
                .json({
                    message: "enter the valid password",
                    error: true,
                    success: false
                })
        }

        const accessToken = await generateAccesstoken(user._id)
        const refreshToken = await generateRefreshToken(user._id)

        const updateUser = await User.findByIdAndUpdate(user._id, {
            last_login_date: new Date()
        })

        //adding a clearCookiess for user 

        const cokkiesOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }

        res.cookie('accessToken', accessToken, cokkiesOptions)
        res.cookie('refreshToken', accessToken, cokkiesOptions)

        return res.json({
            message: "login successfully",
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken
            }
        })

    }
    catch (error) {
        return res.status(500)
            .json({
                'message': error.message || error,
                error: true,
                success: false
            })
    }
}

const logoutUserController = async (req, res) => {
    try {
        const userid = req.userId

        const cokkiesOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }

        res.clearCookie('accessToken', cokkiesOptions)
        res.clearCookie('refreshToken', cokkiesOptions)

        const removeRefreshtoken = await User.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        res.status(200)
            .json({
                message: 'user Logout successfully',
                error: false,
                success: true
            })
    }
    catch (error) {
        return res.status(500)
            .json({
                'message': error.message || error,
                error: true,
                success: false
            })
    }
}

var imageArray = [];

const userAvatarController = async (req, res) => {
    try {
        imageArray = []

        const userId = req.userId;
        const avatarImage = req.files;

        const user = await User.findOne({
            _id: userId
        })

        if (!user) {
            return res.status(500).json({
                message: 'user not found while uploading image',
                error: true,
                success: false
            })
        }

        const userAvatar = user.avatar;
        const imgUrl = userAvatar;
        const urlArray = imgUrl.split('/');
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split('.')[0];

        if (imageName) {
            const response = await cloudinary.uploader.destroy(imageName);
        }

        if (!avatarImage || avatarImage.length === 0) {
            return res.status(400).json({
                message: 'No files provided',
                error: true,
                success: false,
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < avatarImage.length; i++) {
            const imgUrl = avatarImage[i].path;
            const urlArray = imgUrl.split('/');
            const image = urlArray[urlArray.length - 1];
            const imageName = image.split('.')[0];

            if (imageName) {
                const response = await cloudinary.uploader.destroy(imageName);

                if (response.result === 'ok') {
                    return res.status(200).send({
                        message: "Image deleted successfully",
                        success: true
                    });
                }
            }

            const result = await cloudinary.uploader.upload(
                avatarImage[i].path,
                options
            );

            imageArray.push(result.secure_url);
            fs.unlinkSync(`uploads/${avatarImage[i].filename}`);
        }

        user.avatar = imageArray[0]
        await user.save()

        return res.status(200).json({
            message: 'Images uploaded successfully',
            _id: userId,
            avatar: imageArray[0],
        });
    }
    catch (error) {
        console.error('Error during avatar image upload:', error);
        return res.status(500).json({
            message: 'Internal server error during avatar upload',
            error: true,
            success: false,
        });
    }
};

const removeImageFromCloudinary = async (req, res) => {
    try {
        const imgUrl = req.query.img;
        const urlArray = imgUrl.split('/');
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split('.')[0];

        console.log("Extracted Image Name:", imageName);

        if (imageName) {
            const response = await cloudinary.uploader.destroy(imageName);

            if (response.result === 'ok') {
                return res.status(200).send({
                    message: "Image deleted successfully",
                    success: true
                });
            } else {
                return res.status(400).send({
                    message: "Failed to delete image",
                    result: response,
                    success: false
                });
            }
        }
        else {
            return res.status(400).send({
                message: "Invalid image name",
                success: false
            });
        }
    }
    catch (error) {
        console.error('Error during image deletion:', error);
        return res.status(500).json({
            message: 'Internal server error during deleting image',
            error: true,
            success: false
        });
    }
};

const updateUserDetailsController=async(req,res)=>{
    try{
        const userid=req.userId;
        const {name,email,mobile,password}=req.body;

        const userExist=await User.findById(userid)
        if(!userExist){
            res.status(400)
            .json({
                message:"The user can't be Updated or user are not exist",
                error:true,
                success:false
            })
        }
        let verifyCode="";

        if(email){
            verifyCode=Math.floor(100000 + Math.random() * 900000).toString();
        }

        let hashPassword="";

        if(password){
            const salt=await bcryptjs.genSalt(10)
            hashPassword=await bcryptjs.hash(password,salt)
        }
        else{
            hashPassword=userExist.password
        }
    }
    catch (error) {
        return res.status(500)
            .json({
                'message': error.message || error,
                error: true,
                success: false
            })
    }
}

export {
    registerUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    userAvatarController,
    removeImageFromCloudinary,
    updateUserDetailsController
}
