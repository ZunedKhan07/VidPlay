class ApiError extends Error {
    constructor(
        statusCode,
        massege = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(massege)
        this.statusCode = statusCode
        this.data = null
        this.massege = massege
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError;