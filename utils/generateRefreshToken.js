import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const generateRefreshToken = async (userId) => {
    const token = await jwt.sign({
        id: userId
    },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN
        }
    )

    const updateRefreshToken = await User.updateOne(
        {
            _id: userId
        },
        {
            refresh_token:token
        }
    )

    return token
}

export default generateRefreshToken
