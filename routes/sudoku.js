const express = require('express');
const router = express.Router();
const sudoku = require('sudoku');

// /sudoku/*
router.get('/generate', (req, res) => {
    const puzzle = sudoku.makepuzzle();
    res.json({ puzzle });
});

module.exports = router;