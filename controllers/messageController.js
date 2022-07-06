const errorMessage = (res,message) => {
    res.json({
        status: "error",
        message: message,
    });
}

const successMessage = (res,message,data) => {
    res.json({
        status: "success",
        message: message,
        data: data,
    })
}

module.exports = {
    errorMessage: errorMessage,
    successMessage: successMessage,
}