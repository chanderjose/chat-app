import express, { json, urlencoded } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors';

config();

const PORT = process.env.PORT || 3000;
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_12345";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_67890";

let users = [];
let refreshTokensDatabase = [];

const app = express();
app.disable('x-powered-by');

const corsConfig = {
    origin: 'http://localhost:5173',
    credentials: true // Works to allow cookies/headers
};

app.use(cors(corsConfig));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
    }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateToken = (user) => {
    const accessToken = jwt.sign({ username: user.username }, ACCESS_SECRET, { expiresIn: '5m' });
    const refreshToken = jwt.sign({ username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

const jwtValidationMiddleware = (req, res, next) => {
    const authTokenHeader = req.headers['authorization'];
    const token = authTokenHeader && authTokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, ACCESS_SECRET, (error, decodedUser) => {
        if (error) {
            return res.status(403).json({ message: 'Token invalid or expired' });
        }

        req.user = decodedUser;
        next();
    });
};

app.get('/', (req, res) => {
    res.json({ status: 'Running' });
});

app.post('/api/auth/login', async (req, res) => {
    await sleep(1000);

    const username = req.body.username;

    if (!username) {
        return res.status(400).json({
            message: "Missing required field: 'username' is required"
        });
    }

    // Find if the username already exists
    let user = users.find((user) => user.username === username);

    if (user && user.status === "ACTIVE") {
        return res.status(400).json({
            message: "Username already in use"
        });
    }

    if (!user) {
        user = {
            username: username,
            status: "INACTIVE",
            createdAt: Date.now(),
            socketId: null
        };

        users.push(user);
    } else {
        //TODO: Expire refreshToken in case user already exists but is INACTIVE,
        // to prevent multiple refresh tokens for the same user
    }

    const { accessToken, refreshToken } = generateToken(user);

    refreshTokensDatabase.push(refreshToken);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
        accessToken: accessToken
    });
});

app.post('/api/auth/refresh', (req, res) => {
    if (!req.cookies) {
        return res.status(401).json({ message: "Required Cookies are missing" });
    }
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" });
    }
    if (!refreshTokensDatabase.includes(refreshToken)) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Refresh token expired" });
        }

        const { accessToken } = generateToken(user);
        res.json({
            accessToken: accessToken,
            username: user.username
        });
    });
});

app.post('/api/auth/logout', jwtValidationMiddleware, (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    refreshTokensDatabase = refreshTokensDatabase.filter(token => token !== refreshToken);
    const user = users.find((user) => user.username === req.user.username);

    user.status = "INACTIVE";

    io.emit('user_disconnected', {
        username: user.username,
        status: user.status
    });

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ message: "Logged out successfully" });
});

app.get('/api/users', jwtValidationMiddleware, async (req, res) => {
    await sleep(1000);

    const allUsers = users.filter((user) => user.username !== req.user.username).map((user) => {
        return {
            username: user.username,
            status: user.status
        };
    }).sort((a, b) => {
        return a.username.localeCompare(b.username);
    });

    res.json({
        users: allUsers
    });
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Access token missing'));
    }
    jwt.verify(token, ACCESS_SECRET, (error, decodedUser) => {
        if (error) {
            return next(new Error('Token invalid or expired'));
        }
        // Attach the user data to the socket object so you can use it in your event listeners!
        socket.user = decodedUser;
        next();
    });
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}, Username: ${socket.user.username}`);

    const user = users.find((user) => user.username === socket.user.username);
    if (!user) {
        console.log(`Error: User not found: ${socket.user.username}`);
        return;
    }

    if (user.status === "ACTIVE") {
        console.log(`Error: User already active: ${socket.user.username}`);
        return;
    }

    user.status = "ACTIVE";

    io.emit('user_connected', {
        username: user.username,
        status: user.status
    });

    user.socketId = socket.id;

    socket.on('message', (data) => {
        console.log(`Message received: From: ${socket.user.username} | To: ${data.recipient} | Content: ${data.content}`);

        const recipient = users.find((user) => user.username === data.recipient);
        if (!recipient) {
            console.log(`Recipient not found: ${data.recipient}`);
            return;
        }

        if (recipient.socketId) {
            io.to(recipient.socketId).emit('message', {
                sender: socket.user.username,
                content: data.content,
                createdAt: data.createdAt
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const user = users.find((user) => user.socketId === socket.id);
        if (user) {
            user.status = "INACTIVE";

            io.emit('user_disconnected', {
                username: user.username,
                status: user.status
            });
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is successfully running on http://localhost:${PORT}`);
});
