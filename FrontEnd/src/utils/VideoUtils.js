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
export const formatTimeAgo = (dateString) => {
  // Add this check to handle invalid date strings gracefully
  if (!dateString || isNaN(new Date(dateString))) {
    return "Unknown date";
  }

  const now = new Date();
  const then = new Date(dateString);
  const seconds = Math.floor((now - then) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
  if (months > 0) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  if (days > 0) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }
  return seconds <= 1 ? "just now" : `${seconds} seconds ago`;
};
