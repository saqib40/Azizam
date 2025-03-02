# Azizam

A reverse proxy server designed to detect and mitigate web-based attacks such as SQL Injection (SQLi), Cross-Site Scripting (XSS), and Brute Force attempts. It also features a React-based admin dashboard for monitoring and managing blocked IPs.

## Features

- **SQLi & XSS:** Instant blocking upon detection of malicious payloads.
- **Brute Force:** Fingerprint-based detection to block varying IPs, with a lower cap of 5 attempts in 10 minutes for demonstration purposes.

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB
- **Frontend:** React, Material-UI
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Mild hosting over a custom LAN

## Run Locally

1 - Clone the project
```bash
  git clone https://github.com/saqib40/Azizam
  cd Azizam
```

2 - Install dependencies
- Backend
```bash
  cd backend
  npm install
```
- Frontend
```bash
  cd frontend
  npm install
```

3 - Configure Environment
- Create a .env file in the backend/ directory as:
```bash
  PORT=4000
  MONGO_URI=mongodb://localhost:27017/azizam
  JWT_SECRET=your-secret-key
```

4 - Start MongoDB
- Ensure MongoDB is running locally: (if you are on unix system and have installed mongodb using brew)
```bash
  brew services start mongodb-community
```

5 - Run the Application locally over at LAN
- Backend (do check package.json)
```bash
  cd backend
  npm run dev
```
- Frontend (do check package.json)
```bash
  cd frontend
  npm run dev
```
- You will have to update the URL in dlogin.jsx file with your IP address, you can figure that out for Linux/Unix systems using:
```bash
  ipconfig getifaddr en0
```

## Testing
You can test this project out by writing some basic automation scripts or by just interacting with the /userLogin page manually