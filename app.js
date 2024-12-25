const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const path = require('path');
const nodemailer = require('nodemailer');

// Set the port
const app = express();
const PORT = process.env.PORT || 3002;

// Create a connection to the MariaDB database
require('dotenv').config();
const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'couponDB'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to MariaDB');
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to Validate API Key
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // Look for the API key in the request headers
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
};

// Generate JWT based on API key
app.post('/generate-token', validateApiKey, (req, res) => {
    const payload = { id: 1, role: 'user' }; // Example payload

    // Generate JWT with expiry
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

// JWT Validation Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer token

    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });

        req.user = payload; // Attach decoded payload to the request
        next();
    });
};

// Serve the homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to get all coupons
app.get('/coupons', authenticateToken, (req, res) => {
    db.query('SELECT * FROM coupons', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching coupons' });
        }
        res.json(results);
    });
});

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAILJET_USER,  // Read from environment variable
        pass: process.env.MAILJET_PASS   // Read from environment variable
    }
});

// Redemption route
app.post('/redeem/:id', authenticateToken, (req, res) => {
    const couponId = req.params.id;

    // Check if the coupon is already redeemed
    const checkQuery = 'SELECT redeemed FROM coupons WHERE id = ?';
    db.query(checkQuery, [couponId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error checking coupon status' });
        }

        if (result[0].redeemed) {
            return res.status(400).json({ success: false, message: 'Coupon already redeemed' });
        }

        // Update the database to mark the coupon as redeemed
        const query = 'UPDATE coupons SET redeemed = 1 WHERE id = ?';
        db.query(query, [couponId], (err, result) => {
            if (err) {
                console.error('Error updating coupon status:', err);
                return res.status(500).json({ success: false });
            }

            // Send an email notification
            const mailOptions = {
                from: 'donotreply@americansquid.com',
                to: 'matthew@americansquid.com',
                subject: `Coupon Redeemed: ID ${couponId}`,
                text: `A coupon with ID ${couponId} has just been redeemed!`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

            return res.json({ success: true, message: 'Coupon redeemed successfully' });
        });
    });
});
app.use((req, res, next) => {
    console.log(`Unexpected request: ${req.method} ${req.path}`);
    next();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
