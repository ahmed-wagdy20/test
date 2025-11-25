import { Router } from "express";
import * as userServices from "./user.service.js";
import { authentication } from "../../middlewares/authentication.middlewares.js";
import { tokenEnum } from "../../middlewares/authentication.middlewares.js";
import { authorization } from "../../middlewares/authorization.middlewares.js";
import { endPoints } from "./authorization.user.js";
import * as userValidationSchemas from "./user.validation.js";
import { validation } from "../../middlewares/validation.middlewares.js";
import { upload } from "../../utils/multer/multer.utils.js";
import { fileValidation } from "../../utils/multer/multer.utils.js";
import { cloudUpload } from "../../utils/multer/cloudMulter.js";
const router = Router();

router.get("/getone", validation(userValidationSchemas.getone), authentication({ tokenType: tokenEnum.access }), authorization({ accessRoles: endPoints.getone }), userServices.getUser);
router.get("/newcredentials", validation(userValidationSchemas.getNewCredentialsSchema), authentication({ tokenType: tokenEnum.refresh }), authorization({ accessRoles: endPoints.newcredentials }), userServices.getNewCredentialss);
router.get("/share-profile/:userId", validation(userValidationSchemas.shareProfileSchema), userServices.shareProfile)
router.patch("/update-profile", validation(userValidationSchemas.updateProfileSchema), authentication({ tokenType: tokenEnum.access }), authorization({ accessRoles: endPoints.updateProfile }), userServices.updateProfile);
router.delete("/freeze-user{/:userId}", validation(userValidationSchemas.freezeProfile), authentication({ tokenType: tokenEnum.access }), authorization({ accessRoles: endPoints.freezeProfile }), userServices.freezeProfile);
router.patch("/restore-user{/:userId}", validation(userValidationSchemas.restoreProfile), authentication({ tokenType: tokenEnum.access }), authorization({ accessRoles: endPoints.freezeProfile }), userServices.restoreProfile);
router.delete("/delete/:userId", validation(userValidationSchemas.deleteUser), authentication({ tokenType: tokenEnum.access }), authorization({ accessRoles: endPoints.deleteUser }), userServices.deleteUser);
router.post("/update-profile-pic", authentication({ tokenType: tokenEnum.access }), upload({ customPath: "user", validation: fileValidation.images }).single("photo"), validation(userValidationSchemas.updateProfilePic), authorization({ accessRoles: endPoints.updateProfilePic }), userServices.updateProfilePic);
router.post("/update-cover-images", authentication({ tokenType: tokenEnum.access }), upload({ customPath: "user", validation: fileValidation.images }).array("photos", 3), validation(userValidationSchemas.updateCoverImages),authorization({ accessRoles: endPoints.updateCoverImages }), userServices.updateCoverImages);
router.post("/update-profile-cloud-image",authentication({tokenType:tokenEnum.access}),cloudUpload({validation:fileValidation.images}).single("profile"),authorization({accessRoles:endPoints.updateCloudProfileImage}),userServices.updateCloudProfileImage)
router.post("/update-cloud-cover-images",authentication({tokenType:tokenEnum.access}),cloudUpload({validation:fileValidation.images}).array("cover",3),authorization({accessRoles:endPoints.updateCloudCoverImages}),userServices.updateCloudCoverImages)
export default router;