import { Schema, model } from "mongoose";

const textSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    pin: {
        type: Schema.Types.ObjectId,
        ref: "Pin",
        required: true,
    },
});

const videoSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    redirect: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    pin: {
        type: Schema.Types.ObjectId,
        ref: "Pin",
        required: true,
    },
});

const PinSchema = new Schema({
    texts: {
        type: [Schema.Types.ObjectId],
        ref: "Text",
        default: [],
    },
    videos: {
        type: [Schema.Types.ObjectId],
        ref: "Video",
        default: [],
    },
    pos: {
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
    },
    pinBoard: {
        type: Schema.Types.ObjectId,
        ref: "PinBoard",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PinBoardSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    preview: {
        type: String,
        default: "",
    },
    pins: {
        type: [Schema.Types.ObjectId],
        ref: "Pin",
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const UserSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    pinBoards: {
        type: [Schema.Types.ObjectId],
        ref: "PinBoard",
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = model("User", UserSchema);
const PinBoard = model("PinBoard", PinBoardSchema);
const Pin = model("Pin", PinSchema);
const Text = model("Text", textSchema);
const Video = model("Video", videoSchema);

export { User, PinBoard, Pin, Text, Video };
