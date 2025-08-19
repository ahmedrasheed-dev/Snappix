import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchSinglePlaylist, clearSinglePlaylist } from "../../store/features/playlistSlice.js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlayCircle } from "lucide-react";

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const dispatch = useDispatch();
  const { singlePlaylist, status, error } = useSelector((s) => s.playlists);

  useEffect(() => {
    if (playlistId) dispatch(fetchSinglePlaylist(playlistId));
    return () => {
      dispatch(clearSinglePlaylist());
    };
  }, [dispatch, playlistId]);

  if (status === "loading") {
    return <div className="text-center text-white">Loading playlist...</div>;
  }
  if (status === "failed") {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }
  if (!singlePlaylist) {
    return <div className="text-center text-white">No playlist found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-6 py-10">
      {/* Playlist header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-80 h-48 md:h-56 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center">
          {singlePlaylist.videos?.[0]?.thumbnail ? (
            <img
              src={singlePlaylist.videos[0].thumbnail}
              alt={singlePlaylist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <PlayCircle className="w-16 h-16 text-white/60" />
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{singlePlaylist.name}</h1>
          <p className="text-white/60 mb-4">{singlePlaylist.description}</p>
          <p className="text-sm text-white/60 mb-2">{singlePlaylist.videos?.length || 0} videos</p>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={singlePlaylist.owner?.avatar} />
              <AvatarFallback>{singlePlaylist.owner?.fullName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{singlePlaylist.owner?.fullName}</h3>
              <p className="text-sm text-white/50">@{singlePlaylist.owner?.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Videos */}
      <div className="space-y-4">
        {singlePlaylist.videos?.map((video, idx) => (
          <Link to={`/video/${video._id}`}
            key={video._id}
            className="flex gap-4 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition"
          >
            <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-lg line-clamp-2 mb-1">{video.title}</h4>
              <p className="text-sm text-white/60">
                {video.owner.fullName} • {video.views} views
              </p>
              <p className="text-xs text-white/40">#{idx + 1} in playlist</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
