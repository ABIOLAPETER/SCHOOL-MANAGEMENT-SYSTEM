class HttpError extends Error{
    constructor(message, code){
        super(message)
        this.code = errorCode
    }
}

module.exports = HttpError
