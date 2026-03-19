const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    datasetName: {
        type: String,
        required: true,
    },
    columns: {
        type: [String],
    },
    rows: {
        type: Number, 
    },
    filePath: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Dataset', datasetSchema);