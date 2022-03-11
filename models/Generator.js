const mongoose = require("mongoose");
const { Schema } = mongoose;

const generatorSchema = new Schema({
    title: String,
    createdAt: { type: Date, default: Date.now },
    iterations: { type: Number, default: 10 },
    iterationGap: { type: Number, default: 1 },
    parameters: []
});

mongoose.model("generator", generatorSchema);
