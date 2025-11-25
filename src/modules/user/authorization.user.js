import { roleEnum } from "../../DB/models/users.models.js"

export const endPoints = {
    getone: [roleEnum.admin, roleEnum.user],
    newcredentials: [roleEnum.admin, roleEnum.user],
    updateProfile: [roleEnum.user, roleEnum.admin],
    freezeProfile: [roleEnum.user, roleEnum.admin],
    restoreProfile: [roleEnum.user, roleEnum.admin],
    deleteUser: [roleEnum.admin],
    updatePassword: [roleEnum.user, roleEnum.admin],
    logOut: [roleEnum.user, roleEnum.admin],
    updateProfilePic: [roleEnum.user, roleEnum.admin],
    updateCoverImages: [roleEnum.user, roleEnum.admin],
    updateCloudCoverImages: [roleEnum.user, roleEnum.admin],
    updateCloudProfileImage: [roleEnum.user, roleEnum.admin],


}