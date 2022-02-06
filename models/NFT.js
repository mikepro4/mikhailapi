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
        owner: { type: String, default: "" },
        minted: { type: Boolean, default: false },
        audioUrl: String,
        duration: Number,
        createdAt: { type: Date, default: Date.now },
        featured: { type: Boolean, default: false },
        featuredOrder: { type: Number, default: 0}
    },
});

mongoose.model("NFT", NFTSchema);
