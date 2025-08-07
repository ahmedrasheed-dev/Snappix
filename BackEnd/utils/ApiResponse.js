//in order to send a standarized response
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    //data will be an object
    this.data = data;
    this.success = statusCode < 400;
    this.message = message;
  }
  send(res) {
    return res.status(this.statusCode).json({
      success: true,
      message: this.message,
      data: this.data,
    });
  }
}
export { ApiResponse };
