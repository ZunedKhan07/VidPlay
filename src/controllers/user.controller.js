import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import  ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

    const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


    })

    const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
  
    // Check if either username or email is provided
    if (!username && !email) {
      throw new ApiError(400, "Username or email must be provided");
    }
  
    // Find user by username or email
    const user = await User.findOne({ $or: [{ username }, { email }] });
  
    // If user not found, throw error
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
  
    // Validate password
    const isPasswordValid = await user.isPasswordValid(password);
  
    // If password is invalid, throw error
    if (!isPasswordValid) {
      throw new ApiError(401, "Wrong password");
    }
  
    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
  
    // Send the user details and tokens in response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
    const options = {
      httpOnly: true,
      secure: true, // Set to true in production
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        status: 200,
        message: "User logged in successfully",
        data: {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
      });
    });

    const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
    
        {
            $set: {refreshToken}
        },
        {
            new: true
        }
    ,
    )
     const options = {
             httpOnly: true,
             secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logedout successfully"))

    })

    const refreshAccessToken = asyncHandler(async(req, res) => {
        const incomingrefreshToken = 
        req.cookie.refreshToken || req.body.refreshToken

        if (!incomingrefreshToken) {
            throw new ApiError(401, "unauthorised request")
        }

       try {
         const decodedToken = jwt.verify(incomingrefreshToken,
               process.env.REFRESH_TOKEN_SECRET)
 
         const user = User.findById(decodedToken?._id)
         
         if (!user) {
             throw new ApiError(401, "Invalid refresh token")
         }
           
         if (incomingrefreshToken !== user?.refreshToken) {
             throw new ApiError(409, "Refresh Token is expired or used")
         }
 
         const options = {
          httpOnly: true,
          secure: true   
         }
 
         const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user?._id)
 
         return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
             new ApiResponse(
                 200,
                 {accessToken, refreshToken: newRefreshToken},
                 "AccessToken Refreshed"
             )
         )
       } catch (error) {
        throw new ApiError(405, error?.message || "Invelid Refreshed Token")
       }
    })

    const changeCurrentPassword = asyncHandler(async (req, res) => {
        const {oldPassword, newPassword} = req.body
         
        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordValid(oldPassword)

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid old Password")
        }
        user.password = newPassword
        await user.save({validateBeforeSave: false})

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Chenged Succesfully"))
    })

    const getCurrentUser = asyncHandler(async(req, res) => {
        return res
        .status(200)
        .json(200, req.user, "current User fatched successfully")
    })

    const updateAccountDetails = asyncHandler(async(req, res) => {
        const {fullName, email} = req.body

        if (!(fullName || email)) {
            throw new ApiError(400, "FullName or email is required")
            
        }
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    fullName,
                    email
                }
            },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details update Successfully")
        )
    })

    const updateUserAvatar = asyncHandler(async(req, res) => {
        const avatarLocalPath = req.file?._id

        if (!avatarLocalPath) {
            throw new ApiError(401, "Avatar is Required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)

        if (!avatar.url) {
            throw new ApiError(401, "Avatar Path is Invaelid")
        }

       const user =  await User.findByIdAndUpdate(
            req.file?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(200,
             avatar, "Avatar updated Successfully"
        )
    })

    const updateUserCoverImage = asyncHandler(async(req, res) => {
        const coverImageLocalPath = req.file?._id

        if (!coverImageLocalPath) {
            throw new ApiError(401, "Avatar is Required")
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!coverImage.url) {
            throw new ApiError(401, "CoverImage Path is Invaelid")
        }

        const user = await User.findByIdAndUpdate(
            req.file?._id,
            {
                $set: {
                    coverImage: coverImage.url
                }
            },
            {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(200,
             user, "Cover Image updated Successfully"
        )
    })

    const getUserChannelProfile = asyncHandler(async(req, res) => {
        const {username} = req.params;

        if (!username) {
            throw new ApiError(400, "username is not exits")
        }

        const channel = User.aggregate([
            {
                $match:{
                    username : username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribering"
                }
            },
            {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    channelSubscriberCount: {
                        $size: "$subscribering"
                    },
                    isSubscribered: {
                        $cond: {
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscriberCount: 1,
                    channelSubscriberCount: 1,
                    isSubscribered: 1
                }
            }
            
        ])
        console.log(channel);
        if (!channel) {
            throw new ApiError(404, "channel does not exits")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "channel fached successfully")
        )

    })

    // req.user?._id mongoDB ki id nhi deta balki ek string deta hai
    // aur jab hum us par mongoose ke opretion lagate hai to mongoose usme se id nikalta hai 
    // but agar hum bina kisi mongoose ke opretion ka use kie use karte hai to str hi milti hai 
    // jisko hme change karna padhta hai agli arr. pipeline me iska use use kia hai

    const getWatchHistory = asyncHandler(async (req, res) => {
        const user = await aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "WatchHistory",
                    pipeline: [
                        {
                          $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                          }
                        },

                        // because owner as a array milega
                        // uska first obj. nikalne ke liye
                        {
                            $addFields: {
                                // owner ko overlape kar rhe hai
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                user[0].watchHistory,
                "WatchHistory Fatched Successfully"
            )
        )
    })

export {
         registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage,
         getUserChannelProfile,
         getWatchHistory
       }











/* import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import ApiResponse from "../utils/ApiResponse.js";
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });  // Set up multer to store files

// Register user with file upload


const registerUser = asyncHandler( async (req, res) => {
    const { userName, fullName, email, password } = req.body;
    console.log("userName= ", userName);
    console.log("fullName= ", fullName);
    console.log("email= ", email);
    console.log("password= ", password);

    if (
        [fullName, userName, email, password].some((field) => 
        field?.trim() === "",
        )
    ) {
     throw new ApiError(400, "All fields are required");
    }

    const exitedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });
    if (exitedUser) {
        throw new ApiError(408, "userName or email already exists");
    }

    // Check if files exist before accessing them
    if (!req.files || !req.files.avatar || !req.files.coverImage) {
        throw new ApiError(400, "Both avatar and cover image are required");
    }

    const avatarLocalPath = req.files.avatar[0]?.path;
    const coverImageLocalPath = req.files.coverImage[0]?.path;
    console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Uploading the avatar and cover image to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // User creation logic
    const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" 
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res.status(201).json(
        new ApiResponse(200, "User created successfully", createdUser)
    );
});





// const registerUser = asyncHandler( async (req, res) => {
//     const { userName, fullName, email, password } = req.body;
//     console.log("userName= ", userName);
//     console.log("fullName= ", fullName);
//     console.log("email= ", email);
//     console.log("password= ", password);

//     if (
//         [fullName, userName, email, password].some((field) => 
//         field?.trim() === "",
//         )
//     ) {
//      throw new ApiError(400, "All fields are required");
//     }

//     const exitedUser = await User.findOne({
//         $or: [{ userName }, { email }]
//     });
//     if (exitedUser) {
//         throw new ApiError(408, "userName or email already exists");
//     }

//     const avatarLocalPath = req.files?.avatar[0]?.path;
//     const coverImageLocalPath = req.files?.coverImage[0]?.path;
//     console.log(avatarLocalPath);

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is required");
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath);
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//     if (!avatar) {
//         throw new ApiError(400, "Avatar file is required");
//     }

//     const user = await User.create({
//         userName: userName.toLowerCase(),
//         fullName,
//         email,
//         password,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "" 
//     });

//     const createdUser = await User.findById(user._id).select("-password -refreshToken");

//     if (!createdUser) {
//         throw new ApiError(500, "Something went wrong while creating user");
//     }

//     return res.status(201).json(
//         new ApiResponse(200, "User created successfully", createdUser)
//     );
// });

export { registerUser };
*/