require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
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

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: task.attendees.join(', '),
            subject: `Invitation to ${task.task}`,
            text: `You are invited to ${task.task} on ${task.when} at ${task.where}. Hosted by ${task.user.email}.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send('Failed to send invites: ' + error.message);
            }
            res.send('Invitations sent!');
        });
    });
});
