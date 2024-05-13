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
        }
    });
});

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
        }
    });
});

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
        }
    });
});

function showSignupPage() {
    document.getElementById('signup-page').style.display = 'block';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('myrally-page').style.display = 'none';
    document.getElementById('ourrally-page').style.display = 'none';
}

function showLoginPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('myrally-page').style.display = 'none';
    document.getElementById('ourrally-page').style.display = 'none';
}

function showMyRallyPage() {
    document.getElementById('signup-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('myrally-page').style.display = 'block';
    document.getElementById('ourrally-page').style.display = 'none';
}

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
            taskItem.innerHTML = `<strong>${task.task}</strong> - ${task.when} at ${task.where}`;
            friendsTasks.appendChild(taskItem);
        });
    });
}

function addTask(task, when, where) {
    const taskList = document.getElementById('my-tasks');
    const taskItem = document.createElement('div');
    taskItem.innerHTML = `<strong>${task}</strong> - ${when} at ${where}`;
    taskList.appendChild(taskItem);
    document.getElementById('create-task-form').reset();
}
