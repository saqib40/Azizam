import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  ThemeProvider,
} from '@mui/material';
import { styled } from '@mui/system';
import { createTheme } from '@mui/material/styles';

// Create a default theme
const theme = createTheme();

// Custom styles following Material Design
const HeroSection = styled(Box)(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.grey[100],
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  boxShadow: theme.shadows[2],
  padding: theme.spacing(2),
}));

const CTASection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  textAlign: 'center',
}));

function App() {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth={false} disableGutters>
        {/* Hero Section */}
        <HeroSection>
          <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome to Azizam
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" gutterBottom>
            Proxy Server to Trap Threats, Protect Systems, & Outsmart Attackers.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 4 }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => navigate("/login")}
            style={{ transform: hover ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.2s' }}
          >
            Go to Dashboard
          </Button>
        </HeroSection>

        {/* Features Section */}
        <Box py={8}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 500 }}>
            Why Azizam?
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ px: 4 }}>
            <Grid item xs={12} sm={4}>
              <FeatureCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Deceptive Proxy
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Serve attackers our proxy server, keeping your real systems safe.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FeatureCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Smart Detection
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Catches SQLi, XSS, and brute force attacks, even from IP-switching foes.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FeatureCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Instant Response
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Blocks threats automatically and empowers admins with control.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Box>

        {/* Call-to-Action Section */}
        <CTASection>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
            Ready to Secure Your Network?
          </Typography>
          <Typography variant="body1" gutterBottom>
            Deploy Azizam and turn the tables on cyber threats today.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 2 }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => window.open('https://github.com/saqib40/Azizam', '_blank')}
            style={{ transform: hover ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.2s' }}
          >
            Get Started
          </Button>
        </CTASection>
      </Container>
    </ThemeProvider>
  );
}

export default App;