const mongoose = require("mongoose");
const { Schema } = mongoose;

const transcriptSchema = new Schema({
    request: [],
    response: [],
    metadata: {
        createdAt: { type: Date, default: Date.now },
        nftId: String
    },
});

mongoose.model("transcript", transcriptSchema);
