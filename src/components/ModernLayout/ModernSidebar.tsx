"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Badge,
  Divider,
  Typography,
  IconButton,
  Avatar,
  Chip,
  useMediaQuery,
  Paper,
  alpha,
  InputBase,
  Fade,
  Stack,
} from '@mui/material';

// Icons
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  ExpandLess,
  ExpandMore,
  Category as CategoryIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Payments as PaymentsIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Backup as BackupIcon,
  CloudDownload as CloudDownloadIcon,
  Restore as RestoreIcon,
  Analytics as AnalyticsIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  AccountBox as AccountBoxIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  FiberManualRecord as FiberManualRecordIcon,
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import Link from "next/link";

// Constants
const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 72;
const ANIMATION_DURATION = 300;

// Enhanced Types
interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number | null;
  permission?: string;
  children?: NavItem[];
  isNew?: boolean;
  isDisabled?: boolean;
  description?: string;
  keywords?: string[];
  category?: 'primary' | 'secondary' | 'admin';
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  isCollapsible?: boolean;
  priority?: number;
  icon?: React.ReactNode;
  color?: string;
}

interface ModernSidebarProps {
  onToggle?: () => void;
  isOpen?: boolean;
  isMini?: boolean;
  onMobileClose?: () => void;
  userAvatar?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  isLoading?: boolean;
  customSections?: NavSection[];
  showSearch?: boolean;
  showUserProfile?: boolean;
  darkMode?: boolean;
  onThemeToggle?: () => void;
}

// Enhanced Modern Navigation Structure
const modernNavigationSections: NavSection[] = [
  {
    id: 'main',
    title: 'Main',
    color: '#3b82f6',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/admin/dashboard',
        icon: <DashboardIcon />,
        // description: 'Main dashboard with analytics overview',
        keywords: ['dashboard', 'home', 'overview', 'analytics', 'main'],
        category: 'primary',
      },
      
    ],
  },
  {
    id: 'sales',
    title: 'Sales & Billing',
    color: '#10b981',
    items: [
      {
        id: 'invoices',
        title: 'Invoices',
        path: '/invoices',
        icon: <ReceiptIcon />,
        badge: 3,
        // description: 'Manage invoices and billing',
        keywords: ['invoices', 'billing', 'payments', 'sales'],
        category: 'primary',
        children: [
          {
            id: 'invoices-new',
            title: 'Create Invoice',
            path: '/invoices/new',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Create new invoice',
            keywords: ['create', 'new', 'invoice'],
            category: 'secondary',
          },
          {
            id: 'invoices-list',
            title: 'All Invoices',
            path: '/invoices',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View and manage all invoices',
            keywords: ['all', 'list', 'invoices'],
            category: 'secondary',
          },
          {
            id: 'invoices-regular',
            title: 'Regular Invoices',
            path: '/invoices/regular',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Standard invoice management',
            keywords: ['regular', 'standard', 'invoices'],
            category: 'secondary',
          },
           
        ],
      },
      // {
      //   id: 'orders',
      //   title: 'Orders',
      //   path: '/orders',
      //   icon: <ShoppingCartIcon />,
      //   badge: 5,
      //   // description: 'Order management and tracking',
      //   keywords: ['orders', 'sales', 'customers', 'tracking'],
      //   category: 'primary',
      //   children: [
      //     {
      //       id: 'orders-new',
      //       title: 'New Order',
      //       path: '/orders/new',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'Create new order',
      //       keywords: ['new', 'create', 'order'],
      //       category: 'secondary',
      //     },
      //     {
      //       id: 'orders-list',
      //       title: 'All Orders',
      //       path: '/orders',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'View and manage all orders',
      //       keywords: ['all', 'list', 'orders'],
      //       category: 'secondary',
      //     },
      //     {
      //       id: 'orders-pending',
      //       title: 'Pending Orders',
      //       path: '/orders/pending',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'Orders awaiting processing',
      //       keywords: ['pending', 'processing', 'queue'],
      //       category: 'secondary',
      //     },
      //     {
      //       id: 'orders-completed',
      //       title: 'Completed Orders',
      //       path: '/orders/completed',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'Successfully completed orders',
      //       keywords: ['completed', 'finished', 'delivered'],
      //       category: 'secondary',
      //     },
      //   ],
      // },
      {
        id: 'payments',
        title: 'Payments',
        path: '/accounting',
        icon: <PaymentsIcon />,
        // description: 'Payment tracking and management',
        keywords: ['payments', 'transactions', 'money', 'finance'],
        category: 'primary',
        children: [
          {
            id: 'payments-received',
            title: 'View',
            path: '/accounting',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Track received payments',
            keywords: ['received', 'income', 'credits'],
            category: 'secondary',
          },
          
        ],
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory & Products',
    color: '#f59e0b',
    items: [
      {
        id: 'products',
        title: 'Products',
        path: '/products',
        icon: <InventoryIcon />,
        // description: 'Product catalog and inventory management',
        keywords: ['products', 'catalog', 'inventory', 'items'],
        category: 'primary',
        children: [
          {
            id: 'products-list',
            title: 'All Products',
            path: '/products',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View all products in catalog',
            keywords: ['all', 'products', 'catalog', 'list'],
            category: 'secondary',
          },
          {
            id: 'products-new',
            title: 'Add Product',
            path: '/products/new',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Add new product to catalog',
            keywords: ['add', 'new', 'product', 'create'],
            category: 'secondary',
          },
          {
            id: 'products-management',
            title: 'Manage Products',
            path: '/products/management',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Edit and manage existing products',
            keywords: ['manage', 'edit', 'products', 'update'],
            category: 'secondary',
          },
          // {
          //   id: 'products-import',
          //   title: 'Import Products',
          //   path: '/products/import',
          //   icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Bulk import products from file',
          //   keywords: ['import', 'upload', 'bulk', 'csv', 'excel'],
          //   category: 'secondary',
          // },
           
        ],
      },
      {
        id: 'categories',
        title: 'Categories',
        path: '/categories',
        icon: <CategoryIcon />,
        // description: 'Product categories and classification',
        keywords: ['categories', 'classification', 'groups', 'types'],
        category: 'primary',
        children: [
          {
            id: 'categories-list',
            title: 'All Categories',
            path: '/categories',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View all product categories',
            keywords: ['all', 'categories', 'list'],
            category: 'secondary',
          },
          {
            id: 'categories-new',
            title: 'Add Category',
            path: '/categories/new',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Create new product category',
            keywords: ['add', 'new', 'category'],
            category: 'secondary',
          },
        ],
      },
      {
        id: 'stock-management',
        title: 'Stock Control',
        path: '/stock-management',
        icon: <StoreIcon />,
        // description: 'Advanced inventory stock control',
        keywords: ['stock', 'inventory', 'warehouse', 'control'],
        category: 'primary',
        children: [
          {
            id: 'stock-levels',
            title: 'Stock Levels',
            path: '/stock-management/levels',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Current stock level overview',
            keywords: ['stock', 'levels', 'current', 'overview'],
            category: 'secondary',
          },
          {
            id: 'stock-movements',
            title: 'Stock Movements',
            path: '/stock-management/movements',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Track stock in/out movements',
            keywords: ['movements', 'in', 'out', 'tracking'],
            category: 'secondary',
          },
          {
            id: 'stock-adjustments',
            title: 'Stock Adjustments',
            path: '/stock-management/adjustments',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Manual stock adjustments',
            keywords: ['adjustments', 'manual', 'corrections'],
            category: 'secondary',
          },
        ],
      },
       
    ],
  },
  {
    id: 'purchasing',
    title: 'Purchasing & Procurement',
    color: '#8b5cf6',
    items: [
      // {
      //   id: 'purchases',
      //   title: 'Purchase Orders',
      //   path: '/purchases',
      //   icon: <LocalShippingIcon />,
        // description: 'Purchase order creation and management',
      //   keywords: ['purchases', 'orders', 'suppliers', 'procurement'],
      //   category: 'primary',
      //   children: [
      //     {
      //       id: 'purchases-list',
      //       title: 'All Purchase Orders',
      //       path: '/purchases',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View all purchase orders',
      //       keywords: ['all', 'purchase', 'orders', 'list'],
      //       category: 'secondary',
      //     },
      //     {
      //       id: 'purchases-new',
      //       title: 'New Purchase Order',
      //       path: '/purchases/new',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Create new purchase order',
      //       keywords: ['new', 'create', 'purchase', 'order'],
      //       category: 'secondary',
      //     },
      //     {
      //       id: 'purchases-pending',
      //       title: 'Pending Orders',
      //       path: '/purchases/pending',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Orders awaiting delivery',
      //       keywords: ['pending', 'awaiting', 'delivery'],
      //       category: 'secondary',
      //     },
      //     {
      //       id: 'purchases-received',
      //       title: 'Received Orders',
      //       path: '/purchases/received',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Completed and received orders',
      //       keywords: ['received', 'completed', 'delivered'],
      //       category: 'secondary',
      //     },
      //   ],
      // },
      {
        id: 'purchase-invoices',
        title: 'Purchase Invoices',
        path: '/inventory/purchase-invoices',
        icon: <AssignmentIcon />,
        // description: 'Supplier invoice management',
        keywords: ['purchase', 'invoices', 'bills', 'supplier'],
        category: 'primary',
        children: [
          {
            id: 'purchase-invoices-list',
            title: 'All Purchase Invoices',
            path: '/inventory/purchase-invoices',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View all purchase invoices',
            keywords: ['all', 'purchase', 'invoices'],
            category: 'secondary',
          },
          {
            id: 'purchase-invoices-new',
            title: 'Record Invoice',
            path: '/inventory/purchase-invoices/new',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Record new purchase invoice',
            keywords: ['new', 'record', 'invoice'],
            category: 'secondary',
          },
          {
            id: 'purchase-invoices-pending',
            title: 'Pending Payments',
            path: '/inventory/purchase-invoices/pending',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Invoices awaiting payment',
            keywords: ['pending', 'payments', 'due'],
            category: 'secondary',
          },
        ],
      },
      {
        id: 'suppliers',
        title: 'Suppliers',
        path: '/suppliers',
        icon: <BusinessIcon />,
        // description: 'Supplier management and contacts',
        keywords: ['suppliers', 'vendors', 'contacts', 'management'],
        category: 'primary',
        children: [
          {
            id: 'suppliers-list',
            title: 'All Suppliers',
            path: '/suppliers',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View all suppliers',
            keywords: ['all', 'suppliers', 'list'],
            category: 'secondary',
          },
          {
            id: 'suppliers-new',
            title: 'Add Supplier',
            path: '/suppliers/new',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Add new supplier',
            keywords: ['add', 'new', 'supplier'],
            category: 'secondary',
          },
        ],
      },
    ],
  },
  {
    id: 'customers',
    title: 'Customers & Parties',
    color: '#06b6d4',
    items: [
      {
        id: 'parties',
        title: 'Parties',
        path: '/parties',
        icon: <PeopleIcon />,
        // description: 'Customer and vendor relationship management',
        keywords: ['parties', 'customers', 'vendors', 'contacts'],
        category: 'primary',
        children: [
          {
            id: 'parties-list',
            title: 'All Parties',
            path: '/parties',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View all customers and vendors',
            keywords: ['all', 'parties', 'customers', 'vendors', 'list'],
            category: 'secondary',
          },
          {
            id: 'parties-new',
            title: 'Add Party',
            path: '/parties/new',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Add new customer or vendor',
            keywords: ['add', 'new', 'party', 'customer', 'vendor'],
            category: 'secondary',
          },
          {
            id: 'parties-customers',
            title: 'Customers Only',
            path: '/parties/customers',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View customers only',
            keywords: ['customers', 'clients', 'buyers'],
            category: 'secondary',
          },
          {
            id: 'parties-vendors',
            title: 'Vendors Only',
            path: '/parties/vendors',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'View vendors only',
            keywords: ['vendors', 'suppliers', 'sellers'],
            category: 'secondary',
          },
        ],
      },
       {
        id: 'accounting-overview',
        title: 'Accounting Dashboard',
        path: '/accounting',
        icon: <AccountBalanceIcon />,
        // description: 'Financial dashboard and overview',
        keywords: ['accounting', 'finance', 'overview', 'dashboard'],
        category: 'primary',
      },
     
      {
        id: 'ledger',
        title: 'Party Ledger',
        path: '/ledger',
        icon: <AccountBalanceIcon />,
        // description: 'Party account ledger and transactions',
        keywords: ['ledger', 'accounts', 'transactions', 'balance'],
        category: 'primary',
        children: [
          {
            id: 'ledger-receivables',
            title: 'Accounts',
            path: '/ledger/',
            icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
            // description: 'Outstanding customer payments',
            keywords: ['receivable', 'outstanding', 'due', 'customer'],
            category: 'secondary',
          },
           
        ],
      },
    ],
  },
  // {
  //   id: 'reports',
  //   title: 'Reports & Analytics',
  //   color: '#ef4444',
  //   items: [
      
  //     {
  //       id: 'sales-reports',
  //       title: 'Sales Reports',
  //       path: '/reports/sales',
  //       icon: <TrendingUpIcon />,
  //       // description: 'Comprehensive sales analysis and reports',
  //       keywords: ['sales', 'revenue', 'performance', 'analysis'],
  //       category: 'primary',
  //       children: [
  //         {
  //           id: 'sales-summary',
  //           title: 'Sales Summary',
  //           path: '/reports/sales/summary',
  //           icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
  //           // description: 'Overall sales performance summary',
  //           keywords: ['sales', 'summary', 'overview'],
  //           category: 'secondary',
  //         },
  //         {
  //           id: 'sales-by-period',
  //           title: 'Sales by Period',
  //           path: '/reports/sales/period',
  //           icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
  //           // description: 'Sales analysis by time periods',
  //           keywords: ['sales', 'period', 'time', 'trends'],
  //           category: 'secondary',
  //         },
  //         {
  //           id: 'sales-by-product',
  //           title: 'Sales by Product',
  //           path: '/reports/sales/products',
  //           icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
  //           // description: 'Product-wise sales performance',
  //           keywords: ['sales', 'products', 'performance'],
  //           category: 'secondary',
  //         },
  //         {
  //           id: 'sales-by-customer',
  //           title: 'Sales by Customer',
  //           path: '/reports/sales/customers',
  //           icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
  //           // description: 'Customer-wise sales analysis',
  //           keywords: ['sales', 'customers', 'analysis'],
  //           category: 'secondary',
  //         },
  //         {
  //           id: 'stock-levels',
  //           title: 'Stock Level Report',
  //           path: '/reports/inventory/stock-levels',
  //           icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
  //           // description: 'Current stock level analysis',
  //           keywords: ['stock', 'levels', 'current', 'inventory'],
  //           category: 'secondary',
  //         },
  //         {
  //           id: 'stock-movements',
  //           title: 'Stock Movement Report',
  //           path: '/reports/inventory/movements',
  //           icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
  //           // description: 'Stock in/out movement analysis',
  //           keywords: ['stock', 'movements', 'in', 'out'],
  //           category: 'secondary',
  //         },
  //         ],
  //     },
     
      
  //   ],
  // },
 
  {
    id: 'administration',
    title: 'Administration',
    color: '#6b7280',
    items: [
      // {
      //   id: 'user-management',
      //   title: 'User Management',
      //   path: '/admin/users',
      //   icon: <GroupIcon />,
      //   // description: 'Manage users and permissions',
      //   keywords: ['users', 'permissions', 'roles', 'access'],
      //   category: 'admin',
      //   children: [
      //     {
      //       id: 'users-list',
      //       title: 'All Users',
      //       path: '/admin/users',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'View and manage all users',
      //       keywords: ['users', 'list', 'manage'],
      //       category: 'admin',
      //     },
      //     {
      //       id: 'users-roles',
      //       title: 'Roles & Permissions',
      //       path: '/admin/users/roles',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'Manage user roles and permissions',
      //       keywords: ['roles', 'permissions', 'access'],
      //       category: 'admin',
      //     },
      //   ],
      // },
      // {
      //   id: 'backup',
      //   title: 'Data Management',
      //   path: '/admin/data',
      //   icon: <BackupIcon />,
      //   // description: 'Backup, restore and data management',
      //   keywords: ['backup', 'restore', 'data', 'export', 'import'],
      //   category: 'admin',
      //   children: [
      //     {
      //       id: 'backup-create',
      //       title: 'Create Backup',
      //       path: '/admin/data/backup',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'Create system backup',
      //       keywords: ['backup', 'create', 'export'],
      //       category: 'admin',
      //     },
      //     {
      //       id: 'backup-restore',
      //       title: 'Restore Data',
      //       path: '/admin/data/restore',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'Restore from backup',
      //       keywords: ['restore', 'import', 'recovery'],
      //       category: 'admin',
      //     },
      //     {
      //       id: 'data-export',
      //       title: 'Export Data',
      //       path: '/admin/data/export',
      //       icon: <FiberManualRecordIcon sx={{ fontSize: 8 }} />,
      //       // description: 'Export data to various formats',
      //       keywords: ['export', 'download', 'csv', 'excel'],
      //       category: 'admin',
      //     },
      //   ],
      // },
      
      {
        id: 'general-settings',
        title: 'General Settings',
        path: '/settings/',
        icon: <SettingsIcon  />,
        // description: 'Basic system configuration',
        keywords: ['general', 'basic', 'configuration'],
        category: 'admin',
      }, 
    ],
  }
];

export default function ModernSidebar({
  onToggle,
  isOpen = true,
  isMini = false,
  onMobileClose,
  userAvatar,
  userName = 'User',
  userRole = 'Admin',
  userEmail,
  isLoading = false,
  customSections,
  showSearch = true,
  showUserProfile = true,
  darkMode = false,
  onThemeToggle,
}: ModernSidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'sales']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState<NavSection[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Use custom sections if provided, otherwise use default
  const navigationSections = customSections || modernNavigationSections;

  // Filter sections based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSections(navigationSections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = navigationSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesKeywords = item.keywords?.some(keyword => 
          keyword.toLowerCase().includes(query)
        );
        const matchesDescription = item.description?.toLowerCase().includes(query);
        const matchesChildren = item.children?.some(child =>
          child.title.toLowerCase().includes(query) ||
          child.keywords?.some(keyword => keyword.toLowerCase().includes(query))
        );
        
        return matchesTitle || matchesKeywords || matchesDescription || matchesChildren;
      }),
    })).filter(section => section.items.length > 0);

    setFilteredSections(filtered);
  }, [searchQuery, navigationSections]);

  // Check if item is active
  const isActive = useCallback((path: string) => {
    if (path === '/dashboard' && pathname === '/') return true;
    return pathname === path || pathname.startsWith(path + '/');
  }, [pathname]);

  // Handle section toggle
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Handle navigation
  const handleNavigation = useCallback((path: string) => {
    router.push(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [router, isMobile, onMobileClose]);

  // Animation variants
  const sidebarVariants = {
    open: {
      width: DRAWER_WIDTH,
      transition: {
        duration: ANIMATION_DURATION / 1000,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    mini: {
      width: MINI_DRAWER_WIDTH,
      transition: {
        duration: ANIMATION_DURATION / 1000,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const contentVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1,
      },
    },
    mini: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Render navigation item
  const renderNavItem = (item: NavItem, level: number = 0) => {
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isHovered = hoveredItem === item.id;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip
            title={isMini && !isMobile ? item.description || item.title : ''}
            placement="right"
            arrow
          >
            <ListItemButton
              onClick={() => {
                if (hasChildren) {
                  toggleSection(item.id);
                } else {
                  handleNavigation(item.path);
                }
              }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              selected={active}
              disabled={item.isDisabled}
              sx={{
                minHeight: 48,
                pl: level === 0 ? 2 : 4,
                pr: 2,
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '0 2px 2px 0',
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: level === 0 ? 'translateX(4px)' : 'none',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active ? theme.palette.primary.main : 'inherit',
                  transition: 'color 0.2s ease',
                }}
              >
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  variant="dot"
                  invisible={!item.badge}
                >
                  {item.icon}
                </Badge>
              </ListItemIcon>

              <AnimatePresence>
                {(!isMini || isMobile) && (
                  <motion.div
                    initial="mini"
                    animate="open"
                    exit="mini"
                    variants={contentVariants}
                    style={{ flex: 1, overflow: 'hidden' }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: active ? 600 : 500,
                              fontSize: level === 0 ? '0.875rem' : '0.8125rem',
                              color: active ? theme.palette.primary.main : 'inherit',
                            }}
                          >
                            {item.title}
                          </Typography>
                          {item.isNew && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{
                                height: 16,
                                fontSize: '0.625rem',
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        level === 0 && item.description && !isMini ? (
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: '0.75rem',
                              mt: 0.5,
                              display: 'block',
                            }}
                          >
                            {item.description}
                          </Typography>
                        ) : null
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {hasChildren && (!isMini || isMobile) && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExpandMore sx={{ fontSize: 20 }} />
                </motion.div>
              )}

              {hasChildren && isMini && !isMobile && (
                <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Children */}
        {hasChildren && (!isMini || isMobile) && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // Render section
  const renderSection = (section: NavSection) => {
    const isExpanded = expandedSections.has(section.id);

    return (
      <Box key={section.id} sx={{ mb: 2 }}>
        {(!isMini || isMobile) && (
          <motion.div
            initial="mini"
            animate="open"
            variants={contentVariants}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                cursor: section.isCollapsible ? 'pointer' : 'default',
              }}
              onClick={() => section.isCollapsible && toggleSection(section.id)}
            >
              {section.icon && (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 1,
                    backgroundColor: section.color || theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    color: 'white',
                  }}
                >
                  {section.icon}
                </Box>
              )}
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                  letterSpacing: '0.1em',
                  flex: 1,
                }}
              >
                {section.title}
              </Typography>
              {section.isCollapsible && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExpandMore sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                </motion.div>
              )}
            </Box>
          </motion.div>
        )}

        <Collapse in={!section.isCollapsible || isExpanded} timeout="auto">
          <List component="div" disablePadding>
            {section.items.map(item => renderNavItem(item))}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <motion.div
      initial={false}
      animate={isMini && !isMobile ? "mini" : "open"}
      variants={sidebarVariants}
      style={{
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          minHeight: 64,
        }}
      >
        <AnimatePresence>
          {(!isMini || isMobile) && (
            <motion.div
              initial="mini"
              animate="open"
              exit="mini"
              variants={contentVariants}
              style={{ flex: 1 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.25rem',
                }}
              >
                MASTERMIND
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  display: 'block',
                  mt: -0.5,
                }}
              >
                Business Management
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Toggle Button */}
        <Tooltip title={isMini ? "Expand sidebar" : "Collapse sidebar"}>
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{
              ml: isMini && !isMobile ? 0 : 1,
              mr: 0.5,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        {/* Theme Toggle */}
        {onThemeToggle && (
          <Tooltip title="Toggle theme">
            <IconButton
              onClick={onThemeToggle}
              size="small"
              sx={{
                ml: 0.5,
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                },
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Search */}
      {showSearch && (!isMini || isMobile) && (
        <AnimatePresence>
          <motion.div
            initial="mini"
            animate="open"
            exit="mini"
            variants={contentVariants}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <SearchIcon
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: 20,
                    mr: 1,
                  }}
                />
                <InputBase
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    flex: 1,
                    fontSize: '0.875rem',
                    '& input': {
                      padding: '4px 0',
                    },
                  }}
                />
              </Paper>
            </Box>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation - Scrollable Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          scrollBehavior: 'smooth',
          // Enhanced scrollbar styling
          '&::-webkit-scrollbar': {
            width: isMini && !isMobile ? 2 : 6,
            transition: 'width 0.3s ease',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.background.default, 0.1),
            borderRadius: 3,
            margin: '8px 0',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.secondary, 0.3),
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.background.paper, 0.1)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.secondary, 0.5),
            },
          },
          '&::-webkit-scrollbar-corner': {
            backgroundColor: 'transparent',
          },
          // Firefox scrollbar
          scrollbarWidth: isMini && !isMobile ? 'thin' : 'auto',
          scrollbarColor: `${alpha(theme.palette.text.secondary, 0.3)} ${alpha(theme.palette.background.default, 0.1)}`,
          // Hover effect for better visibility
          '&:hover': {
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.4),
            },
          },
        }}
      >
        {filteredSections.map(renderSection)}
      </Box>

      {/* Enhanced User Profile */}
      {showUserProfile && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            mt: 'auto',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.05)} 0%, 
              ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(10px)',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <AnimatePresence>
            {(!isMini || isMobile) && (
              <motion.div
                initial="mini"
                animate="open"
                exit="mini"
                variants={contentVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                      ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }}
                  onClick={() => router.push('/profile')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                            border: `2px solid ${theme.palette.background.paper}`,
                          }}
                        />
                      }
                    >
                      <Avatar
                        src={userAvatar}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                          border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                        }}
                      >
                        {userName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: theme.palette.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 0.25,
                        }}
                      >
                        {userName}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={userRole}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                          }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                  {userEmail && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mt: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      {userEmail}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      mt: 1.5,
                      pt: 1,
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Tooltip title="Profile Settings">
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          '&:hover': { color: theme.palette.primary.main }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/profile');
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Settings">
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          '&:hover': { color: theme.palette.primary.main }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/settings');
                        }}
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.success.main,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        alignSelf: 'center',
                      }}
                    >
                      Online
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {isMini && !isMobile && (
            <Tooltip title={`${userName} (${userRole})`} placement="right">
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#4caf50',
                        border: `1px solid ${theme.palette.background.paper}`,
                      }}
                    />
                  }
                >
                  <Avatar
                    src={userAvatar}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}
                    onClick={() => router.push('/profile')}
                  >
                    {userName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Badge>
              </Box>
            </Tooltip>
          )}
        </Box>
      )}
    </motion.div>
  );
}

export { modernNavigationSections };
export type { NavItem, NavSection, ModernSidebarProps };