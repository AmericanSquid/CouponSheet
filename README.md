# Coupon Redemption App

A Node.js app that provides coupon redemption functionality, serving coupon data from a MariaDB database, and sending email notifications upon coupon redemption. The app uses Nodemailer to send emails via Mailjet and is served using PM2 for production.

This web application features a customizable coupon app that allows users to create, display, and manage personalized coupons. Key functionalities include redeeming and disabling coupons. Originally designed as a Christmas gift for my partner, you can easily edit the HTML and create your own database to match your coupons. Whether for promotions or a thoughtful gift for a special someone, this app offers a fun and personalized experience.

## Features

- Serve static files (CSS, JS) from the public folder.
- API endpoint to fetch all coupons.
- API endpoint for coupon redemption with email notification.
- Environment variables for sensitive information (like Mailjet credentials).

## Requirements

- Node.js (>= 14.x)
- MariaDB
- PM2 (for serving the app in production)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/coupon-redemption-app.git
cd coupon-redemption-app
```

### 2. Install dependencies

Install the required Node.js dependencies:

```bash
npm install
```

### 3. Set up environment variables

Create a .env file in the root of the project and add the following values:

```bash
DB_USER=your_mariadb_user
DB_PASS=your_mariadb_password
MAILJET_USER=your_mailjet_api_user
MAILJET_PASS=your_mailjet_api_password
```

Make sure to replace the placeholders with your actual database and Mailjet credentials.

### 4. Set up MariaDB

Ensure that you have a running MariaDB instance and that the couponDB database exists. The database should contain a table coupons with at least the following structure:

```bash
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_code VARCHAR(255) NOT NULL,
    redeemed BOOLEAN DEFAULT FALSE
);
```

### 5. Start the app using PM2

To run the app in the background using PM2, use the following commands:

```bash
pm2 start app.js --name coupon-redemption-app
```

PM2 will keep the app running in the background, even if the server restarts.

### 6. (Optional) View logs

You can view the logs of your app using PM2 by running:

```bash
pm2 logs coupon-redemption-app
```

### 7. Access the app

Once the app is running, you can access it at http://localhost:3001 or the specified port.

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

- Ensure that your MariaDB instance is running and accessible.
- If the images are not loading, make sure that they are in the public folder or its subdirectories, and that you're referencing them correctly in your HTML files (e.g., /images/your-image.jpg).
- If PM2 isn't working as expected, try running the app manually with node server.js to identify potential errors.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.


## Key Sections:

- **Setup Instructions**: Detailed steps to install dependencies, set up environment variables, and configure MariaDB.
- **PM2 Usage**: Instructions on how to use PM2 to start the app in production and view logs.
- **API Endpoints**: Description of the available API endpoints (`GET /coupons` and `POST /redeem/:id`).
- **Troubleshooting**: Tips for resolving common issues like database connection or static file serving problems.

Make sure to update the `git clone` URL, database credentials, and any other project-specific details.
