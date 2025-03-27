import multer from "multer";

const storage = multer.diskStorage({                                                                        // hum yha par diskstorage ka use kar rhe hai memoryStorage ka use bhi kar sakte hai but agr koi badi file aati hai to (jese video ) to memory bhar jaegy
    destination: function (req, file, cb) {                                                                 // hum file(multer se hi milta hai) ka use karne ke liye multer ka use karte hai 
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({
     storage, 
 })