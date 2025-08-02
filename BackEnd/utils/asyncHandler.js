//higher order function that wraps arround your controller
//to avoid writing try catch again and again
const asyncHandler = (fn) => {
  return (error, req, res, next) => {
    Promise.resolve(fn(error, req, res, next)).catch(
      (err) => next(err)
    );
  };
};
export default asyncHandler;