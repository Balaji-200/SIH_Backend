const errorMessage = (message) => {

    return res.json({
        status: "error",
        message: message,
    });
}

module.exports = {
    errorMessage: errorMessage,
}