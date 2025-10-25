/* eslint-env node */
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config({path: './DB.env'});

import {Client, Pool} from "pg";

const app = express();
app.use(express.json());
app.use(cors());

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
        return res.status(200).json({ exists });
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
    try
    {
        const validUser = await checkMatchUser(email, password);
        if (validUser) {
            res.status(200).json({userName:validUser.name, userEmail:validUser.email});
        }
        else
        {
            res.status(400).json({error: "Invalid email or password"});
        }


    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

const checkMatchUser = async (email, password) => {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        return res.rows.length > 0 ? res.rows[0] : null;
    }
    catch (error) {
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
app.listen(PORT, () => {
        console.log(`User server is running on port ${PORT}`);
    }
);