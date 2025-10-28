/* eslint-env node */
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import http from 'http';
import {WebSocketServer} from 'ws';

dotenv.config({path: './DB.env'});

import { Pool} from "pg";

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const wss = new WebSocketServer({server});
const clientsMap = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected via WebSocket');


    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        const data = JSON.parse(message.toString());
        if (data.type === "join") {
            clientsMap.set(ws, {email: data.email, currentChatId: data.chatId});
        }
        if (data.type === "message") {
            const sender = clientsMap.get(ws);
            if (!sender) return;

            wss.clients.forEach((client) => {
                const clientInfo = clientsMap.get(client);
                if (
                    client !== ws &&
                    client.readyState === WebSocket.OPEN &&
                    clientInfo?.currentChatId === sender.currentChatId
                ) {
                    client.send(JSON.stringify({sender: sender.email, text: data.text}));
                }
            });
        }
    })

    ws.on('close', () => {
        console.log('Client disconnected');
        clientsMap.delete(ws);

    });
})


const pool = new Pool({
    // eslint-disable-next-line no-undef
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
})

app.get("/userExists/:email", async (req, res) => {
    const email = req.params.email;
    try {
        const exists = await checkIfUserExists(email);
        console.log(exists);
        return res.status(200).json({exists});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.post("/createUser", async (req, res) => {
    const {name, email, password} = req.body;
    console.log(name, email, password);
    try {
        const exists = await checkIfUserExists(email);
        console.log(exists);
        if (!exists) {
            const newUser = await createNewUser(name, email, password);
            res.status(201).json({userName: newUser.name, userEmail: newUser.email});
        } else {
            res.status(400).json({error: "User already exists"});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.post("/loginUser", async (req, res) => {
    const {email, password} = req.body;
    try {
        const loginUser = await checkMatchUser(email, password);
        if (loginUser) {
            res.status(200).json({userName: loginUser.name, userEmail: loginUser.email});
        } else {
            res.status(400).json({error: "Invalid email or password"});
        }


    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post("/sendFriendRequest", async (req, res) => {
    const {userEmail, friendEmail} = req.body;
    console.log(`userEmail: ${userEmail}, friendEmail: ${friendEmail}`);

    try {
        const exists = await pool.query(
            "SELECT * FROM friend_requests WHERE sender_email = $1 AND receiver_email = $2 AND status = 'pending'",
            [userEmail, friendEmail]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({error: "Friend request already sent"});
        }

        await pool.query(
            "INSERT INTO friend_requests (sender_email, receiver_email) VALUES ($1, $2)",
            [userEmail, friendEmail]
        );

        res.status(200).json({message: "Friend request sent"});
    } catch (err) {
        if (error.response && error.response.status === 400) {
            setMessage("Friend request already sent");
        }
        res.status(500).json({error: err.message});
    }


})



const checkMatchUser = async (email, password) => {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        return res.rows.length > 0 ? res.rows[0] : null;
    } catch (error) {
        throw new Error('user/password do not match:');
    }
}

const checkIfUserExists = async (email) => {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows.length > 0;
    } catch (error) {
        throw new Error('Error checking if user exists: ' + error.message);
    }
};

const createNewUser = async (name, email, password) => {
    try {
        const res = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]);
        return res.rows[0];
    } catch (error) {
        throw new Error('Error creating new user: ' + error.message);
    }
}

const PORT = 3001;
server.listen(PORT, () => {
        console.log(`Server (HTTP + WebSocket) is running on port ${PORT}`);
    }
);