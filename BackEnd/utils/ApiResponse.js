//in order to send a standarized response
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.data = data;
    this.statusCode = statusCode;
    //data will be an object
    this.data = data;
    this.success = statusCode < 400;
  }
}
export { ApiResponse };