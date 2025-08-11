//higher order function that wraps arround your controller
//to avoid writing try catch again and again
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(
      (err) => next(err)
    )
  };
};
export default asyncHandler;