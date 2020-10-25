const sendMessage = (text) => {
    return {
        text,
        sendAt: new Date().getTime()
    }
}

module.exports = {
    sendMessage
}