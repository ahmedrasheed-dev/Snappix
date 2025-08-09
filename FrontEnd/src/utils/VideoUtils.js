export const formatViews = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M views";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(0) + "K views";
  }
  return count + " views";
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const paddedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${minutes}:${paddedSeconds}`;
};
