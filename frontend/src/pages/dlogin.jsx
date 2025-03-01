import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Container } from '@mui/material';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';

// Client-side data collection (mimics getClientSideData from backend)
async function getClientSideData() {
  const navigatorData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
  const screenData = {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth,
  };
  return {
    navigator: navigatorData,
    screen: screenData,
  };
}

export default function DLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);

    // Basic validation
    if (email === "") {
      setEmailError(true);
    }
    if (password === "") {
      setPasswordError(true);
    }
    if (email && password) {
      try {
        // Collect client-side fingerprint data
        const clientData = await getClientSideData();

        // Send data to backend including navigator and screen info
        const response = await fetch("http://localhost:3000/login", { // Updated port to match backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email, // Match backend's expected field
            password: password,
            navigator: clientData.navigator,
            screen: clientData.screen,
          }),
        });

        const responseData = await response.json();
        console.log("Response:", responseData);

        if (response.status === 403) { // Blocked by backend
          alert("Access denied - suspicious activity detected");
        } else if (response.status === 401) { // Fake login failure
          alert("Login failed - incorrect credentials");
        } else if (response.ok) { // Unexpected success (honeypot shouldn’t succeed)
          console.log("Unexpected success - token:", responseData.token);
          localStorage.setItem("myToken", responseData.token);
          navigate("/all-machines");
          window.location.reload();
        }
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        alert("An error occurred. Please try again.");
      }
    }
  }

  return (
    <Container sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Typography variant="h2">User Login</Typography>
      <form noValidate autoComplete='off' onSubmit={handleSubmit} style={{ width: "30vw", marginBottom: "20px" }}>
        <TextField
          onChange={(e) => setEmail(e.target.value)}
          sx={{ display: "block", marginTop: "20px", marginBottom: "20px" }}
          label="Email Address"
          variant="outlined"
          color="primary"
          required
          fullWidth
          error={emailError}
        />
        <TextField
          onChange={(e) => setPassword(e.target.value)}
          sx={{ display: "block", marginTop: "20px", marginBottom: "20px" }}
          label="Password"
          variant="outlined"
          color="primary"
          required
          fullWidth
          error={passwordError}
        />
        <Button
          fullWidth
          variant='contained'
          color="primary"
          type='submit'
        >
          Login
        </Button>
      </form>
      <Link
        underline="always"
        component="button"
        onClick={() => navigate("/userlogin")}
      >
        Don't have an account? Sign Up
      </Link>
    </Container>
  );
}