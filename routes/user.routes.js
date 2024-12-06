const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



  
// Registration Route
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register',
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            });
        }

        const { email, username, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await userModel.create({
                email,
                username,
                password: hashPassword
            });

            // Redirect to login page after successful registration
            res.redirect('/user/login');
         } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    });

// Login Route
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'
            });
        }

        const { username, password } = req.body;
        try {
            const user = await userModel.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: 'Username or password is incorrect' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Username or password is incorrect' });
            }

            const token = jwt.sign(
                { userId: user._id, email: user.email, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.redirect('/home'); // Redirect to home after login
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error during login' });
        }
    });

// Logout Route
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/'); // Redirect to index page after logout
});

module.exports = router;
