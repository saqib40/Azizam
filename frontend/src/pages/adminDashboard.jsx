import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [blockedIPs, setBlockedIPs] = useState({ SQLi: [], XSS: [], Brute: [] });
  const [unblockedIPs, setUnblockedIPs] = useState({ SQLi: [], XSS: [], Brute: [] });
  const [attackLogs, setAttackLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedIP, setSelectedIP] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isBlockedState, setIsBlockedState] = useState(false);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("myToken");
    setIsAuthenticated(!!token);
    if (!token) {
      navigate("/admin-login"); // Redirect to login if no token
    }
  }, [navigate]);

  // Fetch attacks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAttacks();
    }
  }, [isAuthenticated]);

  const fetchAttacks = async () => {
    try {
      const response = await fetch("http://localhost:4000/v1", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("myToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch attack data");
      }
      const { attackLogs, blockedIPs } = await response.json();

      // Process blocked IPs
      const blocked = {
        SQLi: blockedIPs.filter((ip) => ip.reason === "SQLi").map((ip) => ip.ip),
        XSS: blockedIPs.filter((ip) => ip.reason === "XSS").map((ip) => ip.ip),
        Brute: blockedIPs.filter((ip) => ip.reason === "Brute").map((ip) => ip.ip),
      };

      // Process unblocked IPs (exclude blocked ones)
      const blockedIPSet = new Set(blockedIPs.map((b) => b.ip));
      const unblocked = {
        SQLi: attackLogs
          .filter((log) => log.payload === "SQLi" && !blockedIPSet.has(log.ip))
          .map((log) => log.ip),
        XSS: attackLogs
          .filter((log) => log.payload === "XSS" && !blockedIPSet.has(log.ip))
          .map((log) => log.ip),
        Brute: attackLogs
          .filter((log) => log.payload === "Brute" && !blockedIPSet.has(log.ip))
          .map((log) => log.ip),
      };

      setBlockedIPs(blocked);
      setUnblockedIPs(unblocked);
      setAttackLogs(attackLogs);
    } catch (err) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (ip, category, status) => {
    setSelectedIP(ip);
    setSelectedCategory(category);
    setIsBlockedState(status === "blocked");
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleAction = async () => {
    const action = isBlockedState ? "unblock" : "block";
    try {
      const response = await fetch(`http://localhost:4000/v1/${action}/${selectedIP}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("myToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to ${action} IP`);
      }
      const data = await response.json();
      console.log(data.message);
      await fetchAttacks(); // Refresh data after action
    } catch (err) {
      console.error(`Error ${action}ing IP:`, err);
    } finally {
      handleClose();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          You are not authorized to access this dashboard. Please log in.
        </Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        BLOCKED
      </Typography>
      <Grid container spacing={2}>
        {Object.keys(blockedIPs).map((category) => (
          <Grid item xs={4} key={category}>
            <Card>
              <CardContent>
                <Typography variant="h6">{category}</Typography>
                {blockedIPs[category].map((ip) => (
                  <Button
                    key={ip}
                    onClick={() => handleClick(ip, category, "blocked")}
                    fullWidth
                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                  >
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
        {Object.keys(unblockedIPs).map((category) => (
          <Grid item xs={4} key={category}>
            <Card>
              <CardContent>
                <Typography variant="h6">{category}</Typography>
                {unblockedIPs[category].map((ip) => (
                  <Button
                    key={ip}
                    onClick={() => handleClick(ip, category, "unblocked")}
                    fullWidth
                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                  >
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
          <Typography>
            Attempts: {attackLogs.find((a) => a.ip === selectedIP)?.attemptCount || "N/A"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button onClick={handleAction} color="primary" variant="contained">
            {isBlockedState ? "Unblock" : "Block"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;