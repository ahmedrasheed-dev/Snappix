// This file simulates your API layer.
// Replace these with actual Axios calls to your backend endpoints.

// DUMMY DATA
const dummyVideos = [
  { _id: '1', title: 'My First Video', thumbnail: 'https://via.placeholder.com/150', views: 1250, likes: 250, isPublished: true },
  { _id: '2', title: 'Cooking Guide', thumbnail: 'https://via.placeholder.com/150', views: 800, likes: 120, isPublished: true },
  { _id: '3', title: 'Travel Vlog', thumbnail: 'https://via.placeholder.com/150', views: 300, likes: 50, isPublished: false },
];

const dummyStats = {
  totalViews: 2350,
  totalLikes: 420,
};

// SIMULATED API FUNCTIONS
export const fetchDashboardStats = () => {
  return new Promise(resolve => setTimeout(() => resolve(dummyStats), 500));
};

export const fetchMyVideos = () => {
  return new Promise(resolve => setTimeout(() => resolve(dummyVideos), 500));
};

export const updateVideo = (videoId, newDetails) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const updatedVideos = dummyVideos.map(video =>
        video._id === videoId ? { ...video, ...newDetails } : video
      );
      resolve(updatedVideos);
    }, 500);
  });
};

export const deleteVideo = (videoId) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const updatedVideos = dummyVideos.filter(video => video._id !== videoId);
      resolve(updatedVideos);
    }, 500);
  });
};

export const updateProfile = (profileData) => {
  console.log('API call to update profile with:', profileData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (profileData.username === 'takenusername') {
        reject(new Error('Username is already taken.'));
      } else {
        resolve({ success: true, message: 'Profile updated' });
      }
    }, 500);
  });
};