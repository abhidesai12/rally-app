const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

router.post('/', async (req, res) => {
    const { task, when, where, userEmail } = req.body;
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const newTask = new Task({ task, when, where, user: user._id });
        await newTask.save();
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().populate('user', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
