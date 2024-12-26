# Coupon Redemption App

A Node.js app that provides coupon redemption functionality, serving coupon data from a MariaDB database, and sending email notifications upon coupon redemption. The app uses Nodemailer to send emails via Mailjet and is served using PM2 for production.

This web application features a customizable coupon app that allows users to create, display, and manage personalized coupons. Key functionalities include redeeming and disabling coupons. Originally designed as a Christmas gift for my partner, you can easily edit the HTML and create your own database to match your coupons. Whether for promotions or a thoughtful gift for a special someone, this app offers a fun and personalized experience.

## Features
- Secure environment variable validation
- HTTPS support with reverse proxy configuration
- Detailed email notifications including coupon title and description
- Cryptographic secret generation for enhanced security
- Rate limiting support
- MariaDB database integration
- Mailjet email service integration
  
## Requirements

- Node.js (>= 14.x)
- MariaDB
- PM2 (for serving the app in production)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/coupon-redemption-app.git
cd coupon-redemption-app
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Generate Secrets

```bash
node scripts/generate-secrets.js
```

### 4. Set Up Environment Variables

Copy .env.example to .env and configure your environment variables:

```bash
cp .env.example .env
```

### 4. Set Up MariaDB

Ensure that you have a running MariaDB instance and that the couponDB database exists. The database should contain a table coupons with at least the following structure:

```bash
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_code VARCHAR(255) NOT NULL,
    redeemed BOOLEAN DEFAULT FALSE
);
```

### 5. Start the App Using PM2

PM2 will keep the app running in the background, even if the server restarts.

```bash
pm2 start app.js --name coupon-redemption-app
```

### 6. (Optional) View logs

You can view the logs of your app using PM2 by running:

```bash
pm2 logs coupon-redemption-app
```

## Reverse Proxy Setup
The application is configured to work behind a reverse proxy:
- HTTPS termination handled at proxy level
- Proxy trust settings enabled in Express
- Secure headers configured for proxy forwarding
- Default port 3001 for application server

### Proxy Configuration Notes
- Application expects X-Forwarded-Proto header
- Configured to redirect HTTP to HTTPS
- Handles SSL/TLS termination at proxy level
- Maintains secure connections through proxy chain

## API Endpoints

### 1. GET /coupons

Fetch all the coupons in the database.
Example Response:

```bash
[
    {
        "id": 1,
        "coupon_code": "SAVE10",
        "redeemed": false
    },
    {
        "id": 2,
        "coupon_code": "DISCOUNT20",
        "redeemed": true
    }
]
```

### 2. POST /redeem/:id

Redeem a coupon by its ID. This will mark the coupon as redeemed in the database and send an email notification.
Example Response (Success):

```bash
{
    "success": true,
    "message": "Coupon redeemed successfully"
}
```

Example Response (Failure - Coupon already redeemed):

```bash
{
    "success": false,
    "message": "Coupon already redeemed"
}
```

## Troubleshooting

### Database Connection
- Verify MariaDB credentials in .env file
- Ensure database service is running: `systemctl status mariadb`
- Check database permissions for user

### Email Service
- Verify Mailjet API credentials
- Test email configuration
- Check email logs in PM2: `pm2 logs coupon-sheet-app`

### Environment Variables
- Run `node scripts/generate-secrets.js` for new secure keys
- Ensure all required variables from .env.example are set
- Check permissions on .env file

### Reverse Proxy
- Verify proxy headers are being forwarded
- Check HTTPS redirect is working
- Confirm proxy is passing correct host headers

### Common Error Codes
- 500: Check server logs for database connection issues
- 401: Environment variable or authentication problem
- 502: Proxy configuration issue

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
