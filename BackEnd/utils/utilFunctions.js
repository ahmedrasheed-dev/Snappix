function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Handle non-string or empty input
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const convertMillisToMinutes = (milliseconds) => {
  if (typeof milliseconds !== "number" || milliseconds < 0) {
    return 0; // Handle invalid input
  }
  const minutes = milliseconds / (1000 * 60);
  return minutes;
};

export { capitalizeFirstLetter, convertMillisToMinutes };