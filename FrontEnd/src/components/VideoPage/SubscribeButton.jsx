import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleSubscription,
  fetchSubscriptionStatus,
} from "../../store/features/subscriptionSlice";
import { notifySuccess, notifyError } from "../../utils/toasts";

const SubscribeButton = ({ channelUsername, channelId }) => {
  const dispatch = useDispatch();
  const { isSubscribed, subscriberCount, status } = useSelector((s) => s.subscription);
  const { isLoggedIn, user } = useSelector((s) => s.user);

  // Do not show subscribe button on your own channel
  const isOwnChannel = user?.username && channelUsername && user.username === channelUsername;

  useEffect(() => {
    if (channelId && isLoggedIn && !isOwnChannel) {
      dispatch(fetchSubscriptionStatus(channelId));
    }
  }, [channelId, isLoggedIn, isOwnChannel, dispatch]);

  const handleSubscribeToggle = async () => {
    if (!isLoggedIn) {
      notifyError("Please log in to subscribe or unsubscribe.");
      return;
    }
    if (status === "loading") return;

    try {
      const result = await dispatch(toggleSubscription(channelId)).unwrap();
    } catch (err) {
      notifyError(err);
      console.error("Failed to toggle subscription:", err);
    }
  };

  const buttonText = isSubscribed ? "UnSubscribe" : "Subscribe";
  const buttonDisabled = status === "loading" || !isLoggedIn;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSubscribeToggle}
        disabled={buttonDisabled}
        className={`px-4 py-2 rounded-full text-white font-semibold transition-colors
                   ${
                     isSubscribed
                       ? "bg-gray-700 hover:bg-gray-600"
                       : "bg-pink-600 hover:bg-pink-700"
                   }
                   ${buttonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {status === "loading" ? "Loading..." : buttonText}
      </button>
    </div>
  );
};

export default SubscribeButton;
