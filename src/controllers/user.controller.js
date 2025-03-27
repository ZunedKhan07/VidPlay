import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) => {
    return res.status(200).json({
        message: "Hello from Zuned Khan.This is my first Backend Postman text"
    })
})

export {registerUser}