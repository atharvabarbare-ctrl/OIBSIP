# 🍕 PizzaHub – Pizza Delivery Full-Stack Application

## Oasis Infobyte SIP – Web Development & Designing

### Level 3 – Task 1

PizzaHub is a full-stack pizza delivery application developed as part of the Oasis Infobyte Web Development & Designing Internship.

The application provides a complete pizza ordering workflow along with authentication, online payment testing, order tracking, admin order management, and inventory management.

## 🚀 Features

### 👤 User Side

- User Registration
- Email Verification
- JWT Authentication
- Login & Logout
- Forgot Password
- Reset Password
- Pizza Dashboard
- Pizza Menu
- Custom Pizza Builder
- Multiple pizza bases
- Multiple sauces
- Cheese selection
- Vegetable selection
- Cart Management
- Order Summary
- Cash on Delivery
- Razorpay Test Mode Checkout
- Order Tracking
- Order Status Updates

### 🛠️ Admin Side

- Separate Admin Login
- Admin Dashboard
- Order Management
- Order Status Updates
- Inventory Dashboard
- Automatic Stock Decrement
- Manual Stock Updates
- Low Stock Monitoring
- Scheduled Low Stock Email Alerts
- Inventory Management

## 🧑‍💻 Tech Stack

### Frontend

- React.js
- JavaScript
- Vite
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Razorpay
- node-cron

## 📁 Project Structure

```text
WebDev-L3-Task1-PizzaDelivery/
│
├── client/
│   ├── public/
│   └── src/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
│
├── screenshots/
│
└── README.md
⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/atharvabarbare-ctrl/OIBSIP.git
cd OIBSIP/WebDev-L3-Task1-PizzaDelivery
2. Install frontend dependencies
cd client
npm install
3. Install backend dependencies
cd ../server
npm install
4. Environment Variables

Create a .env file inside the server folder and configure the required environment variables.

Do not upload .env files or secret credentials to GitHub.

5. Run Backend
cd server
npm run dev
6. Run Frontend

Open another terminal:

cd client
npm run dev

The application can then be accessed through the local Vite development server.

🔐 Authentication

PizzaHub uses JWT-based authentication.

The application includes:

User registration
Email verification
Secure login
Protected routes
Forgot password
Password reset
Separate admin authentication
🍕 Custom Pizza Builder

Users can create their own pizza by selecting available:

Pizza bases
Sauces
Cheese
Vegetables

The selected ingredients are reflected in the order summary.

💳 Payment

The application supports:

Cash on Delivery
Razorpay Test Mode

Razorpay is configured for testing purposes.

📦 Order Management

Users can:

Place orders
View order summaries
View previous orders
Track order status

Admins can:

View orders
Update order status
Manage inventory
📊 Inventory Management

The admin dashboard provides inventory management functionality including:

Current stock monitoring
Manual stock updates
Automatic stock decrement after orders
Low-stock monitoring
Scheduled low-stock email alerts
⏱️ Scheduled Monitoring

The backend uses node-cron for scheduled low-stock checks.

📸 Screenshots

Project screenshots are available in the screenshots/ directory.

🎥 Demo

A complete project demonstration video showcases the main user workflow and admin functionality.

🎯 Internship Task

Organization: Oasis Infobyte

Track: Web Development & Designing

Level: Level 3

Task: Pizza Delivery Full-Stack Application

👨‍💻 Developer

Atharva Barbare

Web Development & Designing Intern

Oasis Infobyte