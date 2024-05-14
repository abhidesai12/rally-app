// Utility function to format date
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Handle Sign Up Form Submission
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = {
        name: event.target[0].value,
        email: event.target[1].value,
        password: event.target[2].value
    };
    fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(response => {
        if (response.ok) {
            localStorage.setItem('userEmail', formData.email);
            showMyMomentsPage();
        } else {
            response.text().then(text => alert('Sign up failed: ' + text));
        }
    });
});

// Handle Log In Form Submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = {
        email: event.target[0].value,
        password: event.target[1].value
    };
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(response => {
        if (response.ok) {
            localStorage.setItem('userEmail', formData.email);
            showMyMomentsPage();
        } else {
            response.text().then(text => alert('Log in failed: ' + text));
        }
    });
});

// Handle Moment Creation Form Submission
document.getElementById('create-moment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = {
        task: event.target[0].value,
        when: event.target[1].value,
        where: event.target[2].value,
        userEmail: localStorage.getItem('userEmail')
    };
    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(response => {
        if (response.ok) {
            showMyMomentsPage();
        } else {
            response.text().then(text => alert('Moment creation failed: ' + text));
        }
    });
});

// Handle RSVP Form Submission
function handleRSVP(event, taskId) {
    event.preventDefault();
    const attendeeName = localStorage.getItem('userEmail');
    fetch('/api/tasks/rsvp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, attendeeName })
    }).then(response => {
        if (response.ok) {
            alert('RSVP successful!');
            showMyMomentsPage();
        } else {
            response.text().then(text => alert('RSVP failed: ' + text));
        }
    });
}

// Handle Moment Deletion
function handleDeleteMoment(event, taskId) {
    event.preventDefault();
    if (confirm("Are you sure you want to delete this moment?")) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                alert('Moment deleted successfully!');
                showMyMomentsPage();
            } else {
                response.text().then(text => alert('Moment deletion failed: ' + text));
            }
        });
    }
}

// Handle Send Invites
function handleSendInvites(event, taskId) {
    event.preventDefault();
    const userEmail = localStorage.getItem('userEmail');
    fetch('/api/tasks/send-invites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, userEmail })
    }).then(response => {
        if (response.ok) {
            alert('Invitations sent!');
        } else {
            response.text().then(text => alert('Failed to send invites: ' + text));
        }
    });
}

// Show Signup Page
function showSignupPage() {
    document.getElementById('signup-page').style.display = 'block';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('mymoments-page').style.display = 'none';
    document.getElementById('ourmoments-page').style.display = 'none';
}

// Show Login Page
function showLoginPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('mymoments-page').style.display = 'none';
    document.getElementById('ourmoments-page').style.display = 'none';
}

// Show My Moments Page
function showMyMomentsPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('mymoments-page').style.display = 'block';
    document.getElementById('ourmoments-page').style.display = 'none';

    const userEmail = localStorage.getItem('userEmail');

    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const myMoments = document.getElementById('my-moments');
            myMoments.innerHTML = '<h2>My Moments</h2>';
            tasks.filter(task => task.user.email === userEmail).forEach(task => {
                const momentItem = document.createElement('div');
                momentItem.innerHTML = `
                    <strong>${task.task}</strong> - ${formatDate(task.when)} at ${task.where}
                    <br />
                    <button class="black-button" onclick="handleDeleteMoment(event, '${task._id}')">Delete</button>
                    <button class="black-button" onclick="handleSendInvites(event, '${task._id}')">Send Invites</button>
                `;
                myMoments.appendChild(momentItem);
            });
            tasks.filter(task => task.attendees.includes(userEmail)).forEach(task => {
                const momentItem = document.createElement('div');
                momentItem.innerHTML = `
                    <strong>${task.task}</strong> - ${formatDate(task.when)} at ${task.where}
                `;
                myMoments.appendChild(momentItem);
            });
        });
}

// Show Our Moments Page
function showOurMomentsPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('mymoments-page').style.display = 'none';
    document.getElementById('ourmoments-page').style.display = 'block';

    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const friendsToday = document.getElementById('friends-today');
            const friendsFuture = document.getElementById('friends-future');
            const now = new Date();

            friendsToday.innerHTML = '<h2>Today\'s Moments</h2>';
            friendsFuture.innerHTML = '<h2>Future Moments</h2>';

            tasks.filter(task => new Date(task.when).toDateString() === now.toDateString()).forEach(task => {
                const momentItem = document.createElement('div');
                momentItem.innerHTML = `
                    <strong>${task.task}</strong> - ${formatDate(task.when)} at ${task.where}
                    <br />
                    Hosted by: ${task.user.email}
                    <br />
                    Attended by: ${task.attendees.join(', ')}
                    <br />
                    ${!task.attendees.includes(localStorage.getItem('userEmail')) ? `<button class="black-button" onclick="handleRSVP(event, '${task._id}')">RSVP</button>` : ''}
                `;
                friendsToday.appendChild(momentItem);
            });

            tasks.filter(task => new Date(task.when) > now).forEach(task => {
                const momentItem = document.createElement('div');
                momentItem.innerHTML = `
                    <strong>${task.task}</strong> - ${formatDate(task.when)} at ${task.where}
                    <br />
                    Hosted by: ${task.user.email}
                    <br />
                    Attended by: ${task.attendees.join(', ')}
                    <br />
                    ${!task.attendees.includes(localStorage.getItem('userEmail')) ? `<button class="black-button" onclick="handleRSVP(event, '${task._id}')">RSVP</button>` : ''}
                `;
                friendsFuture.appendChild(momentItem);
            });
        });
}

// Delete overdue moments
function deleteOverdueMoments() {
    fetch('/api/tasks/overdue', {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            console.log('Overdue moments deleted');
        } else {
            response.text().then(text => alert('Failed to delete overdue moments: ' + text));
        }
    });
}

// Call this function on initial load
deleteOverdueMoments();

// Initial page load
if (localStorage.getItem('userEmail')) {
    showMyMomentsPage();
} else {
    showSignupPage();
}
