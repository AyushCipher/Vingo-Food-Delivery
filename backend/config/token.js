import jwt from "jsonwebtoken"

const genToken = async (userId)=>{
    try {
        const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn:"7d"})
        return token
    } catch (error) {
        return res.status(500).json(`Gen token error: ${error}`)
    }
}

export default genToken