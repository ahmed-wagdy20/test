import multer from "multer";
import path from "path";
import fs from "fs";

export const fileValidation = {
    images: ["image/png", "image/jpeg", "image/jpg"],
    videos: ["video/mp4", "video/mpeg", "video/avi"],
    audios: ["audio/mpeg", "audio/mp3", "audio/wav"],
    documents: ["application/pdf"]
}

const upload = function ({ customPath = "general", validation = [] }) {

    let basePath = `./src/uploads`;
    let fullPath = `${basePath}/${customPath}`;

    const storage = multer.diskStorage({

        destination: function (req, file, cb) {
            if (req.user?._id) {
                fullPath = `${basePath}/${customPath}/${req.user._id}`;
            };
            file.finalPath = `/uploads/${customPath}/${req.user._id}`;
            const fileExist = fs.existsSync(fullPath);
            if (!fileExist) {
                fs.mkdirSync(fullPath, { recursive: true })
            };
            cb(null, path.resolve(fullPath))
        },
        filename: function (req, file, cb) {
            const uniqueName=Date.now() + "__" + Math.round(Math.random() * 1E9) + "__" + file.originalname;
            file.finalPath=`${file.finalPath}/${uniqueName}`
            cb(null,uniqueName )
        },

    });

    const fileFilter = (req, file, cb) => {

        if (validation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(null, false);

            cb(new Error("invalid file type"))
        };


    }


    return multer({
        fileFilter,
        storage
    })
};


export {
    upload
}