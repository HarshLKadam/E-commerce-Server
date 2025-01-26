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
            "verify email from farmerBuddy",
            "",
            verifyEmailTemplate(name, verifyCode)
        )

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
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide a valid email and password',
                error: true,
                success: false,
            });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                message: 'User is not registered',
                error: true,
                success: false,
            });
        }

        if (user.status !== "Active") {
            return res.status(400).json({
                message: 'Contact the admin',
                error: true,
                success: false,
            });
        }

        if (!user.verify_email) {
            return res.status(400).json({
                message: 'Your email is not verified yet. Please verify your email first',
                error: true,
                success: false,
            });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Enter a valid password',
                error: true,
                success: false,
            });
        }

        const accessToken = await generateAccesstoken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        await User.findByIdAndUpdate(user._id, { last_login_date: new Date() });

        const cookiesOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        };

        res.cookie('accessToken', accessToken, cookiesOptions);
        res.cookie('refreshToken', refreshToken, cookiesOptions);

        return res.json({
            message: 'Login successful',
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Internal server error',
            error: true,
            success: false,
        });
    }
};

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
const uploadToCloudinary = async (filePath) => {
    try {
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
            timeout: 120000, // Increase timeout to 120 seconds
        };

        const result = await cloudinary.uploader.upload(filePath, options);
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null;
    }
};

const userAvatarController = async (req, res) => {
    try {
        imageArray = [];
        const userId = req.userId;
        const avatarImages = req.files;

        if (!avatarImages || avatarImages.length === 0) {
            return res.status(400).json({
                message: 'No files received',
                error: true,
                success: false,
            });
        }

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(500).json({
                message: 'User not found while uploading image',
                error: true,
                success: false
            });
        }

        const userAvatar = user.avatar;
        const urlArray = userAvatar ? userAvatar.split('/') : [];
        const imageName = urlArray.length > 0 ? urlArray[urlArray.length - 1].split('.')[0] : null;

        if (imageName) {
            await cloudinary.uploader.destroy(imageName);
        }

        for (let i = 0; i < avatarImages.length; i++) {
            const result = await uploadToCloudinary(avatarImages[i].path);
            if (result) {
                imageArray.push(result.secure_url);
                await fs.promises.unlink(avatarImages[i].path);  // Asynchronous file deletion
            } else {
                console.log(`Failed to upload image: ${avatarImages[i].path}`);
            }
        }

        if (imageArray.length > 0) {
            // Save the Cloudinary URL to the user's avatar field
            user.avatar = imageArray[0];  // Save only the first image URL
            await user.save();

            return res.status(200).json({
                images: imageArray,
                message: 'Avatar updated successfully.',
            });
        } else {
            return res.status(500).json({
                message: 'No images were uploaded.',
                error: true,
                success: false,
            });
        }
    } catch (error) {
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

const updateUserDetailsController = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email, mobile, password } = req.body;

        const userExist = await User.findById(userId);
        if (!userExist) {
            return res.status(404).json({
                message: "User not found. Cannot update.",
                error: true,
                success: false,
            });
        }

        if (email && email !== userExist.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    message: "The new email is already in use by another account.",
                    error: true,
                    success: false,
                });
            }
        }


        let hashedPassword = userExist.password;
        if (password) {
            const salt = await bcryptjs.genSalt(10);
            hashedPassword = await bcryptjs.hash(password, salt);
        }


        let verifyCode = null;
        let otpExpiresIn = null;
        if (email && email !== userExist.email) {
            verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            otpExpiresIn = Date.now() + 600000;
        }


        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name: name || userExist.name,
                mobile: mobile || userExist.mobile,
                email: email || userExist.email,
                verify_email: email && email !== userExist.email ? false : userExist.verify_email,
                password: hashedPassword,
                otp: verifyCode,
                otpExpiresIn: otpExpiresIn,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({
                message: "Failed to update the user.",
                error: true,
                success: false,
            });
        }

        if (verifyCode) {
            try {
                await sendEmailfun(
                    email,
                    "Verify your email - FarmerBuddy",
                    "",
                    verifyEmailTemplate(updatedUser.name, verifyCode),
                );
            }
            catch (emailError) {
                console.error("Failed to send email:", emailError);
                return res.status(500).json({
                    message: "User updated, but failed to send verification email.",
                    error: true,
                    success: false,
                    user: updatedUser,
                });
            }
        }


        return res.status(200).json({
            message: "User updated successfully.",
            error: false,
            success: true,
            user: updatedUser,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || "An unexpected error occurred.",
            error: true,
            success: false,
        });
    }
};

const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)

        if (!email) {
            return res.status(400).json({
                message: "Invalid email address",
                error: true,
                success: false,
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "email is not avilable",
                error: false,
                success: true,
            });
        }


        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = verifyCode
        user.otpExpiresIn = Date.now() + 600000

        await User.findByIdAndUpdate(
            user._id,
            {
                otp: verifyCode,
                otpExpiresIn: Date.now() + 600000, // 10 minutes
            },
            { new: true }
        );

        // Send verification email
        await sendEmailfun(
            email,
            "Verify your email - FarmerBuddy",
            "",
            verifyEmailTemplate(user.name, verifyCode)
        );

        return res.status(200).json({
            message: "check your email",
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Forgot password error:", error); // Log error for debugging

        return res.status(500).json({
            message: "An error occurred. Please try again later.",
            error: true,
            success: false,
        });
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    const { email, otp } = req.body

    const user = await User.findOne({
        email: email
    })

    if (!user) {
        return res.status(400)
            .json({
                message: "user not found",
                error: true,
                success: false
            })
    }

    if (!email || !otp) {
        return res.status(400)
            .json({
                message: "please provide a otp",
                error: true,
                success: false
            })
    }

    if (otp !== user.otp) {
        return res.status(200)
            .json({
                message: "otp is Invalid",
                error: false,
                success: true

            })
    }
    const currentTime = new Date().toISOString()
    if (user.otpExpiresIn < currentTime) {
        return res.status(400)
            .json({
                message: "Otp is expired ",
                error: true,
                success: false
            })
    }

    user.otp = ""
    user.otpExpiresIn = "";

    await user.save()
    return res.status(200)
        .json({
            message: "Otp Verified !",
            error: false,
            success: true
        })

}

const resetPasswordController = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body

        if (!email || !newPassword || !confirmPassword) {
            return res.status(400)
                .json({
                    message: "email,newPassword,confirmPassword are required ",
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
                    message: "user is not found ",
                    error: true,
                    success: false
                })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400)
                .json({
                    message: "new password and confirm password must be same ",
                    error: true,
                    success: false
                })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword, salt)

        await User.findOneAndUpdate(
            user._id,
            {
                password: hashPassword
            }
        )
        console.log(newPassword)
        console.log(hashPassword)

        return res.status(200)
            .json({
                message: "password updated successfully",
                error: false,
                success: true
            })


    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split("")[1]

        if (!refreshToken) {
            returnres.status(400)
                .json({
                    message: "Invalid token",
                    error: true,
                    success: false
                })
        }
        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)

        if (!verifyToken) {
            return res.status(401)
                .json({
                    message: "token is expired",
                    error: true,
                    success: false
                })
        }

        const userid = verifyToken?._id

        const newAccessToken = await generateAccesstoken(userid)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        res.cookie('AccessToken', newAccessToken, cookiesOption)

        return res.status(200)
            .json({
                message: "New Access token generated",
                error: false,
                success: true,
                data: {
                    accessToken: newAccessToken
                }
            })
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

//get login user details
const userDetailsController = async (req, res) => {
    try {
        const userid = req.userId

        const user = await User.findById(userid).select(
            "-password -refersh_token"
        )
        return res.status(200)
            .json({
                message: 'user details ',
                data: user,
                error: false,
                success: true
            })

    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

export {
    registerUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    userAvatarController,
    removeImageFromCloudinary,
    updateUserDetailsController,
    forgotPasswordController,
    verifyForgotPasswordOtp,
    resetPasswordController,
    refreshToken,
    userDetailsController
}
