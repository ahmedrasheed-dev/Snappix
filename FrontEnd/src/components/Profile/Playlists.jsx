import { FaPlay }  from "react-icons/fa";
import { Link } from "react-router-dom";

const Playlists = ({ playlists }) => {
  if (!playlists || playlists.length === 0) {
    return <p className="text-gray-400">No playlists found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {playlists.map((playlist) => (
        <Link
          key={playlist._id}
          to={`/playlist/${playlist._id}`}
          className="group relative block w-full aspect-video rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
        >
          <img
            src={playlist.thumbnail || playlist.videos[0]?.thumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="text-sm font-semibold text-white line-clamp-2">
              {playlist.name}
            </h4>
            <p className="text-xs text-gray-300 mt-1">
              {playlist.totalVideos} videos
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaPlay className="text-white text-4xl" />
          </div>
        </Link>
      ))}
    </div>
  );
};
export default Playlists;
