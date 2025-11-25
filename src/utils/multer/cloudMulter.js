import multer from "multer";

export const cloudUpload = function ({ validation = [] }) {



    const storage = multer.diskStorage({

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