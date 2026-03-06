'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  InputBase,
  Chip,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemButton,
  Autocomplete,
  TextField,
  Popper,
  ClickAwayListener,
  Grow,
  MenuList,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  ButtonGroup,
  Fab,
  Slide,
  Collapse,
  Stack,
  AvatarGroup,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';

// Icons
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Help as HelpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon,
  ArrowDropDown as ArrowDropDownIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
  Palette as PaletteIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  GetApp as GetAppIcon,
  CloudUpload as CloudUploadIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Store as StoreIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
} from '@mui/icons-material';

import { useAuth } from '@/contexts/AuthContext';
import { handleLogout } from '@/utils/authRedirects';
import { partyService } from '@/services/partyService';
import { productService } from '@/services/productService';

// Enhanced Types
interface EnhancedSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: 'party' | 'product' | 'invoice' | 'order' | 'page' | 'recent' | 'favorite';
  path: string;
  icon: React.ReactNode;
  badge?: string;
  avatar?: string;
  metadata?: {
    lastAccessed?: string;
    frequency?: number;
    category?: string;
    status?: string;
    amount?: number;
    tags?: string[];
  };
  actions?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
  }>;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
  badge?: number;
  isNew?: boolean;
  category?: 'primary' | 'secondary' | 'utility';
  shortcut?: string;
}

interface PartyQuickInfo {
  id: string;
  name: string;
  type: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  lastTransaction?: string;
  outstandingAmount?: number;
  phone?: string;
  email?: string;
}

interface SuperEnhancedHeaderProps {
  onDrawerToggle?: () => void;
  onMenuClick?: () => void;
  isDrawerOpen?: boolean;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  title?: string;
  showSearch?: boolean;
  showQuickActions?: boolean;
  showPartyQuickAccess?: boolean;
  showNotifications?: boolean;
  customQuickActions?: QuickAction[];
  enableAdvancedSearch?: boolean;
  enableVoiceSearch?: boolean;
  enableShortcuts?: boolean;
  showSpeedDial?: boolean;
}

// Enhanced quick actions with categories
const enhancedQuickActions: QuickAction[] = [
  // Primary: requested quick action links
  {
    id: 'new-invoice',
    title: 'New Invoice',
    icon: <ReceiptIcon />,
    path: '/invoices/new',
    color: '#4CAF50',
    isNew: true,
    category: 'primary',
    shortcut: 'Ctrl+N',
  },
  {
    id: 'add-product',
    title: 'Add Product',
    icon: <StoreIcon />,
    path: '/products/new',
    color: '#FF9800',
    category: 'primary',
  },
  {
    id: 'add-party',
    title: 'Add Party',
    icon: <PeopleIcon />,
    path: '/parties/new',
    color: '#9C27B0',
    category: 'primary',
    shortcut: 'Ctrl+P',
  },
  {
    id: 'add-category',
    title: 'Add Category',
    icon: <CategoryIcon />,
    path: '/categories/new',
    color: '#607D8B',
    category: 'primary',
  },
  {
    id: 'new-order',
    title: 'New Order',
    icon: <ShoppingCartIcon />,
    path: '/orders/new',
    color: '#2196F3',
    category: 'primary',
  },
];

export default function SuperEnhancedHeader({
  onDrawerToggle,
  onMenuClick,
  isDrawerOpen = false,
  onThemeToggle,
  isDarkMode = false,
  title,
  showSearch = true,
  showQuickActions = true,
  showPartyQuickAccess = true,
  showNotifications = true,
  customQuickActions,
  enableAdvancedSearch = true,
  enableVoiceSearch = false,
  enableShortcuts = true,
  showSpeedDial = true,
}: SuperEnhancedHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sidebarParam = searchParams.get('sidebar');
  const isMiniByParam = sidebarParam === 'collapsed';
  const effectiveIsDrawerOpen = typeof isDrawerOpen === 'boolean' ? isDrawerOpen : !isMiniByParam;
  const { currentUser, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Enhanced State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EnhancedSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [voiceListening, setVoiceListening] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'party' | 'product' | 'invoice' | 'recent'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  
  // Menu states
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [quickActionsAnchor, setQuickActionsAnchor] = useState<null | HTMLElement>(null);
  const [partyQuickAccessAnchor, setPartyQuickAccessAnchor] = useState<null | HTMLElement>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // Party quick access
  const [recentParties, setRecentParties] = useState<PartyQuickInfo[]>([]);
  const [favoriteParties, setFavoriteParties] = useState<PartyQuickInfo[]>([]);
  const [partyQuickAccessTab, setPartyQuickAccessTab] = useState(0);

  // Memoized quick actions
  const quickActions = useMemo(() => {
    return customQuickActions || enhancedQuickActions;
  }, [customQuickActions]);

  // Enhanced search functionality
  const performEnhancedSearch = useCallback(async (query: string, filter: string = 'all') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results: EnhancedSearchResult[] = [];

      // Search parties with enhanced metadata
      if (filter === 'all' || filter === 'party') {
        const parties = await partyService.getAllParties();
        const matchingParties = parties
          .filter(party => 
            party.name?.toLowerCase().includes(query.toLowerCase()) ||
            party.email?.toLowerCase().includes(query.toLowerCase()) ||
            party.phone?.includes(query) ||
            party.contactPerson?.toLowerCase().includes(query.toLowerCase()) ||
            party.businessType?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .map(party => ({
            id: party.id!,
            title: party.name || 'Unnamed Party',
            subtitle: party.contactPerson || party.email || party.phone || '',
            description: `${party.businessType} • ${party.address || 'No address'}`,
            type: 'party' as const,
            path: `/parties/${party.id}`,
            icon: <PeopleIcon />,
            badge: party.businessType || 'Party',
            avatar: party.name?.charAt(0),
            metadata: {
              category: party.businessType,
              status: party.isActive ? 'Active' : 'Inactive',
              tags: party.tags || [],
            },
            actions: [
              {
                id: 'view',
                label: 'View Details',
                icon: <VisibilityIcon />,
                action: () => router.push(`/parties/${party.id}`),
              },
              {
                id: 'edit',
                label: 'Edit',
                icon: <EditIcon />,
                action: () => router.push(`/parties/${party.id}/edit`),
              },
              {
                id: 'invoice',
                label: 'New Invoice',
                icon: <ReceiptIcon />,
                action: () => router.push(`/invoices/new?party=${party.id}`),
              },
            ],
          }));

        results.push(...matchingParties);
      }

      // Search products with enhanced metadata
      if (filter === 'all' || filter === 'product') {
        try {
          const products = await productService.getAllProducts();
          const matchingProducts = products
            .filter(product => 
              product.name?.toLowerCase().includes(query.toLowerCase()) ||
              product.sku?.toLowerCase().includes(query.toLowerCase()) ||
              product.categoryName?.toLowerCase().includes(query.toLowerCase()) ||
              product.brand?.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5)
            .map(product => ({
              id: product.id!,
              title: product.name || 'Unnamed Product',
              subtitle: `SKU: ${product.sku || 'N/A'} • Stock: ${product.quantity || 0}`,
              description: `${product.categoryName || 'No category'} • ₹${product.price || 0}`,
              type: 'product' as const,
              path: `/products/edit/${product.id}`,
              icon: <InventoryIcon />,
              badge: product.categoryName || 'Product',
              metadata: {
                category: product.categoryName,
                status: product.isActive ? 'Active' : 'Inactive',
                amount: product.price,
                tags: product.tags || [],
              },
              actions: [
                {
                  id: 'view',
                  label: 'View Details',
                  icon: <VisibilityIcon />,
                  action: () => router.push(`/products/${product.id}`),
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: <EditIcon />,
                  action: () => router.push(`/products/edit/${product.id}`),
                },
                {
                  id: 'add-to-invoice',
                  label: 'Add to Invoice',
                  icon: <AddIcon />,
                  action: () => router.push(`/invoices/new?product=${product.id}`),
                },
              ],
            }));

          results.push(...matchingProducts);
        } catch (error) {
          console.log('Product search not available:', error);
        }
      }

      // Add recent searches and favorites
      if (filter === 'all' || filter === 'recent') {
        const recentResults = recentSearches
          .filter(recent => recent.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(recent => ({
            id: `recent-${recent}`,
            title: recent,
            subtitle: 'Recent search',
            type: 'recent' as const,
            path: '#',
            icon: <HistoryIcon />,
            badge: 'Recent',
            actions: [
              {
                id: 'search-again',
                label: 'Search Again',
                icon: <SearchIcon />,
                action: () => setSearchQuery(recent),
              },
            ],
          }));

        results.push(...recentResults);
      }

      // Add page/navigation results
      const pageResults = [
        { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, description: 'Main dashboard with overview' },
        { title: 'Invoices', path: '/invoices', icon: <ReceiptIcon />, description: 'Manage all invoices' },
        { title: 'Products', path: '/products', icon: <InventoryIcon />, description: 'Product inventory management' },
        { title: 'Parties', path: '/parties', icon: <PeopleIcon />, description: 'Customer and supplier management' },
        { title: 'Orders', path: '/orders', icon: <ShoppingCartIcon />, description: 'Order management' },
        { title: 'Reports', path: '/reports', icon: <AnalyticsIcon />, description: 'Business analytics and reports' },
        { title: 'Settings', path: '/settings', icon: <SettingsIcon />, description: 'Application settings' },
      ]
        .filter(page => page.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(page => ({
          id: `page-${page.path}`,
          title: page.title,
          subtitle: 'Navigate to page',
          description: page.description,
          type: 'page' as const,
          path: page.path,
          icon: page.icon,
          badge: 'Page',
          actions: [
            {
              id: 'navigate',
              label: 'Go to Page',
              icon: <ArrowDropDownIcon />,
              action: () => router.push(page.path),
            },
          ],
        }));

      results.push(...pageResults);

      setSearchResults(results.slice(0, 12)); // Limit to 12 results
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Enhanced search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [recentSearches, router]);

  // Load recent and favorite parties
  useEffect(() => {
    const loadPartyQuickAccess = async () => {
      try {
        const parties = await partyService.getAllParties();
        
        // Mock recent parties (in real app, this would come from user activity)
        const recent = parties.slice(0, 5).map(party => ({
          id: party.id!,
          name: party.name || 'Unnamed Party',
          type: party.businessType || 'Party',
          status: party.isActive ? 'active' as const : 'inactive' as const,
          phone: party.phone,
          email: party.email,
          outstandingAmount: party.outstandingBalance,
          lastTransaction: '2 days ago', // Mock data
        }));

        setRecentParties(recent);
        
        // Mock favorite parties
        setFavoriteParties(recent.slice(0, 3));
      } catch (error) {
        console.error('Error loading party quick access:', error);
      }
    };

    if (showPartyQuickAccess) {
      loadPartyQuickAccess();
    }
  }, [showPartyQuickAccess]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performEnhancedSearch(searchQuery, searchFilter);
      } else {
        setSearchResults([]);
        setHighlightIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFilter, performEnhancedSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Global search shortcut (Ctrl/Cmd + K)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      
      // Quick action shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'd':
            event.preventDefault();
            router.push('/dashboard');
            break;
          case 'n':
            event.preventDefault();
            router.push('/invoices/new');
            break;
          case 'p':
            event.preventDefault();
            router.push('/parties/new');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, router]);

  // Handle search result selection
  const handleSearchResultClick = (result: EnhancedSearchResult) => {
    if (result.path !== '#') {
      router.push(result.path);
    }
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setHighlightIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = Math.min((prev ?? -1) + 1, Math.max(searchResults.length - 1, 0));
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max((prev ?? 0) - 1, -1));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < searchResults.length) {
        e.preventDefault();
        handleSearchResultClick(searchResults[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setHighlightIndex(-1);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (itemId: string) => {
    setFavoriteItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn('SpeechRecognition not supported');
      return;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new SR();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setSearchQuery(transcript);
        setSearchOpen(true);
        searchInputRef.current?.focus();
      };
      recognitionRef.current.onend = () => setVoiceListening(false);
      recognitionRef.current.onerror = () => setVoiceListening(false);
    }
    setVoiceListening(true);
    recognitionRef.current.start();
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceListening(false);
  };

  // Menu handlers
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleQuickActionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setQuickActionsAnchor(event.currentTarget);
  };

  const handleQuickActionsClose = () => {
    setQuickActionsAnchor(null);
  };

  const handlePartyQuickAccessOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPartyQuickAccessAnchor(event.currentTarget);
  };

  const handlePartyQuickAccessClose = () => {
    setPartyQuickAccessAnchor(null);
  };

  const handleLogoutClick = async () => {
    handleProfileMenuClose();
    await handleLogout(logout, router);
  };

  // Get page title
  const getPageTitle = () => {
    if (title) return title;
    
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'Dashboard';
    
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ');
  };

  return (
    <>
      <AppBar
        position="absolute"
        elevation={0}
        sx={{
          margin: 'auto',
          position: 'sticky',
          width: { 
            xs: '100%',
            // md: effectiveIsDrawerOpen ? `calc(100% - 280px)` : `calc(100% - 72px)` 
          },
          ml: { 
            xs: 0,
            md: effectiveIsDrawerOpen ? '280px' : '72px' 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64 }, 
          px: { xs: 1.5, sm: 2, md: 3 },
          gap: { xs: 0.5, sm: 1 }
        }}>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => {
              console.log('Menu button clicked in header');
              if (onMenuClick) {
                console.log('Calling onMenuClick');
                onMenuClick();
              } else if (onDrawerToggle) {
                console.log('Calling onDrawerToggle');
                onDrawerToggle();
              } else {
                console.log('No toggle function provided');
              }
            }}
            sx={{ 
              mr: { xs: 1, sm: 2 }, 
              display: { md: 'none' },
              color: theme.palette.text.primary,
              p: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title with breadcrumb */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: { xs: 0.5, sm: 1, md: 2 },
            minWidth: 0, // Allow shrinking
            flex: { xs: '0 1 auto', sm: '0 0 auto' }
          }}>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {getPageTitle()}
            </Typography>
            {pathname !== '/dashboard' && (
              <Chip
                label={pathname.split('/')[1]?.toUpperCase() || 'PAGE'}
                size="small"
                variant="outlined"
                sx={{ 
                  ml: 1, 
                  display: { xs: 'none', sm: 'inline-flex' },
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>

          {/* Enhanced Search bar */}
          {showSearch && (
            <Box sx={{ 
              flexGrow: 1, 
              maxWidth: { xs: 'none', sm: 280, md: 400, lg: 500 }, 
              mx: { xs: 0.5, sm: 1, md: 1.5 }, 
              position: 'relative',
              display: { xs: 'none', sm: 'block' },
              minWidth: { sm: 160, md: 220 }
            }}>
              <Paper
                component="div"
                sx={{
                  p: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                  '&:focus-within': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <IconButton sx={{ p: '8px' }} aria-label="search">
                  <SearchIcon />
                </IconButton>
                
                <InputBase
                  ref={searchInputRef}
                  sx={{ 
                    ml: 1, 
                    flex: 1,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                  placeholder={isMobile ? "Search..." : "Search parties, products, invoices... (Ctrl+K)"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                />

                {enableVoiceSearch && (
                  <IconButton sx={{ p: '8px' }} aria-label="voice search" onClick={() => (voiceListening ? stopVoiceSearch() : startVoiceSearch())}>
                    {voiceListening ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                )}

                {/* Search filters */}
                {enableAdvancedSearch && searchOpen && (
                  <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                    <ButtonGroup size="small" variant="outlined">
                      {['all', 'party', 'product', 'recent'].map((filter) => (
                        <Button
                          key={filter}
                          variant={searchFilter === filter ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setSearchFilter(filter as any)}
                          sx={{ textTransform: 'capitalize', minWidth: 'auto', px: 1 }}
                        >
                          {filter}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </Box>
                )}

                {searchLoading && (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                )}

                {enableShortcuts && (
                  <Chip
                    label="Ctrl+K"
                    size="small"
                    variant="outlined"
                    sx={{ 
                      mr: 1, 
                      fontSize: '0.7rem',
                      display: { xs: 'none', lg: 'inline-flex' }
                    }}
                  />
                )}
              </Paper>

              {/* Enhanced Search results dropdown */}
              {searchOpen && (searchResults.length > 0 || searchQuery) && (
                <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      mt: 1,
                      maxHeight: 500,
                      overflow: 'auto',
                      zIndex: theme.zIndex.modal,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 2,
                    }}
                  >
                    {searchResults.length > 0 ? (
                      <List sx={{ py: 1 }}>
                        {searchResults.map((result, index) => (
                          <ListItem key={result.id} disablePadding>
                            <ListItemButton
                              onClick={() => handleSearchResultClick(result)}
                              selected={index === highlightIndex}
                              ref={index === highlightIndex ? (el) => el && el.scrollIntoView({ block: 'nearest' }) : undefined}
                              onMouseEnter={() => setHighlightIndex(index)}
                              sx={{
                                py: 2,
                                px: 2,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 48 }}>
                                {result.avatar ? (
                                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                    {result.avatar}
                                  </Avatar>
                                ) : (
                                  result.icon
                                )}
                              </ListItemIcon>
                              
                              <ListItemText
                                primary={
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Typography variant="subtitle2" fontWeight={600} component="span">
                                      {result.title}
                                    </Typography>
                                    {result.badge && (
                                      <Chip
                                        label={result.badge}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </span>
                                }
                                secondary={
                                  <>
                                    {result.subtitle && (
                                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                                        {result.subtitle}
                                      </Typography>
                                    )}
                                    {result.description && (
                                      <Typography variant="caption" color="text.secondary" component="span" display="block">
                                        {result.description}
                                      </Typography>
                                    )}
                                    {result.metadata?.tags && result.metadata.tags.length > 0 && (
                                      <span style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {result.metadata.tags.slice(0, 3).map((tag) => (
                                          <Chip
                                            key={tag}
                                            label={tag}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.6rem', height: 20 }}
                                          />
                                        ))}
                                      </span>
                                    )}
                                  </>
                                }
                              />

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* Favorite button */}
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFavoriteToggle(result.id);
                                  }}
                                >
                                  {favoriteItems.includes(result.id) ? (
                                    <FavoriteIcon color="error" fontSize="small" />
                                  ) : (
                                    <FavoriteBorderIcon fontSize="small" />
                                  )}
                                </IconButton>

                                {/* Quick actions */}
                                {result.actions && result.actions.length > 0 && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Show quick actions menu
                                    }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    ) : searchQuery ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          No results found for "{searchQuery}"
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          sx={{ mt: 1 }}
                          onClick={() => {
                            // Suggest creating new item based on search
                            if (searchFilter === 'party') {
                              router.push(`/parties/new?name=${encodeURIComponent(searchQuery)}`);
                            } else if (searchFilter === 'product') {
                              router.push(`/products/new?name=${encodeURIComponent(searchQuery)}`);
                            }
                            setSearchOpen(false);
                          }}
                        >
                          Create "{searchQuery}"
                        </Button>
                      </Box>
                    ) : null}
                  </Paper>
                </ClickAwayListener>
              )}
            </Box>
          )}

          {/* Spacer for mobile */}
          <Box sx={{ flexGrow: 1, display: { md: 'none' } }} />

          {/* Party Quick Access */}
          {showPartyQuickAccess && (
            <Box sx={{ 
              mr: { xs: 0.5, sm: 1, md: 2 },
              display: { xs: 'none', md: 'block' }
            }}>
              <Button
                onClick={handlePartyQuickAccessOpen}
                startIcon={<PeopleIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: { sm: 1, md: 2 },
                  fontSize: { sm: '0.875rem', md: '1rem' },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                  Parties
                </Box>
                {recentParties.length > 0 && (
                  <Badge badgeContent={recentParties.length} color="primary" sx={{ ml: 1 }} />
                )}
              </Button>
            </Box>
          )}

          {/* Quick actions */}
          {showQuickActions && (
            <Box sx={{ 
              mr: { xs: 0.5, sm: 1, md: 2 },
              display: { xs: 'none', lg: 'block' }
            }}>
              <Button
                onClick={handleQuickActionsOpen}
                startIcon={<StarIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                Quick Actions
              </Button>
            </Box>
          )}

          {/* Action buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {/* Mobile Quick Actions */}
            {showQuickActions && (
              <IconButton
                color="inherit"
                onClick={handleQuickActionsOpen}
                sx={{ 
                  color: theme.palette.text.primary,
                  display: { xs: 'flex', lg: 'none' }
                }}
              >
                <AddIcon />
              </IconButton>
            )}

            {/* Mobile Search Button */}
            {showSearch && (
              <IconButton
                color="inherit"
                onClick={() => setSearchOpen(true)}
                sx={{ 
                  color: theme.palette.text.primary,
                  display: { xs: 'flex', sm: 'none' },
                  p: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <SearchIcon />
              </IconButton>
            )}

            {/* Notifications - Hidden on mobile */}
            {showNotifications && (
              <IconButton
                color="inherit"
                onClick={handleNotificationsOpen}
                sx={{ 
                  color: theme.palette.text.primary,
                  display: { xs: 'none', sm: 'flex' },
                  p: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

            {/* Theme toggle - Hidden on mobile */}
            {onThemeToggle && (
              <IconButton
                color="inherit"
                onClick={onThemeToggle}
                sx={{ 
                  color: theme.palette.text.primary,
                  display: { xs: 'none', md: 'flex' },
                  p: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            )}

            {/* Profile menu - Hidden on mobile */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0.5,
                ml: { xs: 0.5, sm: 1 },
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <Avatar
                alt={currentUser?.displayName || 'User'}
                src={currentUser?.photoURL || undefined}
                sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}
              >
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Party Quick Access Menu */}
      <Menu
        anchorEl={partyQuickAccessAnchor}
        open={Boolean(partyQuickAccessAnchor)}
        onClose={handlePartyQuickAccessClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 400,
            maxWidth: 500,
            maxHeight: 600,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6">Party Quick Access</Typography>
          <Tabs
            value={partyQuickAccessTab}
            onChange={(_, newValue) => setPartyQuickAccessTab(newValue)}
            sx={{ mt: 1 }}
          >
            <Tab label="Recent" />
            <Tab label="Favorites" />
          </Tabs>
        </Box>

        {partyQuickAccessTab === 0 && (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {recentParties.map((party) => (
              <MenuItem
                key={party.id}
                onClick={() => {
                  router.push(`/parties/${party.id}`);
                  handlePartyQuickAccessClose();
                }}
                sx={{ py: 2, px: 3 }}
              >
                <ListItemIcon>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                    {party.name.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography variant="subtitle2" component="span">{party.name}</Typography>
                      <Chip
                        label={party.status}
                        size="small"
                        color={party.status === 'active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </span>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {party.type} • {party.phone || party.email}
                      </Typography>
                      {party.outstandingAmount && (
                        <Typography variant="caption" color="warning.main" component="span" display="block">
                          Outstanding: ₹{party.outstandingAmount}
                        </Typography>
                      )}
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/invoices/new?party=${party.id}`);
                      handlePartyQuickAccessClose();
                    }}
                  >
                    <ReceiptIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {party.lastTransaction}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}

        {partyQuickAccessTab === 1 && (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {favoriteParties.map((party) => (
              <MenuItem
                key={party.id}
                onClick={() => {
                  router.push(`/parties/${party.id}`);
                  handlePartyQuickAccessClose();
                }}
                sx={{ py: 2, px: 3 }}
              >
                <ListItemIcon>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                    {party.name.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={party.name}
                  secondary={`${party.type} • ${party.phone || party.email}`}
                />
                <IconButton size="small">
                  <FavoriteIcon color="error" fontSize="small" />
                </IconButton>
              </MenuItem>
            ))}
          </Box>
        )}

        <Divider />
        <MenuItem
          onClick={() => {
            router.push('/parties');
            handlePartyQuickAccessClose();
          }}
          sx={{ justifyContent: 'center', py: 1 }}
        >
          <Typography variant="body2" color="primary">
            View All Parties
          </Typography>
        </MenuItem>
      </Menu>

      {/* Quick Actions Menu */}
      <Menu
        anchorEl={quickActionsAnchor}
        open={Boolean(quickActionsAnchor)}
        onClose={handleQuickActionsClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: { xs: 280, sm: 320 },
            maxWidth: 400,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon color="primary" />
            Quick Actions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create new items quickly
          </Typography>
        </Box>

        <Box sx={{ p: 1 }}>
          <Grid container spacing={1}>
            {quickActions.slice(0, isMobile ? 4 : 6).map((action) => (
              <Grid item xs={6} key={action.id}>
                <MenuItem
                  onClick={() => {
                    router.push(action.path);
                    handleQuickActionsClose();
                  }}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    minHeight: 80,
                    '&:hover': {
                      backgroundColor: alpha(action.color || theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: alpha(action.color || theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      color: action.color || theme.palette.primary.main,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {action.title}
                  </Typography>
                  {action.isNew && (
                    <Chip
                      label="New"
                      size="small"
                      color="primary"
                      sx={{ mt: 0.5, height: 16, fontSize: '0.6rem' }}
                    />
                  )}
                </MenuItem>
              </Grid>
            ))}
            
            {/* Mobile Profile Access */}
            {isMobile && (
              <Grid item xs={6}>
                <MenuItem
                  onClick={(e) => {
                    handleQuickActionsClose();
                    handleProfileMenuOpen(e);
                  }}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    minHeight: 80,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Avatar
                    alt={currentUser?.displayName || 'User'}
                    src={currentUser?.photoURL || undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      mb: 1,
                      border: `2px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    Profile
                  </Typography>
                </MenuItem>
              </Grid>
            )}

            {/* Mobile Settings Access */}
            {isMobile && (
              <Grid item xs={6}>
                <MenuItem
                  onClick={() => {
                    handleQuickActionsClose();
                    setSettingsDialogOpen(true);
                  }}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    minHeight: 80,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      color: theme.palette.secondary.main,
                    }}
                  >
                    <SettingsIcon />
                  </Box>
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    Settings
                  </Typography>
                </MenuItem>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider />
        <MenuItem
          onClick={() => {
            router.push('/dashboard');
            handleQuickActionsClose();
          }}
          sx={{ justifyContent: 'center', py: 1 }}
        >
          <Typography variant="body2" color="primary">
            View Dashboard
          </Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: { xs: 300, sm: 350 },
            maxWidth: 400,
            maxHeight: 500,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" />
            Notifications
            <Badge badgeContent={3} color="error" sx={{ ml: 'auto' }} />
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {/* Sample notifications */}
          <MenuItem sx={{ py: 2, px: 3, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ mt: 0.5 }}>
              <ReceiptIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="New invoice created"
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary" component="span" display="block">
                    Invoice #INV-001 for ₹5,000 has been created
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span" display="block">
                    2 minutes ago
                  </Typography>
                </>
              }
            />
          </MenuItem>
          
          <MenuItem sx={{ py: 2, px: 3, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ mt: 0.5 }}>
              <WarningIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Low stock alert"
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary" component="span" display="block">
                    Product "Widget A" is running low (5 items left)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span" display="block">
                    1 hour ago
                  </Typography>
                </>
              }
            />
          </MenuItem>

          <MenuItem sx={{ py: 2, px: 3, alignItems: 'flex-start' }}>
            <ListItemIcon sx={{ mt: 0.5 }}>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Payment received"
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary" component="span" display="block">
                    Payment of ₹3,500 received from John Doe
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span" display="block">
                    3 hours ago
                  </Typography>
                </>
              }
            />
          </MenuItem>
        </Box>

        <Divider />
        <MenuItem
          onClick={() => {
            router.push('/notifications');
            handleNotificationsClose();
          }}
          sx={{ justifyContent: 'center', py: 1 }}
        >
          <Typography variant="body2" color="primary">
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>

      {/* Profile menu - keeping the existing one */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 250,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              alt={user?.displayName || 'User'}
              src={user?.photoURL || undefined}
              sx={{ width: 40, height: 40 }}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {user?.displayName || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <MenuItem onClick={() => { router.push('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem onClick={() => { router.push('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <MenuItem onClick={() => { setSettingsDialogOpen(true); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <PaletteIcon />
          </ListItemIcon>
          <ListItemText primary="Preferences" />
        </MenuItem>

        <MenuItem onClick={() => { router.push('/help-desk'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <ExitToAppIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Mobile search overlay - enhanced */}
      {showSearch && searchOpen && isMobile && (
        <Dialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          fullScreen
          TransitionComponent={Slide}
          TransitionProps={{ direction: 'up' }}
          PaperProps={{
            sx: {
              backgroundColor: theme.palette.background.default,
            },
          }}
          sx={{ zIndex: theme.zIndex.appBar + 2 }}
        >
          <AppBar 
            position="static" 
            elevation={0} 
            sx={{ 
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Toolbar sx={{ px: 2, py: 1 }}>
              <TextField
                autoFocus
                fullWidth
                placeholder="Search parties, products, invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  sx: {
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
                sx={{ mr: 1 }}
              />
              <IconButton 
                onClick={() => setSearchOpen(false)}
                sx={{ 
                  color: theme.palette.text.primary,
                  backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          
          {/* Mobile search filters */}
          <Box sx={{ px: 2, py: 2, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Filter by:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {[
                { key: 'all', label: 'All', icon: <SearchIcon /> },
                { key: 'party', label: 'Parties', icon: <PeopleIcon /> },
                { key: 'product', label: 'Products', icon: <InventoryIcon /> },
                { key: 'recent', label: 'Recent', icon: <HistoryIcon /> },
              ].map((filter) => (
                <Chip
                  key={filter.key}
                  label={filter.label}
                  icon={filter.icon}
                  variant={searchFilter === filter.key ? 'filled' : 'outlined'}
                  color={searchFilter === filter.key ? 'primary' : 'default'}
                  onClick={() => setSearchFilter(filter.key as any)}
                  sx={{
                    minWidth: 'auto',
                    '& .MuiChip-icon': {
                      fontSize: '1rem',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <DialogContent>
            {searchResults.length > 0 ? (
              <List>
                {searchResults.map((result) => (
                  <ListItem key={result.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSearchResultClick(result)}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon>
                        {result.avatar ? (
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {result.avatar}
                          </Avatar>
                        ) : (
                          result.icon
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={result.title}
                        secondary={
                          <>
                            {result.subtitle && (
                              <Typography variant="body2" color="text.secondary" component="span" display="block">
                                {result.subtitle}
                              </Typography>
                            )}
                            {result.description && (
                              <Typography variant="caption" color="text.secondary" component="span" display="block">
                                {result.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      {result.badge && (
                        <Chip label={result.badge} size="small" variant="outlined" />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : searchQuery ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No results found for "{searchQuery}"
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                  onClick={() => {
                    if (searchFilter === 'party') {
                      router.push(`/parties/new?name=${encodeURIComponent(searchQuery)}`);
                    } else if (searchFilter === 'product') {
                      router.push(`/products/new?name=${encodeURIComponent(searchQuery)}`);
                    }
                    setSearchOpen(false);
                  }}
                >
                  Create "{searchQuery}"
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Start typing to search...
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Settings dialog - keeping the existing one */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Preferences</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={onThemeToggle}
                />
              }
              label="Dark Mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={enableShortcuts}
                  onChange={() => {}}
                />
              }
              label="Enable Keyboard Shortcuts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={enableAdvancedSearch}
                  onChange={() => {}}
                />
              }
              label="Advanced Search Features"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Mobile SpeedDial for quick actions */}
      {showSpeedDial && (
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ 
            position: 'fixed', 
            bottom: { xs: 20, sm: 24 }, 
            right: { xs: 20, sm: 24 },
            zIndex: theme.zIndex.speedDial,
            display: { xs: 'flex', lg: 'none' },
            '& .MuiSpeedDial-fab': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.1)',
              },
            },
          }}
          icon={<SpeedDialIcon openIcon={<AddIcon />} />}
          FabProps={{
            sx: {
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        >
          {quickActions.slice(0, 5).map((action) => (
            <SpeedDialAction
              key={action.id}
              icon={action.icon}
              tooltipTitle={action.title}
              onClick={() => router.push(action.path)}
              FabProps={{
                sx: {
                  backgroundColor: alpha(action.color || theme.palette.primary.main, 0.9),
                  color: theme.palette.getContrastText(action.color || theme.palette.primary.main),
                  '&:hover': {
                    backgroundColor: action.color || theme.palette.primary.main,
                    transform: 'scale(1.1)',
                  },
                },
              }}
              TooltipProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[4],
                    fontSize: '0.875rem',
                  },
                },
              }}
            />
          ))}
        </SpeedDial>
      )}


    </>
  );
}