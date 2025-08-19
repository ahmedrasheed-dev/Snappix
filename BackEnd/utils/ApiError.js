class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  // send(res) {
  //   return res.status(this.statusCode).json({
  //     success: false,
  //     message: this.message,
  //     errors: this.errors,
  //   });
  // }
}
export { ApiError };
