const mongoose = require("mongoose");
const { Schema } = mongoose;

const collectionSchema = new Schema({
    metadata: {
        title: String,
        createdAt: { type: Date, default: Date.now },
        contractAddress: String,
        status: { type: String, default: "draft"},
        generatorId: String
    },
});

mongoose.model("collection", collectionSchema);
