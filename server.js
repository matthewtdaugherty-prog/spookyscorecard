const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Schema for storing scorecard state
const ScorecardSchema = new mongoose.Schema({
    id: { type: String, default: 'global', unique: true },
    settings: { type: Object, default: null },
    puzzleData: { type: Object, default: {} }
}, { timestamps: true });

const Scorecard = mongoose.model('Scorecard', ScorecardSchema);

// Connect to MongoDB Atlas
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB Atlas'))
        .catch(err => console.error('❌ MongoDB connection error:', err));
} else {
    console.warn('⚠️ MONGODB_URI environment variable is not defined. Data will not persist.');
}

// Read stored data
app.get('/api/data', async (req, res) => {
    try {
        if (!MONGO_URI) {
            return res.json({ settings: null, puzzleData: {} });
        }

        const doc = await Scorecard.findOne({ id: 'global' });
        if (!doc) {
            return res.json({ settings: null, puzzleData: {} });
        }

        res.json({
            settings: doc.settings || null,
            puzzleData: doc.puzzleData || {}
        });
    } catch (err) {
        console.error("Error reading data from database:", err);
        res.status(500).json({ error: "Failed to read data from database" });
    }
});

// Write incoming data
app.post('/api/data', async (req, res) => {
    try {
        if (!MONGO_URI) {
            return res.status(500).json({ error: "Database not connected. Please set MONGODB_URI." });
        }

        const { settings, puzzleData } = req.body;

        await Scorecard.findOneAndUpdate(
            { id: 'global' },
            { settings, puzzleData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Error writing data to database:", err);
        res.status(500).json({ error: "Failed to write data to database" });
    }
});

app.listen(PORT, () => {
    console.log(`🎃 Haunted Scorecard server running on port ${PORT}`);
});