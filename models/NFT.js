const mongoose = require("mongoose");
const { stringify } = require("qs");
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
        owner: { type: String, default: "0x0000000000000000000000000000000000000000" },
        minted: { type: Boolean, default: false },
        audioUrl: String,
        duration: Number,
        createdAt: { type: Date, default: Date.now },
        featured: { type: Boolean, default: false },
        featuredOrder: { type: Number, default: 0},
        tokenId: String,
        approved: Boolean,
        rejected: Boolean,
        generated: { type: Boolean, default: false },
        collectionId: String,
        tokenId: String,
        pinata: {
            png: { type: Boolean, default: false },
            svg: { type: Boolean, default: false },
            html: { type: Boolean, default: false }
        }
    },
});

mongoose.model("NFT", NFTSchema);
