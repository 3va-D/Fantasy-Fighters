const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/question/random', (req, res) => {
    try {
        // 1. Query the database
        const question = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1').get();

        // 2. ADD IT HERE: Check if a question was actually found
        if (!question) {
            return res.status(404).json({ error: 'No questions found in database' });
        }

        // 3. Send the question back to the client
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Question server running on http://localhost:${PORT}`));