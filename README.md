# Customer Care Registry App

## Project Overview

CustomerCare Registry App is a web-based application developed to simplify customer complaint management. The system allows users to register, log in, submit support tickets, and monitor their complaint status. Administrators can efficiently manage customer issues by updating ticket status, assigning priorities, and maintaining interaction logs.

This project is built using React.js for the frontend and Node.js with Express.js for the backend. Instead of MongoDB, JSON files are used as the local database, making the application lightweight and easy to run without additional database installation.

---

## Features

### User Module
- User Registration
- Secure Login using JWT
- Create Support Tickets
- View Ticket Details
- Submit Feedback

### Admin Module
- View All Tickets
- Update Ticket Status
- Change Ticket Priority
- Manage Customers
- Dashboard Analytics
- Interaction Logs

---

## Technologies Used

### Frontend
- React.js
- React Router DOM
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs

### Database
- JSON File Storage

---

## Project Structure

```
customer-support-management-system/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── styles/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── data/
│   │   ├── users.json
│   │   └── complaints.json
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone the Project

```bash
git clone <repository-url>
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend Server:

```
http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend Server:

```
http://localhost:5173
```

---

## Default Administrator Account

```
Email:
admin@ccr.com

Password:
Admin@123
```

---

## Local Data Storage

All application data is stored locally in:

```
backend/data/users.json
backend/data/complaints.json
```

This project does not require MongoDB.

---

## Future Enhancements

- Email Notifications
- Ticket Assignment
- File Attachments
- Advanced Search
- Dashboard Reports
- Export Ticket Reports
- Role-Based Ticket Visibility
- Real-Time Notifications

---

## Advantages

- Lightweight Architecture
- No Database Installation Required
- Easy to Configure
- Beginner Friendly
- Simple CRUD Operations
- Responsive User Interface

---

## Conclusion

The Customer Care Registry  provides an efficient way to manage customer complaints and support requests. The application demonstrates authentication, ticket management, customer management, analytics, and local data storage using JSON files, making it suitable for academic projects and learning full-stack web development.

---

## Developed By

RISHIKA PUSUNURI
