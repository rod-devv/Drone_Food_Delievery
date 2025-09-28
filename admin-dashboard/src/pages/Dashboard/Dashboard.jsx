import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import PeopleIcon from "@mui/icons-material/People";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SettingsIcon from "@mui/icons-material/Settings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightIcon from "@mui/icons-material/Flight";

function Dashboard() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage or context
    const role = localStorage.getItem("userRole");
    console.log("User role from localStorage-----------:", role);
    setUserRole(role);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  const renderAdminDashboard = () => {
    return (
      <Box mt={4}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Description
            </Typography>
            <Typography variant="body1">
              As an administrator, you have complete oversight of the food drone
              delivery platform. You can manage restaurants,monitor delivery
              drones, monitor user activity, and access system-wide analytics.
              Use the quick actions below to navigate to commonly used
              functions.
            </Typography>
          </CardContent>
        </Card>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FlightIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monitor Drone Deliveries"
                    secondary="Track active deliveries and drone status"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <RestaurantIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Manage Restaurants"
                    secondary="Add, edit or remove restaurants"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Manage Users"
                    secondary="Review user accounts and permissions"
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AnalyticsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Analytics"
                    secondary="View platform performance metrics"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Settings"
                    secondary="Configure platform settings"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  const renderRestaurateurDashboard = () => {
    return (
      <Box mt={4}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Restaurant Management
            </Typography>
            <Typography variant="body1">
              Welcome to your restaurant dashboard! Here you can manage your
              restaurant menu, track orders, view analytics, and respond to
              customer reviews. Use the quick actions below to navigate to
              commonly used functions.
            </Typography>
          </CardContent>
        </Card>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Overview Actions
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <MenuBookIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Manage Menu"
                    secondary="Add, edit or remove menu items"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FlightTakeoffIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Current Orders"
                    secondary="View and manage incoming orders"
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AnalyticsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Restaurant Analytics"
                    secondary="View sales and performance metrics"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StorefrontIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Restaurant Profile"
                    secondary="Update restaurant information"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box mt={3} mb={5}>
        <Box display="flex" alignItems="center" mb={2}>
          <DashboardIcon sx={{ fontSize: 30, mr: 1, color: "primary.main" }} />
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="textSecondary">
          {userRole === "admin"
            ? "Admin Control Panel"
            : "Restaurant Management System"}
        </Typography>
      </Box>

      {userRole === "admin"
        ? renderAdminDashboard()
        : renderRestaurateurDashboard()}
    </Container>
  );
}

export default Dashboard;
