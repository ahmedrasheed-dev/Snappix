import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserPlaylists,
  updatePlaylistThunk,
  deletePlaylistThunk,
  togglePlaylistThunk,
} from "../../store/features/playlistSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const PlaylistsTab = () => {
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.user);
  const userId = user?._id
  const { userPlaylists, status } = useSelector((state) => state.playlists);

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (userId) dispatch(fetchUserPlaylists(userId));
  }, []);

  const openEditDialog = (playlist) => {
    setSelectedPlaylist(playlist._id);
    setEditForm({
      name: playlist.name,
      description: playlist.description || "",
    });
  };

  const closeEditDialog = () => {
    setSelectedPlaylist(null);
    setEditForm({ name: "", description: "" });
  };

  const handleUpdate = async () => {
    await dispatch(updatePlaylistThunk({ playlistId: selectedPlaylist, data: editForm }));
    closeEditDialog();
  };

  const handleDelete = (playlistId) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      dispatch(deletePlaylistThunk(playlistId));
    }
  };

  const handleToggle = (playlistId) => {
    dispatch(togglePlaylistThunk(playlistId));
  };

  if (status === "loading") {
    return <div className="text-center text-gray-400 text-lg">Loading your playlists...</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-pink-500 mb-6">My Playlists</h2>

      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="min-w-full text-sm text-gray-300">
          <thead className="bg-zinc-800 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Visibility</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {userPlaylists.map((playlist) => (
              <tr key={playlist._id} className="hover:bg-zinc-800/50 transition">
                <td className="px-4 py-3 font-semibold text-gray-100">{playlist.name}</td>
                <td className="px-4 py-3 text-gray-400 truncate max-w-xs">{playlist.description}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      playlist.isPublic
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {playlist.isPublic ? "Public" : "Private"}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(playlist.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEditDialog(playlist)}
                      size="sm"
                      className="bg-zinc-700 hover:bg-zinc-600"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggle(playlist._id)}
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      {playlist.isPublic ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      onClick={() => handleDelete(playlist._id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Edit Dialog */}
        <Dialog open={!!selectedPlaylist} onOpenChange={closeEditDialog}>
          <DialogContent className="sm:max-w-lg bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>Edit Playlist</DialogTitle>
              <DialogDescription>Update your playlist details below.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button className="bg-pink-600 hover:bg-pink-700" onClick={handleUpdate}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PlaylistsTab;
