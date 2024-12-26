const express = require('express');
const mysql = require('mysql2');
const helmet = require('helmet');
const cors = require('cors');
const { body, param, query, validationResult } = require('express-validator');
const app = express();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const nodemailer = require('nodemailer');

// Trust proxy settings
app.set('trust proxy', true);

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (req.secure) {
        next();
    } else {
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use(cors({
    origin: 'https://couponsheet.americansquid.com',
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Basic helmet setup
app.use(helmet());

// Custom security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // For Cloudflare
                "https://cloudflare.com",
                "https://*.cloudflare.com"
            ],
            connectSrc: ["'self'", "https://*.cloudflare.com"],
            frameSrc: ["'self'", "https://*.cloudflare.com"],
            scriptSrcAttr: ["'self'"],
            imgSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-site" },
    xFrameOptions: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Load and validate environment variables
const validateEnv = require('./config/validateEnv');
const env = validateEnv();

// Set the port
const PORT = process.env.PORT;

// Create a connection to the MariaDB database
const dbConfig = require('./config/database');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Connect to the database
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to MariaDB');
    connection.release();
});

// Serve static files (CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to get all coupons
app.get('/coupons', [
    query('page').trim().escape().optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').trim().escape().optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM coupons ORDER BY id LIMIT ? OFFSET ?';
    
    pool.execute(query, [limit, offset], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            res.status(500).json({
                error: 'Error fetching coupons',
                details: err.message
            });
            return;
        }
        res.json({
            page: page,
            limit: limit,
            data: results
        });
    });
});


// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MJ_APIKEY_PUBLIC,
        pass: process.env.MJ_APIKEY_PRIVATE
    }
});

// Redemption route
app.post('/redeem/:id', [
    param('id').trim().escape().isInt().withMessage('Invalid coupon ID')
], (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const couponId = req.params.id;
    const checkQuery = 'SELECT id, title, description, redeemed FROM coupons WHERE id = ?';
    
    pool.execute(checkQuery, [couponId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error checking coupon status' });
        }
        if (result[0].redeemed) {
            return res.status(400).json({ success: false, message: 'Coupon already redeemed' });
        }

        const coupon = result[0];
        const updateQuery = 'UPDATE coupons SET redeemed = 1 WHERE id = ?';

        pool.execute(updateQuery, [couponId], (err, result) => {
            if (err) {
                console.error('Error updating coupon status:', err);
                return res.status(500).json({ success: false });
            }

            // Send an email notification
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: 'matthew@americansquid.com',
                subject: `Coupon Redeemed: ID ${coupon.title}`,
                text: `A coupon has been redeemed!\n\nTitle: ${coupon.title}\nDescription: ${coupon.description}`
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
    console.log(`Server is running on port ${process.env.PORT}`);
});
