const express = require('express');
const router = express.Router();
const sudoku = require('sudoku');
const bodyParser = require('body-parser');

// /sudoku/*
router.get('/generate', (req, res) => {
    const puzzle = sudoku.makepuzzle();
    res.json({ puzzle });
});

router.post('/difficulty', bodyParser.json(), (req, res) => {
    const puzzle = req.body.puzzle;
    if (!puzzle) {
        return res.status(400).json({ error: 'Missing puzzle' });
    }
    const difficulty = sudoku.ratepuzzle(puzzle, 4);
    res.json({ difficulty });
});

router.post('/solve', bodyParser.json(), (req, res) => {
    const puzzle = req.body.puzzle;
    if (!puzzle) {
        return res.status(400).json({ error: 'Missing puzzle' });
    }
    const solution = sudoku.solvepuzzle(puzzle);
    res.json({ solution });
});

module.exports = router;