const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('./db');

// Explicitly locate questions.csv in the project root
const filename = path.resolve(__dirname, '../../assets/questions.csv');

function importQuestions() {
    try {
        const contents = fs.readFileSync(filename, 'utf8');
        const rows = parse(contents, { columns: true, skip_empty_lines: true });

        db.prepare('DELETE FROM questions').run();

        const insert = db.prepare(`INSERT INTO questions (question, answer) VALUES (@question, @answer)`);

        const insertMany = db.transaction((questions) => {
            for (const q of questions) insert.run(q);
        });

        insertMany(rows);
        
        console.log(`✅ Questions imported successfully. ${rows.length} questions added.`);
    } catch (err) {
        console.error("❌ Failed to import questions:", err.message);
    }
}

importQuestions();