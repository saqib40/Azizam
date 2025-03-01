import React, { useState } from "react";
import { Container, Grid, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const hardcodedData = {
  blocked: {
    SQLi: ["192.168.1.1", "192.168.1.2"],
    XSS: ["192.168.2.1"],
    BruteForce: ["192.168.3.1", "192.168.3.2", "192.168.3.3"],
  },
  unblocked: {
    SQLi: ["192.168.4.1"],
    XSS: [],
    BruteForce: ["192.168.5.1"],
  },
};

const Dashboard = () => {
  const [selectedIP, setSelectedIP] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); // Track if IP is blocked or unblocked

  const handleClick = (ip, category, status) => {
    setSelectedIP(ip);
    setSelectedCategory(category);
    setIsBlocked(status === "blocked"); // Determine if IP is from Blocked section
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleAction = () => {
    if (isBlocked) {
      console.log(`Unblocking IP: ${selectedIP}`); // Simulate unblock action
    } else {
      console.log(`Blocking IP: ${selectedIP}`); // Simulate block action
    }
    handleClose(); // Close dialog after action
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        BLOCKED
      </Typography>
      <Grid container spacing={2}>
        {Object.keys(hardcodedData.blocked).map((category) => (
          <Grid item xs={4} key={category}>
            <Card>
              <CardContent>
                <Typography variant="h6">{category}</Typography>
                {hardcodedData.blocked[category].map((ip) => (
                  <Button key={ip} onClick={() => handleClick(ip, category, "blocked")}>
                    {ip}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" align="center" gutterBottom style={{ marginTop: 20 }}>
        UNBLOCKED
      </Typography>
      <Grid container spacing={2}>
        {Object.keys(hardcodedData.unblocked).map((category) => (
          <Grid item xs={4} key={category}>
            <Card>
              <CardContent>
                <Typography variant="h6">{category}</Typography>
                {hardcodedData.unblocked[category].map((ip) => (
                  <Button key={ip} onClick={() => handleClick(ip, category, "unblocked")}>
                    {ip}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>IP Details</DialogTitle>
        <DialogContent>
          <Typography>IP: {selectedIP}</Typography>
          <Typography>Category: {selectedCategory}</Typography>
          <Typography>Attempts: {Math.floor(Math.random() * 10) + 1}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button
            onClick={handleAction}
            color="primary"
            variant="contained"
          >
            {isBlocked ? "Unblock" : "Block"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;