const mongoose = require("mongoose");
const { Schema } = mongoose;

const wordSchema = new Schema({
    blocks: [
        {
            position: Number,
            url: String,
            main: { type: Boolean, default: false},
            mainDate: { type: Date, default: Date.now },
            palette: Object
        }
    ],
    metadata: {
        title: String,
        createdBy: String,
        createdAt: { type: Date, default: Date.now },
        main: { type: Boolean, default: false},
        shapeId: String,
        audioUrl: String
    },
});

mongoose.model("word", wordSchema);
