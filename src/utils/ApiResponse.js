class ApiResponse {
    constructor(
        statusCode,
        data,
        maassege = "Success"
    ){
        this.statusCode = statusCode,
        this.data = data,
        this.maassege = maassege,
        this.success = statusCode < 400 
    }
}

export default ApiResponse;