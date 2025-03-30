import { asyncHandler } from "../utils/asyncHandler.js";
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
