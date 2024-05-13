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
            addTask(formData.task, formData.when, formData.where);
        } else {
            response.text().then(text => alert('Task creation failed: ' + text));
        }
    });
});

// Handle RSVP Form Submission
function handleRSVP(event, taskId) {
    event.preventDefault();
    const attendeeName = prompt("Enter your name to RSVP:");
    if (attendeeName) {
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
}

// Show Our Rally Page
function showOurRallyPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('myrally-page').style.display = 'none';
    document.getElementById('ourrally-page').style.display = 'block';

    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const friendsTasks = document.getElementById('friends-tasks');
            friendsTasks.innerHTML = '<h2>Friends\' Tasks</h2>';
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.innerHTML = `
                    <strong>${task.task}</strong> - ${task.when} at ${task.where}
                    <br />
                    Attended by: ${task.attendees.join(', ')}
                    <br />
                    <button onclick="handleRSVP(event, '${task._id}')">RSVP</button>
                `;
                friendsTasks.appendChild(taskItem);
            });
        });
}
