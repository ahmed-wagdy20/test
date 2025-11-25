

export const successResponse = ({ res, statusCode = 200, message="done", details={} }) => {
    return res.status(statusCode).json({
        message,
        details,
    })
}