"use client";
import React, { useState } from "react";
import { EnhancedLayout } from "@/components/Layout";
import { Box, Grid, Card, CardContent, Typography, Chip, Button, Paper, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import { 
  TrendingUp, 
  Inventory, 
  People, 
  Receipt, 
  Add as AddIcon,
  ShoppingCart,
  AttachMoney,
  Assessment,
  Notifications
} from "@mui/icons-material";

function StatCard({ title, value, delta, icon, color = "primary" }: { 
  title: string; 
  value: string; 
  delta?: string; 
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <Card 
      sx={{ 
        height: "100%",
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => `0 8px 32px ${theme.palette.primary.main}20`,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        {delta && (
          <Chip
            label={delta}
            size="small"
            color={delta.startsWith("+") ? "success" : "default"}
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, icon, onClick, color = "primary" }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}) {
  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 6px 24px ${theme.palette.primary.main}30`,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ mb: 2, color: `${color}.main` }}>
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function EnhancedDashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const quickActions = [
    {
      title: "New Invoice",
      description: "Create a new invoice for your customers",
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      onClick: () => window.location.href = '/invoices/new',
      color: "success"
    },
    {
      title: "Add Product",
      description: "Add new products to your inventory",
      icon: <Inventory sx={{ fontSize: 40 }} />,
      onClick: () => window.location.href = '/products/new',
      color: "info"
    },
    {
      title: "New Party",
      description: "Add a new customer or supplier",
      icon: <People sx={{ fontSize: 40 }} />,
      onClick: () => window.location.href = '/parties/new',
      color: "secondary"
    },
    {
      title: "View Reports",
      description: "Check your business analytics",
      icon: <Assessment sx={{ fontSize: 40 }} />,
      onClick: () => window.location.href = '/reports',
      color: "warning"
    },
  ];

  const recentActivities = [
    { text: "New invoice #INV-001 created", time: "2 minutes ago", icon: <Receipt color="primary" /> },
    { text: "Product 'Widget A' stock updated", time: "15 minutes ago", icon: <Inventory color="success" /> },
    { text: "New customer 'ABC Corp' added", time: "1 hour ago", icon: <People color="info" /> },
    { text: "Payment received for INV-998", time: "2 hours ago", icon: <AttachMoney color="warning" /> },
    { text: "Low stock alert for 'Widget B'", time: "3 hours ago", icon: <Notifications color="error" /> },
  ];

  return (
    <EnhancedLayout
      title="Dashboard"
      onThemeToggle={handleThemeToggle}
      isDarkMode={isDarkMode}
      showBackToTop={true}
    >
      <Box>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Welcome back! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Here's what's happening with your business today.
          </Typography>
        </Paper>

        {/* Top stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Monthly Revenue" 
              value="₹2,45,000" 
              delta="+12%" 
              icon={<TrendingUp color="primary" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Orders" 
              value="324" 
              delta="+5%" 
              icon={<Receipt color="info" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Active Products" 
              value="245" 
              icon={<Inventory color="success" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Active Parties" 
              value="118" 
              icon={<People color="secondary" />} 
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <QuickActionCard {...action} />
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity and Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '400px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Recent Activity
                </Typography>
                <List>
                  {recentActivities.map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.text}
                        secondary={activity.time}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '400px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Sales Overview
                </Typography>
                <Box 
                  sx={{ 
                    height: '300px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}
                >
                  <Typography color="text.secondary">
                    Chart component would go here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/invoices/new'}
            sx={{ mr: 2, mb: 2 }}
          >
            Create New Invoice
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Assessment />}
            onClick={() => window.location.href = '/reports'}
            sx={{ mb: 2 }}
          >
            View Detailed Reports
          </Button>
        </Box>
      </Box>
    </EnhancedLayout>
  );
}