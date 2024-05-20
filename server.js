const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch songs based on the page
app.get('/api/songs', (req, res) => {
    const page = req.query.page || 'home';
    const songsDir = path.join(__dirname, 'songs', page);

    fs.readdir(songsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load songs' });
        }
        const mp3Files = files.filter(file => file.endsWith('.mp3'));
        res.json(mp3Files);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
