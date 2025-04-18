import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    // mobile: {
    //     type: String,
    //     required: true,
    // },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
    profileImg: {
        type: String,
        default: "",
    },
    bio:{
        type: String,
        default: "",
    },
    link:{
        type: String,
        default: "",
    },
    highlights: {
		type: [String], 
		default: [],
	},
	story: {
		type: [String], 
		default: [],
	},
	notes: {
		type: [String], 
		default: [],
	},
    saved:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: [],
        }
    ],
    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: [],
        },
    ],
    // mentioned:[
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Post",
    //         default: [],
    //     }
    // ]
},{timestamps:true});


const User = mongoose.model("User", userSchema);
export default User;