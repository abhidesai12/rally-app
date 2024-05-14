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
    if (confirm("Are you sure you want
