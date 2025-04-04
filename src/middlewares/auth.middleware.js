import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const varifyJWT = asyncHandler( async(req, res, next) => {
    try {
        const token = req.cookie?.accessToken || req
        .header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthorised Request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(404, "Invelide Access Token")
        }
    } catch (error) {
        throw new ApiError(401, "Invelide Access Token")
    }
})

export { varifyJWT }