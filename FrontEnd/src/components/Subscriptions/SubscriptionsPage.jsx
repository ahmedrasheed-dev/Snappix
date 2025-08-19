import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Users } from "lucide-react";
import { fetchSubscribers, fetchSubscribedChannels } from "@/store/features/subscriptionsSlice";

const SubscriptionsPage = () => {
  const dispatch = useDispatch();

  const { subscribers, subscribedChannels, status, error } = useSelector(
    (state) => state.subscriptions
  );
  const userId = useSelector((state) => state.user.user?._id); // assuming logged-in user available

  useEffect(() => {
    if (userId) {
      dispatch(fetchSubscribers(userId)); // who subscribed to me
      dispatch(fetchSubscribedChannels(userId)); // whom I subscribed to
    }
  }, [dispatch, userId]);

  if (status === "loading") {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500">Error: {error || "Something went wrong"}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Subscriptions</h1>

      <Tabs defaultValue="subscribedTo" className="w-full">
        <TabsList className="flex gap-4 bg-zinc-800 p-2 rounded-2xl mb-6">
          <TabsTrigger
            value="subscribedTo"
            className="flex items-center gap-2 text-pink-500 data-[state=active]:bg-pink-600 data-[state=active]:text-white p-4 rounded-xl"
          >
            <UserPlus className="w-4 h-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger
            value="subscribers"
            className="flex items-center gap-2 text-pink-500 data-[state=active]:bg-pink-600 data-[state=active]:text-white p-4 rounded-xl"
          >
            <Users className="w-4 h-4" />
            Your Subscribers
          </TabsTrigger>
        </TabsList>

        {/* Subscribed To Section */}
        <TabsContent value="subscribedTo">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscribedChannels.length === 0 ? (
              <p className="text-white/60">You haven’t subscribed to anyone yet.</p>
            ) : (
              subscribedChannels.map((channel) => (
                <Card
                  key={channel._id}
                  className="bg-zinc-800 border-zinc-700 rounded-2xl shadow-md hover:shadow-lg transition"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar>
                      <AvatarImage src={channel.avatar} alt={channel.username} />
                      <AvatarFallback>{channel.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{channel.fullName}</h3>
                      <p className="text-sm text-white/50">@{channel.username}</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl"
                    >
                      <Link to={`/channel/${channel.username}`}>View</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Subscribers Section */}
        <TabsContent value="subscribers">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscribers.length === 0 ? (
              <p className="text-white/60">You don’t have any subscribers yet.</p>
            ) : (
              subscribers.map((user) => (
                <Card
                  key={user._id}
                  className="bg-zinc-800 border-zinc-700 rounded-2xl shadow-md hover:shadow-lg transition"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.fullName}</h3>
                      <p className="text-sm text-white/50">@{user.username}</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl"
                    >
                      <Link to={`/channel/${user.username}`}>Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionsPage;
