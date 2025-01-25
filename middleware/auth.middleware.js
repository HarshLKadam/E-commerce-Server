import jwt from 'jsonwebtoken'
const authentication = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1];

        // if (!token) {
        //     token=req.query.token
        // }
        
        if(!token){
             console.log('No token provided');
            return res.status(401).json({
                message: 'Token not provided',
                error: true,
                success: false,
            });
        }

        console.log('Token:', token); 

        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        if (!decoded) {
            console.log('Token verification failed');
            return res.status(403).json({
                message: "Invalid or expired token",
                error: true,
                success: false,
            });
        }

        req.userId = decoded.id;
        next();
    } 
    catch (error) {
        console.error('Authentication Error:', error);
        return res.status(500).json({
            message: 'Authentication failed',
            error: true,
            success: false,
        });
    }
};

export default authentication
