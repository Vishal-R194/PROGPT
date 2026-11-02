
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const createToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString()
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: "Name, email, and password are required."
            });
        }

        if (name.trim().length > 50) {
            return res.status(400).json({
                error: "Name must be 50 characters or fewer."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            return res.status(400).json({
                error: "Please enter a valid email address."
            });
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                error: "Password must be between 8 and 128 characters."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                error: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = createToken(user);

        return res.status(201).json({
            message: "Account created successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        // Handle duplicate-email races safely
        if (err.code === 11000) {
            return res.status(409).json({
                error: "An account with this email already exists."
            });
        }

        console.error("Signup error:", err);
        return res.status(500).json({
            error: "Unable to create your account."
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const token = createToken(user);

        return res.json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            error: "Unable to log in. Please try again."
        });
    }
});

export default router;
