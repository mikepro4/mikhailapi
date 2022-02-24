const axios = require("axios");
const keys = require("../config/keys");

module.exports = app => {
	app.post("/youtube_video_details", async (req, res) => {
        console.log(req.body,keys.ytAPI )
        const searchReq = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${
                req.body.videoId
            }&key=${keys.ytAPI}`
        );

        res.json({
            videoId: searchReq.data.items[0].id,
            snippet: searchReq.data.items[0].snippet,
            contentDetails: searchReq.data.items[0].contentDetails,
            statistics: searchReq.data.items[0].statistics
        });
	});
};
