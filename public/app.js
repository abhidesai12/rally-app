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
            showMyRallyPage();
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
            showMyRallyPage();
        } else {
            response.text().then(text => alert('Log in failed: ' + text));
        }
    });
});

// Handle Task Creation Form Submission
document.getElementById('create-task-form').addEventListener('submit', function(event) {
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
            showMyRallyPage();
        } else {
            response.text().then(text => alert('Task creation failed: ' + text));
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
            showOurRallyPage();
        } else {
            response.text().then(text => alert('RSVP failed: ' + text));
        }
    });
}

// Handle Task Deletion
function handleDeleteTask(event, taskId) {
    event.preventDefault();
    if (confirm("Are you sure you want to delete this task?")) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                alert('Task deleted successfully!');
                showMyRallyPage();
            } else {
                response.text().then(text => alert('Task deletion failed: ' + text));
            }
        });
    }
}

// Show Signup Page
function showSignupPage() {
    document.getElementById('signup-page').style.display = 'block';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('myrally-page').style.display = 'none';
    document.getElementById('ourrally-page').style.display = 'none';
}

// Show Login Page
function showLoginPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('myrally-page').style.display = 'none';
    document.getElementById('ourrally-page').style.display = 'none';
}

// Show My Rally Page
function showMyRallyPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('myrally-page').style.display = 'block';
    document.getElementById('ourrally-page').style.display = 'none';

    const userEmail = localStorage.getItem('userEmail');

    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const myTasks = document.getElementById('my-tasks');
            myTasks.innerHTML = '<h2>My Tasks</h2>';
            tasks.filter(task => task.user.email === userEmail || task.attendees.includes(userEmail)).forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.innerHTML = `
                    <strong>${task.task}</strong> - ${formatDate(task.when)} at ${task.where}
                    <br />
                    <button onclick="handleDeleteTask(event, '${task._id}')">Delete</button>
                `;
                myTasks.appendChild(taskItem);
            });
        });
}

// Show Our Rally Page
function showOurRallyPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('myrally-page').style.display = 'none';
    document.getElementById('ourrally-page').style.display = 'block';

    const userEmail = localStorage.getItem('userEmail');

    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const friendsTasks = document.getElementById('friends-tasks');
            friendsTasks.innerHTML = '<h2>Friends\' Tasks</h2>';
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                const hasRSVPed = task.attendees.includes(userEmail);
                taskItem.innerHTML = `
                    <strong>${task.task}</strong> - ${formatDate(task.when)} at ${task.where}
                    <br />
                    Attended by: ${task.attendees.join(', ')}
                    <br />
                    ${!hasRSVPed ? `<button onclick="handleRSVP(event, '${task._id}')">RSVP</button>` : ''}
                `;
                friendsTasks.appendChild(taskItem);
            });
        });
}
