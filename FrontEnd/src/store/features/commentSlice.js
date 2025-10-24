import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axios";

const initialState = {
  comments: [],
  commentFetchStatus: "idle",
  addCommentStatus: "",
  error: null,
};

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_BASE_URL}/comments/${videoId}`
      );
      return response.data.data.docs;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message || "Failed to fetch comments."
      );
    }
  }
);
export const addCommentToVideo = createAsyncThunk(
  "comments/addCommentToVideo",
  async ({ videoId, content }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_URL}/comments/${videoId}`,
        { content }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message || "Failed to add comment."
      );
    }
  }
);
export const addReplyToComment = createAsyncThunk(
  "comments/addReplyToComment",
  async ({ videoId, commentId, content }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_BASE_URL}/comments/reply/${videoId}/${commentId}`,
        { content }
      );
      return {
        parentCommentId: commentId,
        reply: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response.data.message || "Failed to add reply."
      );
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.commentFetchStatus = "loading";
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentFetchStatus = "succeeded";
        state.comments = action.payload.map((c) => ({
          ...c,
          commentOwners: c.commentOwners?.[0] || {},
        }));
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentFetchStatus = "failed";
        state.error = action.payload;
      })
      .addCase(addCommentToVideo.pending, (state) => {
        state.addCommentStatus = "loading";
      })
      .addCase(addCommentToVideo.fulfilled, (state, action) => {
        const comment = {
          ...action.payload,
          commentOwners: action.payload.commentOwners?.[0] || {},
        };

        state.comments.unshift(comment);
        state.error = null;
        state.addCommentStatus = "succeeded";
      })
      .addCase(addCommentToVideo.rejected, (state, action) => {
        state.addCommentStatus = "failed";
        state.error = action.payload;
      })
      .addCase(addReplyToComment.fulfilled, (state, action) => {
        const { parentCommentId, reply } = action.payload;
        reply.replyOwners = reply.replyOwners[0]; // flatten array to object
        const parentComment = state.comments.find(
          (comment) => comment._id === parentCommentId
        );
        if (parentComment) {
          parentComment.replies.push(reply);
        }
      })
      .addCase(addReplyToComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default commentsSlice.reducer;
