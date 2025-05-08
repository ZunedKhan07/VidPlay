import { Router } from "express";
import { loginUser, changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

    router.route("/login").post(loginUser)

    // secured route
    router.route("/logout").post(varifyJWT, logoutUser)
    
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change_Password").post(varifyJWT, changeCurrentPassword)
    router.route("/Current-User").get(varifyJWT, getCurrentUser)
    router.route("/Account-Update").patch(varifyJWT, updateAccountDetails) // post all details ko update kar dega
    router.route("/Update-Avatar").patch(varifyJWT, upload.single("avatar"), updateUserAvatar) // kyuki data req.file se aa rha hai
    router.route("/Update-CoverImage").patch(varifyJWT, upload.single("coverImage"), updateUserCoverImage)
    router.route("/c/:username").get(varifyJWT, getUserChannelProfile) // kyuki data params se aa rha hai and username hi likhna zruri hai
    router.route("/history").get(varifyJWT, getWatchHistory)


export default router