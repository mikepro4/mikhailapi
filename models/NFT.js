const mongoose = require("mongoose");
const { Schema } = mongoose;

const NFTSchema = new Schema({
    nft: {
        price: String,
        description: String,
        name: String,
        fileUrl: String
    },
    metadata: {
        shapeId: String,
        owner: String
    },
});

mongoose.model("NFT", NFTSchema);
