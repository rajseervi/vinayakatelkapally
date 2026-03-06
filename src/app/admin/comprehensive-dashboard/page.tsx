"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  useTheme,
  alpha,
  Fade,
  Grow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  LinearProgress,
  CircularProgress
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationIcon,
  Receipt as ReceiptIcon,
  PendingActions as PendingIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import { EnhancedAdminLayout } from '../components/EnhancedAdminLayout';
import { EnhancedMetricsCards } from '../components/EnhancedMetricsCards';
import { EnhancedActivityFeed } from '../components/EnhancedActivityFeed';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTooltip,
  Legend,
  Filler
);

// Types
interface DashboardStats {
  totalSales: number;
  totalInvoices: number;
  pendingPayments: number;
  totalParties: number;
  totalProducts: number;
  totalOrders: number;
  monthlyGrowth: number;
  conversionRate: number;
  averageOrderValue: number;
  customerRetention: number;
  profitMargin: number;
  inventoryTurnover: number;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description?: string;
  target?: number;
  unit?: string;
  trend?: number[];
  period?: string;
  category?: 'financial' | 'operational' | 'customer' | 'inventory';
  priority?: 'high' | 'medium' | 'low';
  actionable?: boolean;
  benchmark?: number;
  forecast?: number;
}

interface ActivityItem {
  id: string;
  type: 'invoice' | 'payment' | 'order' | 'party' | 'product' | 'system' | 'user' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
  user?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
  metadata?: {
    [key: string]: any;
  };
  actionable?: boolean;
  actionUrl?: string;
  actionText?: string;
  relatedItems?: {
    type: string;
    id: string;
    title: string;
  }[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  badge?: number;
  isNew?: boolean;
  category: 'create' | 'manage' | 'view' | 'analytics';
}

export default function ComprehensiveAdminDashboard() {
  const router = useRouter();
  const theme = useTheme();

  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState<MetricCard | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<any>({});

  // Enhanced Quick Actions
  const enhancedQuickActions: QuickAction[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View comprehensive analytics',
      icon: <DashboardIcon />,
      color: '#1976D2',
      path: '/admin/dashboard',
      category: 'view'
    },
    {
      id: 'create-invoice',
      title: 'New Invoice',
      description: 'Create invoice quickly',
      icon: <AddIcon />,
      color: '#4CAF50',
      path: '/invoices/new',
      isNew: true,
      category: 'create'
    },
    {
      id: 'quick-order',
      title: 'Quick Order',
      description: 'Fast order creation',
      icon: <SpeedIcon />,
      color: '#FF9800',
      path: '/orders/new',
      badge: 3,
      category: 'create'
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Manage stock levels',
      icon: <InventoryIcon />,
      color: '#9C27B0',
      path: '/inventory',
      badge: 12,
      category: 'manage'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Deep insights & reports',
      icon: <AnalyticsIcon />,
      color: '#F44336',
      path: '/reports',
      category: 'analytics'
    },
    {
      id: 'customers',
      title: 'Customers',
      description: 'Manage customer relationships',
      icon: <PeopleIcon />,
      color: '#00BCD4',
      path: '/parties',
      category: 'manage'
    }
  ];

  // Load Data
  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity(),
        fetchChartData()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStats: DashboardStats = {
        totalSales: 2847650,
        totalInvoices: 1247,
        pendingPayments: 185000,
        totalParties: 342,
        totalProducts: 1856,
        totalOrders: 892,
        monthlyGrowth: 12.5,
        conversionRate: 3.2,
        averageOrderValue: 3195,
        customerRetention: 87.5,
        profitMargin: 23.8,
        inventoryTurnover: 4.2
      };

      setStats(mockStats);
      generateMetricCards(mockStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const generateMetricCards = (stats: DashboardStats) => {
    const cards: MetricCard[] = [
      {
        id: 'total-sales',
        title: 'Total Sales',
        value: `₹${(stats.totalSales / 100000).toFixed(1)}L`,
        change: stats.monthlyGrowth,
        changeType: 'increase',
        icon: <MonetizationIcon />,
        color: '#4CAF50',
        description: 'Revenue this month',
        unit: 'INR',
        target: 3000000,
        trend: [2200000, 2350000, 2500000, 2650000, 2800000, 2847650],
        category: 'financial',
        priority: 'high',
        benchmark: 2500000,
        forecast: 3100000
      },
      {
        id: 'total-invoices',
        title: 'Total Invoices',
        value: stats.totalInvoices,
        change: 8.2,
        changeType: 'increase',
        icon: <ReceiptIcon />,
        color: '#2196F3',
        description: 'Invoices generated',
        target: 1500,
        trend: [1100, 1150, 1200, 1220, 1240, 1247],
        category: 'operational',
        priority: 'medium'
      },
      {
        id: 'pending-payments',
        title: 'Pending Payments',
        value: `₹${(stats.pendingPayments / 100000).toFixed(1)}L`,
        change: -5.3,
        changeType: 'decrease',
        icon: <PendingIcon />,
        color: '#FF9800',
        description: 'Outstanding amount',
        trend: [220000, 210000, 200000, 195000, 190000, 185000],
        category: 'financial',
        priority: 'high',
        actionable: true
      },
      {
        id: 'total-customers',
        title: 'Total Customers',
        value: stats.totalParties,
        change: 15.7,
        changeType: 'increase',
        icon: <PeopleIcon />,
        color: '#9C27B0',
        description: 'Active customers',
        target: 400,
        trend: [280, 295, 310, 325, 335, 342],
        category: 'customer',
        priority: 'medium'
      },
      {
        id: 'inventory-items',
        title: 'Inventory Items',
        value: stats.totalProducts,
        change: 2.1,
        changeType: 'increase',
        icon: <InventoryIcon />,
        color: '#795548',
        description: 'Products in stock',
        trend: [1800, 1820, 1835, 1845, 1850, 1856],
        category: 'inventory',
        priority: 'low'
      },
      {
        id: 'orders',
        title: 'Orders',
        value: stats.totalOrders,
        change: 18.9,
        changeType: 'increase',
        icon: <ShoppingCartIcon />,
        color: '#00BCD4',
        description: 'Orders processed',
        trend: [720, 750, 780, 820, 860, 892],
        category: 'operational',
        priority: 'medium'
      },
      {
        id: 'avg-order-value',
        title: 'Avg Order Value',
        value: `₹${stats.averageOrderValue}`,
        change: 7.4,
        changeType: 'increase',
        icon: <AttachMoneyIcon />,
        color: '#8BC34A',
        description: 'Per order average',
        trend: [2950, 3000, 3050, 3100, 3150, 3195],
        category: 'financial',
        priority: 'medium'
      },
      {
        id: 'conversion-rate',
        title: 'Conversion Rate',
        value: `${stats.conversionRate}%`,
        change: 0.8,
        changeType: 'increase',
        icon: <TimelineIcon />,
        color: '#E91E63',
        description: 'Lead to customer',
        target: 5,
        trend: [2.8, 2.9, 3.0, 3.1, 3.15, 3.2],
        category: 'customer',
        priority: 'high'
      }
    ];

    setMetricCards(cards);
  };

  const fetchRecentActivity = async () => {
    try {
      // Mock data - replace with actual API call
      const mockActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'invoice',
          title: 'New Invoice Created',
          description: 'Invoice #INV-2024-001 for ABC Corp - ₹25,000',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          amount: 25000,
          status: 'success',
          user: {
            id: '1',
            name: 'Admin User',
            role: 'Administrator'
          },
          priority: 'medium',
          tags: ['invoice', 'abc-corp'],
          actionable: false,
          actionUrl: '/invoices/INV-2024-001',
          actionText: 'View Invoice'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          description: 'Payment of ₹15,000 from XYZ Industries',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          amount: 15000,
          status: 'success',
          user: {
            id: '2',
            name: 'System',
            role: 'System'
          },
          priority: 'high',
          tags: ['payment', 'xyz-industries']
        },
        {
          id: '3',
          type: 'order',
          title: 'New Order Placed',
          description: 'Order #ORD-2024-045 for 50 units of Product ABC',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          status: 'info',
          user: {
            id: '3',
            name: 'Customer Portal',
            role: 'Customer'
          },
          priority: 'medium',
          tags: ['order', 'product-abc'],
          relatedItems: [
            { type: 'product', id: 'ABC-123', title: 'Product ABC' },
            { type: 'customer', id: 'CUST-001', title: 'ABC Corp' }
          ]
        },
        {
          id: '4',
          type: 'product',
          title: 'Low Stock Alert',
          description: 'Product ABC-123 is running low (5 units left)',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          status: 'warning',
          user: {
            id: '4',
            name: 'Inventory System',
            role: 'System'
          },
          priority: 'high',
          tags: ['inventory', 'low-stock'],
          actionable: true,
          actionText: 'Restock Now',
          actionUrl: '/inventory/ABC-123'
        },
        {
          id: '5',
          type: 'party',
          title: 'New Customer Added',
          description: 'DEF Solutions added as new customer',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          status: 'info',
          user: {
            id: '5',
            name: 'Sales Team',
            role: 'Sales'
          },
          priority: 'low',
          tags: ['customer', 'def-solutions']
        },
        {
          id: '6',
          type: 'system',
          title: 'Backup Completed',
          description: 'Daily backup completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
          status: 'success',
          user: {
            id: '6',
            name: 'Backup Service',
            role: 'System'
          },
          priority: 'low',
          tags: ['backup', 'system']
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Generate mock chart data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const salesData = months.map(() => Math.floor(Math.random() * 100000) + 50000);
      const ordersData = months.map(() => Math.floor(Math.random() * 100) + 50);
      
      setChartData({
        sales: {
          labels: months,
          datasets: [{
            label: 'Sales Revenue',
            data: salesData,
            borderColor: '#4CAF50',
            backgroundColor: alpha('#4CAF50', 0.1),
            fill: true,
            tension: 0.4
          }]
        },
        orders: {
          labels: months,
          datasets: [{
            label: 'Orders',
            data: ordersData,
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
          }]
        },
        categories: {
          labels: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderWidth: 0
          }]
        }
      });
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleMetricClick = (metric: MetricCard) => {
    setSelectedMetric(metric);
    setDetailsOpen(true);
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.actionUrl) {
      router.push(activity.actionUrl);
    }
  };

  const handleActivityAction = (activity: ActivityItem) => {
    if (activity.actionUrl) {
      router.push(activity.actionUrl);
    }
  };

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <EnhancedAdminLayout
      title="Comprehensive Admin Dashboard"
      subtitle="Advanced business intelligence and management platform"
      showSearch={true}
      showQuickActions={true}
      showNotifications={true}
      showBreadcrumbs={true}
      customQuickActions={enhancedQuickActions}
      pageActions={
        <Stack direction="row" spacing={2} alignItems="center">
          <Tabs
            value={timeRange}
            onChange={(_, newValue) => setTimeRange(newValue)}
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 3,
                py: 1,
                borderRadius: 2,
                mr: 1,
                textTransform: 'none',
                fontWeight: 600
              }
            }}
          >
            <Tab label="7 Days" value="7d" />
            <Tab label="30 Days" value="30d" />
            <Tab label="3 Months" value="3m" />
            <Tab label="1 Year" value="1y" />
          </Tabs>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      }
    >
      {/* Welcome Header */}
      <Fade in timeout={800}>
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
            <DashboardIcon sx={{ fontSize: 200 }} />
          </Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome to Your Business Command Center! 🚀
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Monitor, analyze, and optimize your business performance in real-time
              </Typography>
              <Stack direction="row" spacing={3}>
                <Chip 
                  icon={<TrendingUpIcon />} 
                  label={`+${stats?.monthlyGrowth || 0}% Growth`} 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
                <Chip 
                  icon={<StarIcon />} 
                  label="Premium Dashboard" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="All Systems Operational" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
              </Stack>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AnalyticsIcon />}
                onClick={() => router.push('/reports')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                }}
              >
                View Reports
              </Button>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => router.push('/settings')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                }}
              >
                Settings
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {/* Enhanced Metrics Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Key Performance Indicators
        </Typography>
        <EnhancedMetricsCards
          metrics={metricCards}
          loading={loading}
          onCardClick={handleMetricClick}
          onRefresh={handleRefresh}
          showTrends={true}
          showTargets={true}
          showComparisons={true}
          columns={4}
        />
      </Box>

      {/* Charts and Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Sales Revenue Trend
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Download Chart">
                    <IconButton size="small">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share Chart">
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print Chart">
                    <IconButton size="small">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Box sx={{ height: 300 }}>
                {chartData.sales && (
                  <Line data={chartData.sales} options={chartOptions} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Sales by Category
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {chartData.categories && (
                  <Doughnut 
                    data={chartData.categories} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Activity Feed */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <EnhancedActivityFeed
            activities={recentActivity}
            loading={loading}
            onRefresh={handleRefresh}
            onActivityClick={handleActivityClick}
            onActionClick={handleActivityAction}
            showFilters={true}
            showSearch={true}
            showGrouping={true}
            maxItems={10}
            realTime={true}
            title="Real-time Activity Feed"
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Quick Insights
                </Typography>
                <IconButton size="small">
                  <FilterListIcon />
                </IconButton>
              </Stack>
              <Stack spacing={2}>
                <Box sx={{ p: 2, backgroundColor: alpha('#4CAF50', 0.1), borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    Revenue Target
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    95% Achieved
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={95}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    color="success"
                  />
                </Box>
                <Box sx={{ p: 2, backgroundColor: alpha('#FF9800', 0.1), borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    Pending Actions
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    12 Items
                  </Typography>
                  <Button size="small" variant="outlined" color="warning" sx={{ mt: 1 }}>
                    Review Now
                  </Button>
                </Box>
                <Box sx={{ p: 2, backgroundColor: alpha('#2196F3', 0.1), borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    Customer Satisfaction
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    4.8/5.0
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        fontSize="small"
                        sx={{ color: star <= 4 ? '#FFD700' : '#E0E0E0' }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Metric Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedMetric && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(selectedMetric.color, 0.1),
                    color: selectedMetric.color,
                    width: 48,
                    height: 48
                  }}
                >
                  {selectedMetric.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedMetric.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detailed Performance Analysis
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h2" fontWeight={700} color={selectedMetric.color}>
                        {selectedMetric.value}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Current Value
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Change from Previous Period
                      </Typography>
                      <Chip
                        size="large"
                        label={`${selectedMetric.change > 0 ? '+' : ''}${selectedMetric.change}%`}
                        color={selectedMetric.changeType === 'increase' ? 'success' : 'error'}
                        icon={selectedMetric.changeType === 'increase' ? <TrendingUpIcon /> : <TrendingUpIcon />}
                      />
                    </Box>

                    {selectedMetric.target && (
                      <Box>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          Target Achievement
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(Number(selectedMetric.value.toString().replace(/[^\d.-]/g, '')) / selectedMetric.target) * 100}
                          sx={{ height: 12, borderRadius: 6, mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {((Number(selectedMetric.value.toString().replace(/[^\d.-]/g, '')) / selectedMetric.target) * 100).toFixed(1)}% of target achieved
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {selectedMetric.trend && (
                    <Box>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Performance Trend
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Line
                          data={{
                            labels: selectedMetric.trend.map((_, index) => `Period ${index + 1}`),
                            datasets: [{
                              data: selectedMetric.trend,
                              borderColor: selectedMetric.color,
                              backgroundColor: alpha(selectedMetric.color, 0.1),
                              fill: true,
                              tension: 0.4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button variant="contained" onClick={() => setDetailsOpen(false)}>
                View Full Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </EnhancedAdminLayout>
  );
}