import cloudinary from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(filePath, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};




// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// cloudinary.config({ 
//     cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
//     api_key: 'process.env.CLOUDINARY_API_KEY', 
//     api_secret: 'process.env.CLOUDINARY_API_SECRET' 
// });

// const uploadOnCloudinary = async (localFilePath) => {
//    try {
//         if (!localFilePath) return null
//         //upload the file on cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//             //file has been successfully uploaded            
//             console.log('file successful uploaded', response.url)
//             return response;
//    } catch (error) {
//     fs.unlinkSync(localFilePath) // remove the file as it has not been uploaded
//     console.log('error uploading file', error)
//    }
// }

// export {uploadOnCloudinary}