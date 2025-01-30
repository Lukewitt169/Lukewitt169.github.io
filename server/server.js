const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

let accessPassword = 'access123'; // Changeable access password
let adminPassword = 'admin123'; // Changeable admin password

app.use(express.static('public'));
app.use(express.json());

let accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
let messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));

app.post('/authenticate', (req, res) => {
    const { password } = req.body;
    if (password === accessPassword) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.post('/signup', (req, res) => {
    const { username, password, displayName } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    accounts[username] = { password: hashedPassword, displayName };
    fs.writeFileSync('accounts.json', JSON.stringify(accounts));
    res.sendStatus(200);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const account = accounts[username];
    if (account && bcrypt.compareSync(password, account.password)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.post('/message', (req, res) => {
    const { message } = req.body;
    messages.push(message);
    fs.writeFileSync('messages.json', JSON.stringify(messages));
    res.sendStatus(200);
});

app.post('/clear', (req, res) => {
    const { adminCode } = req.body;
    if (adminCode === adminPassword) {
        messages = [];
        fs.writeFileSync('messages.json', JSON.stringify(messages));
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
