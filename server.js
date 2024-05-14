require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const ics = require('ics');
const authRoutes = require('./api/auth');
const tasksRoutes = require('./api/tasks');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://adesai10:Goob009%21@rallycluster.vci6vet.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// API Route to Send Invites
app.post('/api/tasks/send-invites', (req, res) => {
    const { taskId, userEmail } = req.body;
    Task.findById(taskId, (err, task) => {
        if (err || !task) {
            return res.status(400).send('Task not found');
        }

        // Create ICS file
        const event = {
            start: [
                task.when.getFullYear(),
                task.when.getMonth() + 1,
                task.when.getDate(),
                task.when.getHours(),
                task.when.getMinutes()
            ],
            duration: { hours: 1, minutes: 0 },
            title: task.task,
            description: `You are invited to ${task.task}. Hosted by ${task.user.email}.`,
            location: task.where,
            url: 'http://yourapp.com',
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            organizer: { name: 'Your App', email: process.env.EMAIL_USER },
            attendees: task.attendees.map(email => ({ email }))
        };

        ics.createEvent(event, (error, value) => {
            if (error) {
                return res.status(500).send('Failed to create calendar invite: ' + error.message);
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: task.attendees.join(', '),
                subject: `Invitation to ${task.task}`,
                text: `You are invited to ${task.task} on ${task.when} at ${task.where}. Hosted by ${task.user.email}.`,
                icalEvent: {
                    method: 'REQUEST',
                    content: value
                }
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).send('Failed to send invites: ' + error.message);
                }
                res.send('Invitations sent!');
            });
        });
    });
});

// Define a custom route to delete overdue moments
app.delete('/api/tasks/overdue', (req, res) => {
    const now = new Date();
    Task.deleteMany({ when: { $lt: now } })
        .then(result => res.send(`Deleted ${result.deletedCount} overdue moments`))
        .catch(err => res.status(500).send(`Failed to delete overdue moments: ${err.message}`));
});
