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
  CardActions,
  Button,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Skeleton,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  useTheme,
  alpha,
  Fade,
  Grow,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
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
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon
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

import { AdminLayout } from '../components/AdminLayout';

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

// Enhanced Types
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
}

interface ActivityItem {
  id: string;
  type: 'invoice' | 'payment' | 'order' | 'party' | 'product' | 'system';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  user?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface NotificationItem {
  id: string;
  type: 'payment_due' | 'low_stock' | 'new_order' | 'system' | 'achievement' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  actionText?: string;
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

export default function EnhancedAdminDashboard() {
  const router = useRouter();
  const theme = useTheme();

  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

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
        fetchNotifications(),
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
        unit: 'INR'
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
        target: 1500
      },
      {
        id: 'pending-payments',
        title: 'Pending Payments',
        value: `₹${(stats.pendingPayments / 100000).toFixed(1)}L`,
        change: -5.3,
        changeType: 'decrease',
        icon: <PendingIcon />,
        color: '#FF9800',
        description: 'Outstanding amount'
      },
      {
        id: 'total-customers',
        title: 'Total Customers',
        value: stats.totalParties,
        change: 15.7,
        changeType: 'increase',
        icon: <PeopleIcon />,
        color: '#9C27B0',
        description: 'Active customers'
      },
      {
        id: 'inventory-items',
        title: 'Inventory Items',
        value: stats.totalProducts,
        change: 2.1,
        changeType: 'increase',
        icon: <InventoryIcon />,
        color: '#795548',
        description: 'Products in stock'
      },
      {
        id: 'orders',
        title: 'Orders',
        value: stats.totalOrders,
        change: 18.9,
        changeType: 'increase',
        icon: <ShoppingCartIcon />,
        color: '#00BCD4',
        description: 'Orders processed'
      },
      {
        id: 'avg-order-value',
        title: 'Avg Order Value',
        value: `₹${stats.averageOrderValue}`,
        change: 7.4,
        changeType: 'increase',
        icon: <AttachMoneyIcon />,
        color: '#8BC34A',
        description: 'Per order average'
      },
      {
        id: 'conversion-rate',
        title: 'Conversion Rate',
        value: `${stats.conversionRate}%`,
        change: 0.8,
        changeType: 'increase',
        icon: <TimelineIcon />,
        color: '#E91E63',
        description: 'Lead to customer'
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
          description: 'Invoice #DC-2024-001 for ABC Corp - ₹25,000',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          amount: 25000,
          status: 'success',
          user: 'Admin',
          priority: 'medium'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          description: 'Payment of ₹15,000 from XYZ Industries',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          amount: 15000,
          status: 'success',
          user: 'System',
          priority: 'high'
        },
        {
          id: '3',
          type: 'order',
          title: 'New Order Placed',
          description: 'Order #ORD-2024-045 for 50 units of Product ABC',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          status: 'info',
          user: 'Customer',
          priority: 'medium'
        },
        {
          id: '4',
          type: 'product',
          title: 'Low Stock Alert',
          description: 'Product ABC-123 is running low (5 units left)',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          status: 'warning',
          user: 'System',
          priority: 'high'
        },
        {
          id: '5',
          type: 'party',
          title: 'New Customer Added',
          description: 'DEF Solutions added as new customer',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          status: 'info',
          user: 'Sales Team',
          priority: 'low'
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock data - replace with actual API call
      const mockNotifications: NotificationItem[] = [
        {
          id: '1',
          type: 'payment_due',
          title: 'Payment Overdue',
          message: 'Invoice #DC-2024-001 payment is 5 days overdue (₹25,000)',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          priority: 'high',
          actionUrl: '/invoices/DC-2024-001',
          actionText: 'View Invoice'
        },
        {
          id: '2',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: '3 products are running critically low on stock',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          read: false,
          priority: 'medium',
          actionUrl: '/inventory',
          actionText: 'Manage Stock'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Monthly Target Achieved',
          message: 'Congratulations! You have achieved 105% of monthly sales target',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: false,
          priority: 'low'
        },
        {
          id: '4',
          type: 'new_order',
          title: 'Bulk Order Received',
          message: 'Large order #ORD-2024-046 received from ABC Corp (₹1,50,000)',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          read: true,
          priority: 'medium',
          actionUrl: '/orders/ORD-2024-046',
          actionText: 'View Order'
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
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

  // Utility Functions
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <ReceiptIcon />;
      case 'payment': return <CreditCardIcon />;
      case 'order': return <ShoppingCartIcon />;
      case 'party': return <PeopleIcon />;
      case 'product': return <InventoryIcon />;
      case 'system': return <SettingsIcon />;
      default: return <InfoIcon />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_due': return <ErrorIcon />;
      case 'low_stock': return <WarningIcon />;
      case 'new_order': return <ShoppingCartIcon />;
      case 'system': return <InfoIcon />;
      case 'achievement': return <CheckCircleIcon />;
      case 'alert': return <NotificationsIcon />;
      default: return <InfoIcon />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      case 'info': return '#2196F3';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

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
    <AdminLayout
      title="Enhanced Admin Dashboard.."
      showSearch={true}
      showQuickActions={true}
      showNotifications={true}
      showBreadcrumbs={true}
      customQuickActions={enhancedQuickActions}
    >
      {/* Welcome Header */}
      <Fade in timeout={800}>
        <Paper 
          sx={{ 
            p: 4, 
            mb: 3, 
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
                Welcome back, Admin! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Here's what's happening with your business today
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
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
                  label="Premium Account" 
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
                startIcon={<RefreshIcon />}
                onClick={() => loadDashboardData()}
                disabled={refreshing}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ color: 'white' }}
              >
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3 }}>
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
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Grow in timeout={600 + index * 100}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                  }
                }}
                onClick={() => setSelectedMetric(card.id)}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(card.color, 0.1),
                        color: card.color,
                        width: 48,
                        height: 48
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <Chip
                      size="small"
                      label={`${card.change > 0 ? '+' : ''}${card.change}%`}
                      color={card.changeType === 'increase' ? 'success' : card.changeType === 'decrease' ? 'error' : 'default'}
                      icon={card.changeType === 'increase' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    />
                  </Stack>
                  <Typography variant="h4" fontWeight={700} color={card.color} gutterBottom>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {card.title}
                  </Typography>
                  {card.description && (
                    <Typography variant="caption" color="text.secondary">
                      {card.description}
                    </Typography>
                  )}
                  {card.target && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(Number(card.value) / card.target) * 100}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(card.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: card.color
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Target: {card.target}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Sales Revenue Trend
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small">
                    <DownloadIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
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

      {/* Activity and Notifications */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Activity
                </Typography>
                <Button size="small" endIcon={<VisibilityIcon />}>
                  View All
                </Button>
              </Stack>
              <List>
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <ListItem key={activity.id} divider={index < 4}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(getStatusColor(activity.status), 0.1),
                          color: getStatusColor(activity.status),
                          width: 40,
                          height: 40
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Chip
                            size="small"
                            label={activity.user}
                            variant="outlined"
                          />
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                        {activity.amount && (
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            ₹{activity.amount.toLocaleString()}
                          </Typography>
                        )}
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Notifications
                </Typography>
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </Stack>
              <List>
                {notifications.slice(0, 4).map((notification, index) => (
                  <ListItem key={notification.id} divider={index < 3}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(getPriorityColor(notification.priority), 0.1),
                          color: getPriorityColor(notification.priority),
                          width: 32,
                          height: 32
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main'
                              }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(notification.timestamp)}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <CardActions>
                <Button fullWidth size="small" onClick={() => setShowAllNotifications(true)}>
                  View All Notifications
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          Dashboard Settings
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><DownloadIcon /></ListItemIcon>
          Export Data
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><PrintIcon /></ListItemIcon>
          Print Report
        </MenuItem>
      </Menu>

      {/* All Notifications Dialog */}
      <Dialog
        open={showAllNotifications}
        onClose={() => setShowAllNotifications(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>All Notifications</DialogTitle>
        <DialogContent>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(getPriorityColor(notification.priority), 0.1),
                      color: getPriorityColor(notification.priority)
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                />
                <ListItemSecondaryAction>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(notification.timestamp)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAllNotifications(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}