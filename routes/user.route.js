import {Router} from 'express'
import {loginUserController, logoutUserController, registerUserController, removeImageFromCloudinary, userAvatarController, verifyEmailController} from '../controllers/user.controller.js'
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

export default userRouter