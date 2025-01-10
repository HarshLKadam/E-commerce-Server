import jwt from 'jsonwebtoken';

const generateAccesstoken = async (userid) => {
    const token = await jwt.sign(
        {
            id: userid
        },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN
        }
    );
    return token;
};

export default generateAccesstoken;
