import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.models.js';
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
   
    // get user data from fromtend
    // validation - not empty
    // check if user already exits : email or username
    // check for images and avatar
    // upload them to cloudinary, avatar
    // create user obj and entry in db
    // remove password and refresh token from response
    // return response
    
    const {userName, fullName, email, password} = req.body();
    console.log("userName= ", userName);
    console.log("fullName= ", fullName);
    console.log("email= ", email);
    console.log("password= ", password);

    if (
        [fullName, userName, email, password].some((field) => 
        field?.trim() === "",
        )
    ) {
     throw new ApiError(400, "All fields are required")   
    }


    const exitedUser = User.findOne({
        $or : [ {userName}, {email} ]
    })
    if (exitedUser) {
        throw ApiError(408, "userName or email already exits")
    }
    
     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;
     console.log(avatarLocalPath)

     if (!avatarLocalPath) {
        ApiError(400, "Avatar file is required")
     }

     const avatar = await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if (!avatar) {
        throw ApiError(400, "Avatar file is required")
     }

     const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" 
     })
     const createduser = await User.findById(user._id).select(
        " -password -refreshToken "
     )

     if (!createduser) {
        throw ApiError(500, "Something went wrong while creating user")
     }

     return res.status(201).json(
        new ApiResponse(200, "User created successfully", createduser)
     )
})

export {registerUser}