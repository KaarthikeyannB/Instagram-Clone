import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    video: {
      type: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "User",
          required: true,
        },
      },
    ],
    descriptions: [{ type: String }],
    hashtags: [{ type: String }],
    saved: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" ,default:[]}
    ]
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
