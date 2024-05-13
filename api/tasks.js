const express = require('express');
const router = express.Router();

let tasks = []; // Replace with a database in a real app

router.post('/', (req, res) => {
    const { task, when, where } = req.body;
    tasks.push({ task, when, where });
    res.sendStatus(200);
});

router.get('/', (req, res) => {
    res.json(tasks);
});

module.exports = router;