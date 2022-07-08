// initialize jwt
var jwt = require('jsonwebtoken');

// jwt secret
const JWT_SECRET = process.env.JWT_SECRET

const validateToken = (req,res,next) => {
    try {
        let token = req.headers.authorization
        if(token){
            token = token.split(" ")[1]
            let decoded = jwt.verify(token,JWT_SECRET)
            req.userId = decoded.user.id
        }
        else{
            return res.status(401).json({ message :  "uthorized user"});
        }
        next();
    } catch (error) {
        console.log(error)
    }
}

module.exports = validateToken