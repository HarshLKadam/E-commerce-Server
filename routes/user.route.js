import {Router} from 'express'
import {forgotPasswordController, loginUserController, logoutUserController, refreshToken, registerUserController, removeImageFromCloudinary, resetPasswordController, updateUserDetailsController, userAvatarController, userDetailsController, verifyEmailController, verifyForgotPasswordOtp} from '../controllers/user.controller.js'
import authentication from '../middleware/auth.middleware.js'
import upload from '../middleware/multer.middleware.js'

const userRouter=Router()

//user registration route
userRouter.post('/register',registerUserController)

userRouter.post('/verifyEmail',verifyEmailController)

userRouter.post('/login',loginUserController)

userRouter.get('/logout', authentication,logoutUserController)

userRouter.put('/avatarimage', authentication,upload.array('avatar'),userAvatarController)

userRouter.delete('/deleteimage',authentication,removeImageFromCloudinary)

userRouter.put('/update-user-details/:id',authentication,updateUserDetailsController)

userRouter.post('/forgot-password',forgotPasswordController)

userRouter.post('/verify-forgot-password-otp',verifyForgotPasswordOtp)

userRouter.post('/reset-password',resetPasswordController)

userRouter.post('/refersh-token',refreshToken)

userRouter.get('/user-details',authentication,userDetailsController)

export default userRouter