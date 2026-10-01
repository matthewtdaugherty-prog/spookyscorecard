const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(__dirname));

// Read stored data from data.json
app.get('/api/data', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
        return res.json({ settings: null, puzzleData: {} });
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        res.json(JSON.parse(raw));
    } catch (err) {
        console.error("Error reading data file:", err);
        res.status(500).json({ error: "Failed to read data file" });
    }
});

// Write incoming data to data.json
app.post('/api/data', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
        res.json({ success: true });
    } catch (err) {
        console.error("Error writing data file:", err);
        res.status(500).json({ error: "Failed to write data file" });
    }
});

app.listen(PORT, () => {
    console.log(`🎃 Haunted Scorecard server running on port ${PORT}`);
});