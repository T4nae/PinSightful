import mongoose from "mongoose";
import * as model from "./model.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export const addUserData = async (data) => {
    const User = mongoose.model("User");
    const user = new User(data);
    await user.save();

    return user;
};

export const getUserData = async (userId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    return user;
};

export const addPinBoard = async (userId, data) => {
    const User = mongoose.model("User");
    const PinBoard = mongoose.model("PinBoard");

    const user = await User.findOne({
        userId,
    });

    const pinBoard = new PinBoard({
        user,
        ...data,
    });

    await pinBoard.save();
    await user.pinBoards.push(pinBoard.id);
    await user.save();

    return pinBoard;
};

export const getPinBoard = async (userId, pinBoardId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }
    const pinBoard = await model.PinBoard.findById(pinBoardId);
    return pinBoard;
};

export const getPinBoards = async (userId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    const pinBoards = await model.PinBoard.find({
        _id: {
            $in: user.pinBoards,
        },
    });
    return pinBoards;
};

export const addPin = async (userId, pinBoardId, data) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }
    const Pin = mongoose.model("Pin");
    const pinBoard = await model.PinBoard.findById(pinBoardId);
    const texts = data.texts;
    const videos = data.videos;
    delete data.texts;
    delete data.videos;

    const pin = new Pin({
        pinBoard,
        ...data,
    });

    const textsArray = [];
    const videosArray = [];

    if (texts !== undefined) {
        for (const text of texts) {
            const textData = new model.Text({
                text,
                pin,
            });
            await textData.save();
            await textsArray.push(textData);
        }
    }

    if (videos !== undefined) {
        for (const video of videos) {
            const videoData = new model.Video({
                url: video,
                pin,
            });
            await videoData.save();
            await videosArray.push(videoData);
        }
    }

    pin.texts = textsArray;
    pin.videos = videosArray;

    await pin.save();
    await pinBoard.pins.push(pin.id);
    await pinBoard.save();

    return pin;
};

export const getPins = async (userId, pinBoardId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }
    const pins = await model.Pin.find({
        pinBoard: pinBoardId,
    });

    // get all texts and videos for each pin
    let resPins = [];
    for (let i in pins) {
        const pin = pins[i];
        const texts = await model.Text.find({
            pin: pin._id,
        });
        const videos = await model.Video.find({
            pin: pin._id,
        });
        delete pin.texts;
        delete pin.videos;
        resPins.push({
            ...pin._doc,
            texts: texts,
            videos: videos,
        });
    }
    return resPins;
};

export const addText = async (userId, pinBoardId, pinId, data) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });

    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }
    const pinBoard = await model.PinBoard.findById(pinBoardId);

    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    const pin = await model.Pin.findById(pinId);

    const text = new model.Text({
        pin,
        ...data,
    });

    await text.save();
    await pin.texts.push(text.id);
    await pin.save();

    return text;
};

export const getTexts = async (userId, pinBoardId, pinId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });

    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }
    const pinBoard = await model.PinBoard.findById(pinBoardId);

    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    const texts = await model.Text.find({
        pin: pinId,
    });

    return texts;
};

export const addVideo = async (userId, pinBoardId, pinId, data) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });

    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }
    const pinBoard = await model.PinBoard.findById(pinBoardId);

    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    const pin = await model.Pin.findById(pinId);

    const video = new model.Video({
        pin,
        ...data,
    });

    await video.save();
    await pin.videos.push(video.id);
    await pin.save();

    return video;
};

export const getVideos = async (userId, pinBoardId, pinId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });

    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }
    const pinBoard = await model.PinBoard.findById(pinBoardId);

    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    const videos = await model.Video.find({
        pin: pinId,
    });

    return videos;
};

export const deletePinBoard = async (userId, pinBoardId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }

    await User.findByIdAndUpdate(user.id, {
        $pull: { pinBoards: pinBoardId },
    });

    const pins = await model.Pin.find({
        pinBoard: pinBoardId,
    });

    for (const pin of pins) {
        await deletePin(userId, pinBoardId, pin.id);
    }

    await model.PinBoard.findByIdAndDelete(pinBoardId);
};

export const deletePin = async (userId, pinBoardId, pinId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }

    const pinBoard = await model.PinBoard.findById(pinBoardId);
    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    await model.PinBoard.findByIdAndUpdate(pinBoardId, {
        $pull: { pins: pinId },
    });

    const pin = await model.Pin.findById(pinId);
    await model.Text.deleteMany({
        _id: {
            $in: pin.texts,
        },
    });

    await model.Video.deleteMany({
        _id: {
            $in: pin.videos,
        },
    });

    await model.Pin.findByIdAndDelete(pinId);
};

export const deleteText = async (userId, pinBoardId, pinId, textId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }

    const pinBoard = await model.PinBoard.findById(pinBoardId);
    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    const pin = await model.Pin.findById(pinId);
    if (!pin.texts.includes(textId)) {
        throw new Error("Invalid TextId");
    }

    await model.Pin.findByIdAndUpdate(pinId, {
        $pull: { texts: textId },
    });

    await model.Text.findByIdAndDelete(textId);
};

export const deleteVideo = async (userId, pinBoardId, pinId, videoId) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }

    const pinBoard = await model.PinBoard.findById(pinBoardId);
    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    const pin = await model.Pin.findById(pinId);
    if (!pin.videos.includes(videoId)) {
        throw new Error("Invalid VideoId");
    }

    await model.Pin.findByIdAndUpdate(pinId, {
        $pull: { videos: videoId },
    });

    await model.Video.findByIdAndDelete(videoId);
};

export const updatePin = async (userId, pinBoardId, pinId, data) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }

    const pinBoard = await model.PinBoard.findById(pinBoardId);
    if (!pinBoard.pins.includes(pinId)) {
        throw new Error("Invalid PinId");
    }

    const pin = await model.Pin.findByIdAndUpdate(pinId, data, { new: true });

    return pin;
};

export const updatePinboard = async (userId, pinBoardId, data) => {
    const User = mongoose.model("User");
    const user = await User.findOne({
        userId,
    });
    if (!user.pinBoards.includes(pinBoardId)) {
        throw new Error("Invalid PinBoardId");
    }

    const pinBoard = await model.PinBoard.findByIdAndUpdate(pinBoardId, data, {
        new: true,
    });

    return pinBoard;
};
