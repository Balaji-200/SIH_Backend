const successMessage = async (res,message,data) => {
    res.json({
        status: "success",
        message: message,
        data: data,
    })
}
module.exports = {
    successMessage: successMessage,
}