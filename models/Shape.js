const mongoose = require("mongoose");
const { Schema } = mongoose;

const shapeSchema = new Schema({
  defaultViz: {
    shape: {
        rotateSpeed: { type: Number, default: 0.001},
        friction: { type: Number, default: 0.01},
        rotatePointSpeed: { type: Number, default: 0.01},
        step: { type: Number, default: 5},
        frequency: { type: Number, default: 0.0001},
        boldRate: { type: Number, default: 1},
        math: { type: String, default: "sin"},
    },
    point: {
        pointSize: { type: Number, default: 1.3},
        pointOpacity: { type: Number, default: 1},
        pointCount: { type: Number, default: 1024},
    },
    overlay: {
        visible: { type: Boolean, default: false},
        blur: { type: Number, default: 222},
        color: { type: String, default: "#000000"},
        colorOpacity: { type: Number, default: 0.6}
    },
    colors: [
        {
            hex: { type: String, default: "#ffffff"},
            amount: { type: Number, default: 22.2},
            opacity: { type: Number, default: 100}
        }
    ]
  },
  metadata: {
        title: String,
        createdBy: String,
        createdAt: { type: Date, default: Date.now },
        main: { type: Boolean, default: false},
        mainDate: { type: Date, default: Date.now },

  },
  status: { type: String, default: "draft" },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
});

mongoose.model("shape", shapeSchema);
