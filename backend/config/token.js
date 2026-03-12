import jwt from "jsonwebtoken"

const genToken = async (userId)=>{
    try {
        const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn:"7d"})
        return token
    } catch (error) {
        console.error(`Gen token error: ${error}`)
        throw new Error(`Gen token error: ${error}`)
    }
}

export default genToken