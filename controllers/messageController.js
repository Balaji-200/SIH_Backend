const errorMessage = async (res,message) => {
    res.json({
        status: "error",
        message: message,
    });
}
const successMessage = async (res,message,data) => {
    res.json({
        status: "success",
        message: message,
        data: data,
    })
}
module.exports = {
    errorMessage: errorMessage,
    successMessage: successMessage
}