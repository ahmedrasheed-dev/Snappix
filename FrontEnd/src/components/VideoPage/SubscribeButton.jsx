import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSubscription, fetchSubscriptionStatus } from '../../store/features/subscriptionSlice'
import { notifySuccess, notifyError } from '../../utils/toasts'; 

const SubscribeButton = ({ channelUsername, channelId }) => {
  const dispatch = useDispatch();
  const { isSubscribed, subscriberCount, status, error } = useSelector(
    (state) => state.subscription 
  );
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); 

  useEffect(() => {
    if (channelUsername) {
      dispatch(fetchSubscriptionStatus(channelUsername));
    }
  }, [channelUsername, dispatch]);

  const handleSubscribeToggle = async () => {
    if (!isLoggedIn) {
      notifyError("Please log in to subscribe or unsubscribe.");
      return;
    }
    
    if (status === 'loading') {
      return;
    }

    try {
      const resultAction = await dispatch(toggleSubscription(channelId)).unwrap();
      if (resultAction.subscribed) {
        notifySuccess("Subscribed successfully!");
      } else {
        notifySuccess("Unsubscribed successfully!");
      }
    } catch (err) {
      notifyError(err); 
      console.error("Failed to toggle subscription:", err);
    }
  };

  const buttonText = isSubscribed ? "Subscribed" : "Subscribe";
  const buttonDisabled = status === 'loading' || !isLoggedIn; 

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSubscribeToggle}
        disabled={buttonDisabled}
        className={`px-4 py-2 rounded-full text-white font-semibold transition-colors
                   ${isSubscribed ? 'bg-gray-700 hover:bg-gray-600' : 'bg-pink-600 hover:bg-pink-700'}
                   ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {status === 'loading' ? 'Loading...' : buttonText}
      </button>
      <span className="text-gray-400 text-sm">{subscriberCount} Subscribers</span>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default SubscribeButton;
