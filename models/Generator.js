const mongoose = require("mongoose");
const { Schema } = mongoose;

const generatorSchema = new Schema({
    title: String,
    createdAt: { type: Date, default: Date.now },
    iterations: { type: Number, default: 10 },
    parameters: []
});

mongoose.model("generator", generatorSchema);
