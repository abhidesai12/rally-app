const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Adjust the path as necessary
const User = require('../models/User');
const nodemailer = require('nodemailer');

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
        if (!task) {
            return res.status(400).send('Task not found');
        }
        if (task.attendees.includes(attendeeName)) {
            return res.status(400).send('You have already RSVP\'d to this task');
        }
        task.attendees.push(attendeeName);
        await task.save();
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete task endpoint
router.delete('/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete overdue tasks endpoint
router.delete('/overdue', async (req, res) => {
    try {
        const now = new Date();
        const result = await Task.deleteMany({ when: { $lt: now } });
        res.json({ deletedCount: result.deletedCount });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Send calendar invites endpoint
router.post('/send-invites', async (req, res) => {
    const { taskId, userEmail } = req.body;
    try {
        const task = await Task.findById(taskId).populate('user', 'email');
        if (!task) {
            return res.status(400).send('Task not found');
        }
        if (task.user.email !== userEmail) {
            return res.status(403).send('You are not the host of this task');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: task.attendees.join(', '),
            subject: `Invitation to ${task.task}`,
            text: `You are invited to ${task.task} at ${task.where} on ${formatDate(task.when)}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send(error.message);
            } else {
                res.send('Invitations sent: ' + info.response);
            }
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

module.exports = router;
