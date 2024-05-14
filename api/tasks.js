const express = require('express');
const router = express.Router();
const Moment = require('../models/Task'); // Using Task for backend
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

// Create moment endpoint
router.post('/', async (req, res) => {
    const { task, when, where, userEmail } = req.body;
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const newMoment = new Moment({ task, when, where, user: user._id });
        await newMoment.save();
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get moments endpoint
router.get('/', async (req, res) => {
    try {
        const moments = await Moment.find().populate('user', 'name email').sort({ when: 1 });
        res.json(moments);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// RSVP endpoint
router.post('/rsvp', async (req, res) => {
    const { taskId, attendeeName } = req.body;
    try {
        const moment = await Moment.findById(taskId);
        if (!moment) {
            return res.status(400).send('Moment not found');
        }
        if (moment.attendees.includes(attendeeName)) {
            return res.status(400).send('You have already RSVP\'d to this moment');
        }
        moment.attendees.push(attendeeName);
        await moment.save();
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete moment endpoint
router.delete('/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const moment = await Moment.findByIdAndDelete(taskId);
        if (!moment) {
            return res.status(404).send('Moment not found');
        }
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete overdue moments endpoint
router.delete('/overdue', async (req, res) => {
    try {
        const now = new Date();
        const result = await Moment.deleteMany({ when: { $lt: now } });
        res.json({ deletedCount: result.deletedCount });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Send calendar invites endpoint
router.post('/send-invites', async (req, res) => {
    const { taskId, userEmail } = req.body;
    try {
        const moment = await Moment.findById(taskId).populate('user', 'email');
        if (!moment) {
            return res.status(400).send('Moment not found');
        }
        if (moment.user.email !== userEmail) {
            return res.status(403).send('You are not the host of this moment');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: moment.attendees.join(', '),
            subject: `Invitation to ${moment.task}`,
            text: `You are invited to ${moment.task} at ${moment.where} on ${formatDate(moment.when)}`
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
