import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
config();

import * as db from "../mongodb.js";

await db.connectDB();
export const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });

app.post("/add-user", async (req, res) => {
    const data = req.body;
    try {
        const user = await db.addUserData(data);
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/get-user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await db.getUserData(userId);
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post("/add-pinboard", async (req, res) => {
    const userId = req.body.userId;
    const data = req.body;
    try {
        const pinboard = await db.addPinBoard(userId, data);
        res.status(201).send(pinboard);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/get-pinboard/:userId/:pinBoardId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    try {
        const pinboard = await db.getPinBoard(userId, pinBoardId);
        res.status(200).send(pinboard);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/get-pinboards/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const pinboards = await db.getPinBoards(userId);
        res.status(200).send(pinboards);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post("/add-pin", async (req, res) => {
    const pinBoardId = req.body.pinBoardId;
    const userId = req.body.userId;
    const data = req.body;
    try {
        const pin = await db.addPin(userId, pinBoardId, data);
        res.status(201).send(pin);
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
});

app.get("/get-pins/:userId/:pinBoardId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    try {
        const pins = await db.getPins(userId, pinBoardId);
        res.status(200).send(pins);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post("/add-text", async (req, res) => {
    const userId = req.body.userId;
    const pinBoardId = req.body.pinBoardId;
    const pinId = req.body.pinId;
    const data = req.body;
    try {
        const text = await db.addText(userId, pinBoardId, pinId, data);
        res.status(201).send(text);
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
});

app.get("/get-texts/:userId/:pinBoardId/:pinId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    const pinId = req.params.pinId;
    try {
        const texts = await db.getTexts(userId, pinBoardId, pinId);
        res.status(200).send(texts);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post("/add-video", async (req, res) => {
    const userId = req.body.userId;
    const pinBoardId = req.body.pinBoardId;
    const pinId = req.body.pinId;
    const data = req.body;
    try {
        const video = await db.addVideo(userId, pinBoardId, pinId, data);
        res.status(201).send(video);
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
});

app.get("/get-videos/:userId/:pinBoardId/:pinId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    const pinId = req.params.pinId;
    try {
        const videos = await db.getVideos(userId, pinBoardId, pinId);
        res.status(200).send(videos);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/delete-pinboard/:userId/:pinBoardId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    try {
        await db.deletePinBoard(userId, pinBoardId);
        res.status(200).send("Pinboard deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/delete-pin/:userId/:pinBoardId/:pinId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    const pinId = req.params.pinId;
    try {
        await db.deletePin(userId, pinBoardId, pinId);
        res.status(200).send("Pin deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete(
    "/delete-text/:userId/:pinBoardId/:pinId/:textId",
    async (req, res) => {
        const userId = req.params.userId;
        const pinBoardId = req.params.pinBoardId;
        const pinId = req.params.pinId;
        const textId = req.params.textId;
        try {
            await db.deleteText(userId, pinBoardId, pinId, textId);
            res.status(200).send("Text deleted successfully");
        } catch (error) {
            res.status(400).send(error.message);
        }
    }
);

app.delete(
    "/delete-video/:userId/:pinBoardId/:pinId/:videoId",
    async (req, res) => {
        const userId = req.params.userId;
        const pinBoardId = req.params.pinBoardId;
        const pinId = req.params.pinId;
        const videoId = req.params.videoId;
        try {
            await db.deleteVideo(userId, pinBoardId, pinId, videoId);
            res.status(200).send("Video deleted successfully");
        } catch (error) {
            res.status(400).send(error.message);
        }
    }
);

app.put("/update-pin/:userId/:pinBoardId/:pinId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    const pinId = req.params.pinId;
    const data = req.body;
    try {
        const pin = await db.updatePin(userId, pinBoardId, pinId, data);
        res.status(200).send(pin);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.put("/update-pinboard/:userId/:pinBoardId", async (req, res) => {
    const userId = req.params.userId;
    const pinBoardId = req.params.pinBoardId;
    const data = req.body;
    try {
        const pinboard = await db.updatePinboard(userId, pinBoardId, data);
        res.status(200).send(pinboard);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/search", async (req, res) => {
    const { query, timerange, region, numResults } = req.query;
    try {
        const wikiTool = new WikipediaQueryRun({
            topKResults: 3,
            maxDocContentLength: 4000,
        });
        const resWiki = await wikiTool.call(query);

        const searchTool = new DuckDuckGoSearch({ maxResults: numResults });
        const resSearchRaw = await searchTool.call(query);
        const resSearch = JSON.parse(resSearchRaw);

        const data = [
            {
                title: "wiki",
                link: "https://en.wikipedia.org/wiki/",
                snippet: resWiki,
            },
            ...resSearch,
        ];
        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(5000, () => console.log("Server ready on port 5000."));

export default app;
