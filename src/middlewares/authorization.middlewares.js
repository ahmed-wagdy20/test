


export const authorization = ({ accessRoles = [] }) => {
    return (req, res, next) => {
        if (!accessRoles.includes(req.user.role)) {
            return next(new Error("unauthorized", { cause: 403 }))
        };
        next()
    }
}