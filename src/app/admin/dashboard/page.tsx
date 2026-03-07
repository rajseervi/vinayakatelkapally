"use client";
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  Skeleton,
  Card,
  CardContent,
  CardActions,
  Alert,
  AlertTitle,
  Avatar,
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
  Zoom,
  Collapse,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  Slider,
  CircularProgress
} from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  Over,
  Active
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS
} from '@dnd-kit/utilities';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as MonetizationIcon,
  Receipt as ReceiptIcon,
  PendingActions as PendingIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  LocalShipping as LocalShippingIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  DragIndicator as DragIndicatorIcon,
  ViewModule as ViewModuleIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  RestartAlt as RestartAltIcon,
  Close as CloseIcon,
  Dialog as DialogIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

import { VisuallyEnhancedDashboardLayout } from '@/components/ModernLayout';
import { EnhancedMetricsCards } from '../components/EnhancedMetricsCards';
import { EnhancedActivityFeed } from '../components/EnhancedActivityFeed';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTooltip, Legend, ArcElement);

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
}

interface NotificationItem {
  id: string;
  type: 'payment_due' | 'low_stock' | 'new_order' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

// Enhanced Types for Drag & Drop Dashboard
interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'activity' | 'notifications' | 'invoices' | 'quick-actions';
  title: string;
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  data?: any;
}

interface KPICard {
  id: string;
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  position: number;
  enabled: boolean;
}

interface DragItem {
  id: string;
  type: string;
  position: number;
}

// Sortable KPI Card Component
const SortableKPICard = ({ card, isDragMode, loading, theme, cardWidth }: { 
  card: KPICard; 
  isDragMode: boolean; 
  loading: boolean; 
  theme: any;
  cardWidth: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: !isDragMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragMode ? 'grab' : 'default',
  };

  if (!card.enabled) return null;

  return (
    <Box
      sx={{
        flex: '0 0 auto',
        width: `${cardWidth}px`,
        minWidth: `${cardWidth}px`,
        transition: 'width 0.3s ease-in-out',
      }}
    >
      <Zoom in={!loading} timeout={300 + card.position * 100}>
        <Card
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...(isDragMode ? listeners : {})}
          sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(card.color, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            transition: 'all 0.3s ease-in-out',
            border: isDragMode ? `2px dashed ${card.color}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 3,
            cursor: isDragMode ? 'grab' : 'default',
            '&:hover': {
              transform: isDragMode ? 'none' : 'translateY(-4px)',
              boxShadow: isDragMode ? 'none' : `0 12px 40px ${alpha(card.color, 0.25)}`,
              borderColor: card.color,
            },
          }}
        >
          <CardContent sx={{ p: 1.5, position: 'relative' }}>
            {isDragMode && (
              <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                <DragIndicatorIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
              </Box>
            )}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: card.color,
                  color: 'white',
                  boxShadow: `0 8px 24px ${alpha(card.color, 0.3)}`,
                }}
              >
                {card.icon}
              </Avatar>
              <Stack direction="row" alignItems="center" spacing={1}>
                {card.trend && (
                  <>
                    {card.trend.isPositive ? (
                      <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: card.trend.isPositive ? theme.palette.success.main : theme.palette.error.main,
                        fontWeight: 600 
                      }}
                    >
                      {card.trend.value}%
                    </Typography>
                  </>
                )}
              </Stack>
            </Stack>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: card.color }}>
              {card.value.toLocaleString()}
            </Typography>
            <Typography variant="body2" fontWeight={700} gutterBottom>
              {card.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              {card.subtitle}
            </Typography>
            {card.trend && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <AnalyticsIcon sx={{ fontSize: '16px' }} color="primary" />
                <Chip 
                  label={card.trend.label} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ borderRadius: 1, height: '20px', fontSize: '11px' }}
                />
              </Stack>
            )}
          </CardContent>
        </Card>
      </Zoom>
    </Box>
  );
};

export default function ModernAdminDashboardPage() {
  const router = useRouter();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueLast12, setRevenueLast12] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  
  // Enhanced Drag & Drop State
  const [isDragMode, setIsDragMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [kpiCards, setKpiCards] = useState<KPICard[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [dragConstraints, setDragConstraints] = useState<{ width: number; height: number } | null>(null);
  
  // Card Management State
  const [showCardManager, setShowCardManager] = useState(false);
  const [defaultKPICards, setDefaultKPICards] = useState<KPICard[]>([]);
  const [cardWidth, setCardWidth] = useState(180);
  
  // Recent Invoices State
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Invoice Status Summary State
  const [invoiceStatusSummary, setInvoiceStatusSummary] = useState({ paid: 0, pending: 0, overdue: 0 });

  // Quick Stats State
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [collectionRate, setCollectionRate] = useState(0);

  // Expense Overview State
  const [monthlyExpenses, setMonthlyExpenses] = useState<number[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  
  // Enhanced Sensors with better touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: isDragMode ? 0 : 1000, // Require long press when not in drag mode
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // Custom quick actions for admin dashboard
  const adminQuickActions = [
    {
      id: 'admin-dashboard',
      title: 'Dashboard',
      icon: <AssessmentIcon />,
      path: '/admin/dashboard',
      color: '#2196F3',
    },
    {
      id: 'create-invoice',
      title: 'New Invoice',
      icon: <AddIcon />,
      path: '/invoices/new',
      color: '#4CAF50',
      isNew: true,
    },
    {
      id: 'manage-products',
      title: 'Products',
      icon: <InventoryIcon />,
      path: '/products',
      color: '#FF9800', 
    },
    {
      id: 'manage-parties',
      title: 'Parties',
      icon: <PeopleIcon />,
      path: '/parties',
      color: '#9C27B0',
    },
    {
      id: 'view-reports',
      title: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      color: '#F44336',
    },
  ];

  // Initialize dashboard layout with KPI cards and widgets
  const initializeDashboardLayout = useCallback(() => {
    // Initialize KPI cards with default order
    const defaultKPICards: KPICard[] = [
      {
        id: 'total-sales',
        title: 'Total Sales',
        value: stats?.totalSales || 0,
        subtitle: 'Revenue generated',
        icon: <MonetizationIcon fontSize="large" />,
        color: theme.palette.primary.main,
        trend: { value: stats?.monthlyGrowth || 12, label: 'from last month', isPositive: true },
        position: 0,
        enabled: true,
      },
      {
        id: 'total-invoices',
        title: 'Total Invoices',
        value: stats?.totalInvoices || 0,
        subtitle: 'Invoices created',
        icon: <ReceiptIcon fontSize="large" />,
        color: theme.palette.success.main,
        trend: { value: 5, label: 'this week', isPositive: true },
        position: 1,
        enabled: true,
      },
      {
        id: 'pending-payments',
        title: 'Pending Payments',
        value: stats?.pendingPayments || 0,
        subtitle: 'Awaiting payment',
        icon: <PendingIcon fontSize="large" />,
        color: theme.palette.warning.main,
        trend: { value: 0, label: 'Needs attention', isPositive: false },
        position: 2,
        enabled: true,
      },
      {
        id: 'active-parties',
        title: 'Active Parties',
        value: stats?.totalParties || 0,
        subtitle: 'Business partners',
        icon: <PeopleIcon fontSize="large" />,
        color: theme.palette.secondary.main,
        trend: { value: 0, label: 'Growing steadily', isPositive: true },
        position: 3,
        enabled: true,
      },
      {
        id: 'total-products',
        title: 'Total Products',
        value: stats?.totalProducts || 0,
        subtitle: 'Products in inventory',
        icon: <InventoryIcon fontSize="large" />,
        color: theme.palette.info.main,
        trend: { value: 0, label: 'Well stocked', isPositive: true },
        position: 4,
        enabled: true,
      },
      {
        id: 'conversion-rate',
        title: 'Conversion Rate',
        value: `${stats?.conversionRate || 3.2}%`,
        subtitle: 'Lead conversion',
        icon: <SpeedIcon fontSize="large" />,
        color: theme.palette.error.main,
        trend: { value: 2.1, label: 'improvement', isPositive: true },
        position: 5,
        enabled: true,
      },
      {
        id: 'monthly-growth',
        title: 'Monthly Growth',
        value: `+${stats?.monthlyGrowth?.toFixed(1) || 12.5}%`,
        subtitle: 'Growth rate',
        icon: <TrendingUpIcon fontSize="large" />,
        color: theme.palette.success.main,
        trend: { value: stats?.monthlyGrowth || 12.5, label: stats && stats.monthlyGrowth > 10 ? "Excellent growth" : "Good growth", isPositive: true },
        position: 6,
        enabled: true,
      },
      {
        id: 'avg-order-value',
        title: 'Avg Order Value',
        value: stats ? (stats.totalSales / Math.max(stats.totalInvoices, 1)) : 0,
        subtitle: 'Per invoice',
        icon: <MonetizationIcon fontSize="large" />,
        color: theme.palette.primary.main,
        trend: { value: 0, label: 'Per invoice', isPositive: true },
        position: 7,
        enabled: true,
      },
    ];

    setKpiCards(defaultKPICards);
    setDefaultKPICards(defaultKPICards);

    // Initialize dashboard widgets
    const defaultWidgets: DashboardWidget[] = [
      {
        id: 'kpi-section',
        type: 'kpi',
        title: 'Key Performance Indicators',
        enabled: true,
        position: 0,
        size: 'extra-large',
      },
      {
        id: 'recent-invoices',
        type: 'invoices',
        title: 'Recent Invoices',
        enabled: true,
        position: 1,
        size: 'extra-large',
      },
      {
        id: 'revenue-chart',
        type: 'chart',
        title: 'Revenue Trend',
        enabled: true,
        position: 2,
        size: 'large',
      },
      {
        id: 'notifications-panel',
        type: 'notifications',
        title: 'Notifications',
        enabled: true,
        position: 3,
        size: 'medium',
      },
      {
        id: 'quick-actions-panel',
        type: 'quick-actions',
        title: 'Quick Actions',
        enabled: true,
        position: 4,
        size: 'medium',
      },
    ];

    setDashboardWidgets(defaultWidgets);
  }, [stats, theme]);

  // Enhanced Drag & Drop Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // Optional: Add visual feedback during drag
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      // Handle KPI card reordering
      if (activeId.toString().includes('kpi-') || kpiCards.some(card => card.id === activeId)) {
        setKpiCards((items) => {
          const oldIndex = items.findIndex((item) => item.id === activeId);
          const newIndex = items.findIndex((item) => item.id === overId);

          if (oldIndex === -1 || newIndex === -1) return items;

          const newItems = [...items];
          const [reorderedItem] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, reorderedItem);

          // Update positions
          return newItems.map((item, index) => ({
            ...item,
            position: index,
          }));
        });
      }

      // Handle dashboard widget reordering
      else if (dashboardWidgets.some(widget => widget.id === activeId)) {
        setDashboardWidgets((items) => {
          const oldIndex = items.findIndex((item) => item.id === activeId);
          const newIndex = items.findIndex((item) => item.id === overId);

          if (oldIndex === -1 || newIndex === -1) return items;

          const newItems = [...items];
          const [reorderedItem] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, reorderedItem);

          // Update positions
          return newItems.map((item, index) => ({
            ...item,
            position: index,
          }));
        });
      }
    }
  }, [kpiCards, dashboardWidgets]);

  // Toggle drag mode
  const toggleDragMode = useCallback(() => {
    setIsDragMode(prev => !prev);
  }, []);

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setDashboardWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
  }, []);

  // Toggle KPI card visibility
  const toggleKPICardVisibility = useCallback((cardId: string) => {
    setKpiCards(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, enabled: !card.enabled }
          : card
      )
    );
  }, []);

  // Reset cards to default
  const resetCardsToDefault = useCallback(() => {
    setKpiCards(defaultKPICards.map(card => ({ ...card, enabled: true })));
  }, [defaultKPICards]);

  // Enable all cards
  const enableAllCards = useCallback(() => {
    setKpiCards(prev => prev.map(card => ({ ...card, enabled: true })));
  }, []);

  // Disable all cards
  const disableAllCards = useCallback(() => {
    setKpiCards(prev => prev.map(card => ({ ...card, enabled: false })));
  }, []);

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize dashboard layout after stats are loaded
  useEffect(() => {
    if (stats) {
      initializeDashboardLayout();
    }
  }, [stats, theme, initializeDashboardLayout]);

  // Update invoice status summary and quick stats when invoices change
  useEffect(() => {
    if (recentInvoices.length > 0) {
      fetchInvoiceStatusSummary();
      fetchQuickStats();
    }
  }, [recentInvoices]);

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardMetrics(), 
        fetchNotifications(),
        fetchRecentInvoices(),
        fetchInvoiceStatusSummary(),
        fetchQuickStats(),
        fetchExpenseOverview()
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardMetrics(), 
        fetchNotifications(),
        fetchRecentInvoices(),
        fetchInvoiceStatusSummary(),
        fetchQuickStats(),
        fetchExpenseOverview()
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  async function fetchDashboardMetrics() {
    try {
      const res = await fetch('/api/admin/dashboard?period=12months&section=overview');
      const json = await res.json();

      console.log('Dashboard API Response:', json); // Debug log

      if (!json.success && !json.fallback) {
        throw new Error(json.error || 'API returned unsuccessful response');
      }

      // Extract data from the correct API structure
      const overview = json?.data?.overview || {};
      const metrics = overview?.metrics || {};
      const charts = overview?.charts || {};

      // Map API structure to frontend expectations
      const sales = metrics?.revenue?.total ?? 0;
      const invoiceCount = metrics?.invoices?.total ?? 0;
      const pending = metrics?.invoices?.pending ?? 0;
      const parties = metrics?.customers?.total ?? 0;
      const products = metrics?.products?.total ?? 0;
      const growth = metrics?.revenue?.growth ?? 0;
      const conversionRate = metrics?.performance?.conversionRate ?? 0;

      setStats({
        totalSales: Number(sales) || 0,
        totalInvoices: Number(invoiceCount) || 0,
        pendingPayments: Number(pending) || 0,
        totalParties: Number(parties) || 0,
        totalProducts: Number(products) || 0,
        totalOrders: Number(invoiceCount) || 0, // Using invoices as orders for now
        monthlyGrowth: Number(growth) || 0,
        conversionRate: Number(conversionRate) || 0
      });

      // Extract sales trend data for chart
      const salesTrend = charts?.salesTrend || charts?.revenueTrend || [];
      const monthly = salesTrend.slice(-12).map((d: any) => Math.round(d.value || d.amount || 0));
      setRevenueLast12(monthly.length > 0 ? monthly : Array.from({ length: 12 }, (_, i) => 120000 + (i % 3) * 15000));
    } catch (err) {
      // Graceful fallback with synthetic demo data so the dashboard always renders
      console.error('Failed to load dashboard metrics', err);
      setStats({ 
        totalSales: 245000, // Demo data instead of 0
        totalInvoices: 324, 
        pendingPayments: 45000, 
        totalParties: 118,
        totalProducts: 245,
        totalOrders: 324,
        monthlyGrowth: 12.5,
        conversionRate: 3.2
      });
      setRevenueLast12(Array.from({ length: 12 }, (_, i) => 120000 + (i % 3) * 15000));
    }
  }

  async function fetchNotifications() {
    try {
      // Mock data for now - replace with actual API call
      const mockNotifications: NotificationItem[] = [
        {
          id: '1',
          type: 'payment_due',
          title: 'Payment Overdue',
          message: 'Invoice #DC-2024-001 payment is 5 days overdue',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: '3 products are running low on stock',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          read: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'new_order',
          title: 'New Order Received',
          message: 'Order #ORD-2024-046 received from ABC Corp',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          read: true,
          priority: 'low'
        },
        {
          id: '4',
          type: 'achievement',
          title: 'Monthly Target Achieved',
          message: 'Congratulations! You have achieved 105% of monthly sales target',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: false,
          priority: 'low'
        }
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setNotifications([]);
    }
  }

  async function fetchRecentInvoices() {
    try {
      setInvoicesLoading(true);
      const res = await fetch('/api/invoices/recent?limit=10&days=90');
      const json = await res.json();
      
      if (json.success && json.data) {
        setRecentInvoices(json.data.slice(0, 10));
      } else {
        console.warn('Failed to fetch invoices:', json.error);
        setRecentInvoices([]);
      }
    } catch (err) {
      console.error('Error fetching recent invoices:', err);
      setRecentInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  }

  async function fetchInvoiceStatusSummary() {
    try {
      const paid = recentInvoices.filter(inv => inv.status?.toLowerCase() === 'paid').length;
      const pending = recentInvoices.filter(inv => inv.status?.toLowerCase() === 'pending').length;
      const overdue = recentInvoices.filter(inv => inv.status?.toLowerCase() === 'overdue').length;
      setInvoiceStatusSummary({ paid, pending, overdue });
    } catch (err) {
      console.error('Error calculating invoice status summary:', err);
    }
  }

  async function fetchQuickStats() {
    try {
      const customers = recentInvoices.reduce((acc: any, inv) => {
        const existing = acc.find((c: any) => c.name === inv.customer);
        if (existing) {
          existing.amount += inv.amount || 0;
          existing.count += 1;
        } else {
          acc.push({ name: inv.customer, amount: inv.amount || 0, count: 1 });
        }
        return acc;
      }, [])
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 5);
      
      setTopCustomers(customers);

      const totalPaid = recentInvoices
        .filter(inv => inv.status?.toLowerCase() === 'paid')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
      
      const totalAmount = recentInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const rate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
      setCollectionRate(rate);

      setInventoryValue(stats?.totalProducts || 0 * 1200);
    } catch (err) {
      console.error('Error fetching quick stats:', err);
    }
  }

  async function fetchExpenseOverview() {
    try {
      const now = new Date();
      const expenses: number[] = [];
      for (let i = 11; i >= 0; i--) {
        expenses.push(Math.floor(Math.random() * 50000) + 10000);
      }
      setMonthlyExpenses(expenses);

      const categories = [
        { name: 'Utilities', amount: 8500, percentage: 15 },
        { name: 'Salaries', amount: 35000, percentage: 60 },
        { name: 'Marketing', amount: 10000, percentage: 17 },
        { name: 'Other', amount: 3500, percentage: 8 },
      ];
      setExpenseCategories(categories);
    } catch (err) {
      console.error('Error fetching expense overview:', err);
    }
  }

  const monthLabels = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('default', { month: 'short' }));
    }
    return labels;
  }, []);

  const revenueData = useMemo(
    () => ({
      labels: monthLabels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueLast12,
          backgroundColor: 'rgba(25, 118, 210, 0.25)',
          borderColor: 'rgba(25, 118, 210, 1)',
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [monthLabels, revenueLast12]
  );

  const invoiceStatusData = useMemo(
    () => ({
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [
        {
          data: [invoiceStatusSummary.paid, invoiceStatusSummary.pending, invoiceStatusSummary.overdue],
          backgroundColor: ['rgba(76, 175, 80, 0.7)', 'rgba(255, 193, 7, 0.7)', 'rgba(244, 67, 54, 0.7)'],
          borderColor: ['rgba(76, 175, 80, 1)', 'rgba(255, 193, 7, 1)', 'rgba(244, 67, 54, 1)'],
          borderWidth: 2,
        },
      ],
    }),
    [invoiceStatusSummary]
  );

  const expenseData = useMemo(
    () => ({
      labels: monthLabels,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: monthlyExpenses,
          backgroundColor: 'rgba(244, 67, 54, 0.25)',
          borderColor: 'rgba(244, 67, 54, 1)',
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [monthLabels, monthlyExpenses]
  );

  const expenseCategoryData = useMemo(
    () => ({
      labels: expenseCategories.map(cat => cat.name),
      datasets: [
        {
          data: expenseCategories.map(cat => cat.amount),
          backgroundColor: ['rgba(33, 150, 243, 0.7)', 'rgba(76, 175, 80, 0.7)', 'rgba(255, 193, 7, 0.7)', 'rgba(156, 39, 176, 0.7)'],
          borderColor: ['rgba(33, 150, 243, 1)', 'rgba(76, 175, 80, 1)', 'rgba(255, 193, 7, 1)', 'rgba(156, 39, 176, 1)'],
          borderWidth: 2,
        },
      ],
    }),
    [expenseCategories]
  );

  // Utility functions
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_due': return <ErrorIcon />;
      case 'low_stock': return <WarningIcon />;
      case 'new_order': return <ShoppingCartIcon />;
      case 'system': return <InfoIcon />;
      case 'achievement': return <CheckCircleIcon />;
      default: return <InfoIcon />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <VisuallyEnhancedDashboardLayout 
        title="Admin Dashboard" 
        pageType="dashboard"
        enableVisualEffects={true}
        enableParticles={true}
      >

   {/* Action Shortcuts */}
      <Fade in={!loading} timeout={800}>
        <Card sx={{ mb: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>Quick Actions</Typography>
              <Typography variant="body2" color="text.secondary">
                Fast access to common dashboard tasks
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/invoices/new')}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#4CAF50',
                    borderColor: '#4CAF50',
                    '&:hover': {
                      backgroundColor: alpha('#4CAF50', 0.1),
                      borderColor: '#4CAF50',
                    }
                  }}
                >
                  New Invoice
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<InventoryIcon />}
                  onClick={() => router.push('/products')}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#FF9800',
                    borderColor: '#FF9800',
                    '&:hover': {
                      backgroundColor: alpha('#FF9800', 0.1),
                      borderColor: '#FF9800',
                    }
                  }}
                >
                  Manage Inventory
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<PeopleIcon />}
                  onClick={() => router.push('/parties')}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#9C27B0',
                    borderColor: '#9C27B0',
                    '&:hover': {
                      backgroundColor: alpha('#9C27B0', 0.1),
                      borderColor: '#9C27B0',
                    }
                  }}
                >
                  Manage Parties
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<AssessmentIcon />}
                  onClick={() => router.push('/reports')}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#F44336',
                    borderColor: '#F44336',
                    '&:hover': {
                      backgroundColor: alpha('#F44336', 0.1),
                      borderColor: '#F44336',
                    }
                  }}
                >
                  View Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<SettingsIcon />}
                  onClick={() => router.push('/admin/settings')}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: theme.palette.info.main,
                    borderColor: theme.palette.info.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      borderColor: theme.palette.info.main,
                    }
                  }}
                >
                  Settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

        {/* Enhanced Dashboard Controls */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, mt:5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
        
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Admin Dashboard 🚀
            </Typography> 
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDragMode}
                  onChange={toggleDragMode}
                  icon={<LockIcon fontSize="small" />}
                  checkedIcon={<LockOpenIcon fontSize="small" />}
                  sx={{
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DragIndicatorIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    {isDragMode ? 'Edit Mode' : 'View Mode'}
                  </Typography>
                </Stack>
              }
              sx={{ 
                mr: 2,
                '& .MuiFormControlLabel-label': {
                  color: 'white',
                }
              }}
            />
            <Button 
              onClick={refreshAll} 
              startIcon={<RefreshIcon />} 
              variant="contained"
              disabled={refreshing}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => setShowCardManager(true)} 
              startIcon={<SettingsIcon />} 
              variant="contained"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Manage Cards
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

     

      {/* Enhanced Drag & Drop KPI Cards - Horizontal Scrollable */}
      <SortableContext items={kpiCards.map(card => card.id)} strategy={rectSortingStrategy}>
        <Paper
          sx={{
            mb: 4,
            p: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.divider, 0.1),
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.3),
                borderRadius: '3px',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}
          >
            {kpiCards
              .sort((a, b) => a.position - b.position)
              .map((card) => (
                <SortableKPICard key={card.id} card={card} isDragMode={isDragMode} loading={loading} theme={theme} cardWidth={cardWidth} />
              ))}
          </Box>
        </Paper>
      </SortableContext>

      {/* Drag Mode Helper */}
      {isDragMode && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: theme.palette.info.main,
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>Drag & Drop Mode Active</AlertTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2">
              Drag KPI cards to reorder them. Switch off edit mode when done.
            </Typography>
            <DragIndicatorIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
          </Stack>
        </Alert>
      )}

      <Box sx={{ display: 'none' }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={300}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Total Sales
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {stats ? stats.totalSales.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : <Skeleton width={120} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                    }}
                  >
                    <MonetizationIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon fontSize="small" color="success" />
                  <Chip 
                    label={`+${stats?.monthlyGrowth || 12}% from last month`} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={400}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.2)}`,
                  borderColor: theme.palette.success.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Total Invoices
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {stats ? stats.totalInvoices.toLocaleString() : <Skeleton width={60} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.success.main,
                      color: 'white',
                    }}
                  >
                    <ReceiptIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon fontSize="small" color="success" />
                  <Chip label="+5% this week" size="small" color="success" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={500}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.2)}`,
                  borderColor: theme.palette.warning.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Pending Payments
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="warning.main">
                      {stats ? stats.pendingPayments.toLocaleString() : <Skeleton width={60} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.warning.main,
                      color: 'white',
                    }}
                  >
                    <PendingIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <WarningIcon fontSize="small" color="warning" />
                  <Chip label="Needs attention" size="small" color="warning" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={600}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.2)}`,
                  borderColor: theme.palette.secondary.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Active Parties
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="secondary.main">
                      {stats ? stats.totalParties.toLocaleString() : <Skeleton width={60} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.secondary.main,
                      color: 'white',
                    }}
                  >
                    <PeopleIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon fontSize="small" color="success" />
                  <Chip label="Growing steadily" size="small" color="secondary" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={700}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.info.main, 0.2)}`,
                  borderColor: theme.palette.info.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Total Products
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="info.main">
                      {stats ? stats.totalProducts.toLocaleString() : <Skeleton width={60} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.info.main,
                      color: 'white',
                    }}
                  >
                    <InventoryIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StoreIcon fontSize="small" color="info" />
                  <Chip label="Well stocked" size="small" color="info" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={800}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.error.main, 0.2)}`,
                  borderColor: theme.palette.error.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="error.main">
                      {stats ? `${stats.conversionRate}%` : <Skeleton width={60} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.error.main,
                      color: 'white',
                    }}
                  >
                    <SpeedIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AnalyticsIcon fontSize="small" color="error" />
                  <Chip label="Above average" size="small" color="error" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Additional Profit-Related KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={900}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.2)}`,
                  borderColor: theme.palette.success.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Monthly Growth
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      {stats ? `+${stats.monthlyGrowth.toFixed(1)}%` : <Skeleton width={80} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.success.main,
                      color: 'white',
                    }}
                  >
                    <TrendingUpIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon fontSize="small" color="success" />
                  <Chip 
                    label={stats?.monthlyGrowth > 10 ? "Excellent growth" : stats?.monthlyGrowth > 5 ? "Good growth" : "Steady growth"} 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={1000}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      Avg Order Value
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {stats ? (stats.totalSales / Math.max(stats.totalInvoices, 1)).toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : <Skeleton width={100} />}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                    }}
                  >
                    <MonetizationIcon fontSize="large" />
                  </Avatar>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AnalyticsIcon fontSize="small" color="primary" />
                  <Chip label="Per invoice" size="small" color="primary" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
      </Box>

      {/* Enhanced Charts + Activity + Notifications */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Fade in={!loading} timeout={600}>
            <Card sx={{ height: 400, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Revenue Trend</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly revenue performance over the last 12 months
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      size="small" 
                      icon={<TrendingUpIcon fontSize="small" />} 
                      label="Last 12 months" 
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      size="small" 
                      icon={<TimelineIcon fontSize="small" />} 
                      label="Growth +12%" 
                      color="success"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
                <Box sx={{ height: 'calc(100% - 80px)' }}>
                  <Line
                    data={revenueData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { display: false }, 
                        tooltip: { 
                          enabled: true,
                          backgroundColor: alpha(theme.palette.background.paper, 0.95),
                          titleColor: theme.palette.text.primary,
                          bodyColor: theme.palette.text.secondary,
                          borderColor: theme.palette.primary.main,
                          borderWidth: 1,
                          cornerRadius: 8,
                          displayColors: false,
                        } 
                      },
                      scales: { 
                        y: { 
                          ticks: { 
                            callback: (v) => `₹${Number(v).toLocaleString()}`,
                            color: theme.palette.text.secondary,
                            font: { size: 12 }
                          },
                          grid: {
                            color: alpha(theme.palette.divider, 0.1),
                          },
                          border: { display: false }
                        },
                        x: {
                          ticks: {
                            color: theme.palette.text.secondary,
                            font: { size: 12 }
                          },
                          grid: {
                            display: false,
                          },
                          border: { display: false }
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Fade in={!loading} timeout={600}>
            <Card sx={{ height: 400, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Invoice Status Summary</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Distribution of invoices by status
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {invoiceStatusSummary.paid + invoiceStatusSummary.pending + invoiceStatusSummary.overdue > 0 ? (
                    <Doughnut
                      data={invoiceStatusData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                          legend: { 
                            position: 'bottom' as const,
                            labels: {
                              color: theme.palette.text.secondary,
                              font: { size: 12 },
                              usePointStyle: true,
                              padding: 15
                            }
                          }, 
                          tooltip: { 
                            enabled: true,
                            backgroundColor: alpha(theme.palette.background.paper, 0.95),
                            titleColor: theme.palette.text.primary,
                            bodyColor: theme.palette.text.secondary,
                            borderColor: theme.palette.primary.main,
                            borderWidth: 1,
                            cornerRadius: 8,
                          } 
                        },
                      }}
                    />
                  ) : (
                    <Typography color="text.secondary">No data available</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Quick Stats and Expense Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Fade in={!loading} timeout={700}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Quick Stats</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top 5 customers by revenue
                  </Typography>
                </Box>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      Total Inventory Value
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      ₹{(stats?.totalProducts || 0 * 1200).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      Payment Collection Rate
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        {collectionRate}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={collectionRate} 
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Top Customers</Typography>
                <List sx={{ p: 0 }}>
                  {topCustomers.map((customer: any, idx) => (
                    <ListItem key={idx} sx={{ py: 1, px: 0, borderBottom: idx < topCustomers.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none' }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: alpha(theme.palette.primary.main, 0.2), color: 'primary.main', fontSize: '14px', fontWeight: 700 }}>
                          {idx + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" fontWeight={600}>{customer.name}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">₹{customer.amount.toLocaleString('en-IN')}</Typography>}
                      />
                      <ListItemSecondaryAction>
                        <Chip label={`${customer.count} invoice${customer.count !== 1 ? 's' : ''}`} size="small" variant="outlined" />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={6}>
          <Fade in={!loading} timeout={700}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Expense Overview</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly expenses breakdown
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {expenseCategories.map((category: any, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.divider, 0.1), borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          ₹{(category.amount).toLocaleString('en-IN')}
                        </Typography>
                        <Chip 
                          label={`${category.percentage}%`}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ height: 200 }}>
                  <Doughnut
                    data={expenseCategoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'bottom' as const,
                          labels: {
                            color: theme.palette.text.secondary,
                            font: { size: 11 },
                            usePointStyle: true,
                            padding: 10
                          }
                        }, 
                        tooltip: { 
                          enabled: true,
                          backgroundColor: alpha(theme.palette.background.paper, 0.95),
                          titleColor: theme.palette.text.primary,
                          bodyColor: theme.palette.text.secondary,
                          borderColor: theme.palette.primary.main,
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                            label: (context: any) => {
                              return `₹${context.parsed.toLocaleString('en-IN')}`;
                            }
                          }
                        } 
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

   

      {/* Recent Invoices Section */}
      <Fade in={!invoicesLoading} timeout={600}>
        <Paper sx={{ mb: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Recent Invoices</Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 10 invoices from the past 90 days
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={fetchRecentInvoices}
                startIcon={<RefreshIcon />}
                disabled={invoicesLoading}
              >
                Refresh
              </Button>
            </Stack>

            {invoicesLoading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : recentInvoices.length === 0 ? (
              <Alert severity="info">No invoices found in the last 90 days</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id} hover sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {invoice.invoiceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {invoice.customer}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ₹{Number(invoice.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(invoice.date).toLocaleDateString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            size="small"
                            color={
                              invoice.status?.toLowerCase() === 'paid' ? 'success' :
                              invoice.status?.toLowerCase() === 'pending' ? 'warning' :
                              invoice.status?.toLowerCase() === 'overdue' ? 'error' :
                              'default'
                            }
                            variant={
                              invoice.status?.toLowerCase() === 'paid' ? 'filled' :
                              invoice.status?.toLowerCase() === 'pending' ? 'filled' :
                              invoice.status?.toLowerCase() === 'overdue' ? 'filled' :
                              'outlined'
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Invoice">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Paper>
      </Fade>

      {/* Card Manager Dialog */}
      <Dialog 
        open={showCardManager} 
        onClose={() => setShowCardManager(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
          Manage Dashboard Cards
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3}>
            {/* Card Width Control */}
            <FormControl fullWidth>
              <FormLabel sx={{ fontWeight: 700, mb: 2 }}>
                Card Width: {cardWidth}px
              </FormLabel>
              <Slider
                value={cardWidth}
                onChange={(e, newValue) => setCardWidth(newValue as number)}
                min={120}
                max={400}
                step={20}
                marks={[
                  { value: 120, label: '120px' },
                  { value: 180, label: '180px' },
                  { value: 240, label: '240px' },
                  { value: 320, label: '320px' },
                  { value: 400, label: '400px' }
                ]}
                valueLabelDisplay="auto"
                sx={{ mt: 2 }}
              />
            </FormControl>

            <Divider />

            {/* Quick Actions */}
            <Stack direction="row" spacing={1}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={enableAllCards}
                startIcon={<CheckCircleIcon />}
              >
                Show All
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={disableAllCards}
                startIcon={<CloseIcon />}
              >
                Hide All
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                onClick={resetCardsToDefault}
                startIcon={<RestartAltIcon />}
              >
                Reset
              </Button>
            </Stack>

            <Divider />

            {/* Card Checkboxes */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 700, mb: 2 }}>
                Visible Cards
              </FormLabel>
              <FormGroup>
                {kpiCards
                  .sort((a, b) => a.position - b.position)
                  .map((card) => (
                    <FormControlLabel
                      key={card.id}
                      control={
                        <Checkbox 
                          checked={card.enabled}
                          onChange={() => toggleKPICardVisibility(card.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">{card.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {card.subtitle}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        py: 1,
                        px: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    />
                  ))}
              </FormGroup>
            </FormControl>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowCardManager(false)}
            variant="contained"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
      </VisuallyEnhancedDashboardLayout>

      {/* Drag Overlay for enhanced visual feedback */}
      <DragOverlay>
        {activeId ? (
          <Card
            sx={{
              width: 300,
              height: 150,
              background: theme.palette.background.paper,
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 3,
              opacity: 0.9,
              transform: 'rotate(5deg)',
              boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.4)}`,
              cursor: 'grabbing',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                  }}
                >
                  <DragIndicatorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    Moving Card...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drop to reposition
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
