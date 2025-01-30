const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PASSWORD = "TestPassword"; // Change this to set a new password
const ADMIN_CODE = "TestAdmin"; // Change this to set the admin clear command code
const MESSAGE_FILE = "messages.json"; // File to store messages
const BANNED_USERS_FILE = "banned_users.json"; // File to store banned users
const ACCOUNTS_FILE = "accounts.json"; // File to store account information

app.use(express.static(path.join(__dirname, "public")));

// Read messages from file
function readMessages() {
    if (fs.existsSync(MESSAGE_FILE)) {
        const data = fs.readFileSync(MESSAGE_FILE, "utf-8");
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Error parsing messages file:", error);
            return [];
        }
    } else {
        return [];
    }
}

// Write messages to file
function saveMessages(messages) {
    try {
        fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error("Error saving messages:", error);
    }
}

// Read accounts from file
function readAccounts() {
    if (fs.existsSync(ACCOUNTS_FILE)) {
        const data = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Error parsing accounts file:", error);
            return [];
        }
    } else {
        return [];
    }
}

// Write accounts to file
function saveAccounts(accounts) {
    try {
        fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
    } catch (error) {
        console.error("Error saving accounts:", error);
    }
}

// Read banned users from file
function readBannedUsers() {
    if (fs.existsSync(BANNED_USERS_FILE)) {
        const data = fs.readFileSync(BANNED_USERS_FILE, "utf-8");
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Error parsing banned users file:", error);
            return [];
        }
    } else {
        return [];
    }
}

// Write banned users to file
function saveBannedUsers(bannedUsers) {
    try {
        fs.writeFileSync(BANNED_USERS_FILE, JSON.stringify(bannedUsers, null, 2));
    } catch (error) {
        console.error("Error saving banned users:", error);
    }
}

io.on("connection", (socket) => {
    console.log("A user connected");

    // Send previous messages when a new user connects
    socket.emit("previousMessages", readMessages());

    // Handle authentication
    socket.on("authenticate", (password, callback) => {
        callback({ success: password === PASSWORD });
    });

    // Set display name for the user
    socket.on("setDisplayName", (displayName) => {
        const bannedUsers = readBannedUsers();
        if (bannedUsers.includes(displayName)) {
            socket.emit("message", "System: You are banned from this chat.");
            socket.disconnect();
            return;
        }

        socket.displayName = displayName;
        const joinMessage = `System: ${socket.displayName} has joined.`;
        io.emit("message", joinMessage);
        const messages = readMessages();
        messages.push(joinMessage);
        saveMessages(messages);
    });

    // Handle incoming messages
    socket.on("message", (msg) => {
        if (msg === "/clear") {
            socket.emit("requestAdminCode"); // Ask for admin code
            return;
        } else if (msg.startsWith("/ban ")) {
            const userToBan = msg.split(" ")[1];
            socket.emit("requestAdminCodeForBan", userToBan); // Ask for admin code for banning
            return;
        }

        const fullMessage = `${socket.displayName || "Anonymous"}: ${msg}`;
        const messages = readMessages();
        messages.push(fullMessage);
        saveMessages(messages);
        io.emit("message", fullMessage);
    });

    // Handle clear messages request
    socket.on("clearMessages", (adminCode) => {
        if (adminCode === ADMIN_CODE) {
            io.emit("message", "System: Messages are now being cleared... Please stand by.");

            setTimeout(() => {
                saveMessages([]); // Clear messages file
                io.emit("clearChat"); // Notify clients to clear chat display
                io.emit("message", "System: Messages are now cleared.");
            }, 1000); // 1-second delay
        } else {
            socket.emit("adminCodeIncorrect");
        }
    });

    // Handle banning a user
    socket.on("banUser", (userToBan, adminCode) => {
        if (adminCode === ADMIN_CODE) {
            const bannedUsers = readBannedUsers();
            bannedUsers.push(userToBan);
            saveBannedUsers(bannedUsers);
            io.emit("message", `System: ${userToBan} has been banned.`);
        } else {
            socket.emit("adminCodeIncorrect");
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        if (socket.displayName) {
            const leaveMessage = `System: ${socket.displayName} has left.`;
            io.emit("message", leaveMessage);
            const messages = readMessages();
            messages.push(leaveMessage);
            saveMessages(messages);
        }
        console.log("A user disconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
