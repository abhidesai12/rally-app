const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Create task endpoint
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

// Get tasks endpoint
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().populate('user', 'name email').sort({ when: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// RSVP endpoint
router.post('/rsvp', async (req, res) => {
    const { taskId, attendeeName } = req.body;
    try {
        const task = await Task.findById(taskId);
       
