const errorMessage = async (res,message) => {
    res.json({
        status: "error",
        message: message,
    });
}
module.exports = {
    errorMessage: errorMessage,
}