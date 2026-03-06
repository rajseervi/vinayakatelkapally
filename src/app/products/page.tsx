
"use client"; 
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { VisuallyEnhancedDashboardLayout } from '@/components/ModernLayout';
import ModernThemeProvider from '@/contexts/ModernThemeContext';
import { Button, Stack } from '@mui/material'; 


import PageHeader from '@/components/PageHeader/PageHeader';
import ExcelImportExport from '@/components/products/ExcelImportExport';
import ExportAllProducts from '@/components/products/ExportAllProducts';
import ExportSelectedProducts from '@/components/products/ExportSelectedProducts';
import CategoryDiscountManagement from '@/components/products/CategoryDiscountManagement';

import { RemoveDuplicatesButton } from '@/components/Common/RemoveDuplicatesButton';
import { productService, ProductFilters, ProductSortOptions, PaginationOptions } from '@/services/productService';
import { Product, Category } from '@/types/inventory';
import { categoryService } from '@/services/categoryService';


import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination, 
  Box,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Checkbox,
  Grid,
  Slider,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  LocalOffer as DiscountIcon,
  ViewList as TableViewIcon,
  ViewModule as CardViewIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Speed as SpeedIcon,
  BarChart as BarChartIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { alpha, useTheme, Fade, Grow, Zoom } from '@mui/material'; 
function ProductsPage() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'low-stock'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [stockRange, setStockRange] = useState<[number, number]>([0, 1000]);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10000);
  const [totalCount, setTotalCount] = useState(0);
  const [lastVisible, setLastVisible] = useState<any>(null);

  type SortField = 'name' | 'price' | 'quantity' | 'createdAt';
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProductData, setNewProductData] = useState<Partial<Product>>({});
  const [selectedProductsSet, setSelectedProductsSet] = useState<Set<string>>(new Set());
  const selectedProducts = useMemo(() => Array.from(selectedProductsSet), [selectedProductsSet]);
  const [bulkCategoryDialogOpen, setBulkCategoryDialogOpen] = useState(false);
  const [selectedBulkCategory, setSelectedBulkCategory] = useState('');
  const [categoryDiscountDialogOpen, setCategoryDiscountDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning'; }>({ open: false, message: '', severity: 'success' });

  const searchDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setSnackbar({ open: true, message: 'Failed to fetch categories.', severity: 'error' });
    }
  }, []);

  const fetchData = useCallback(async (resetPagination = false) => {
    setLoading(true);
    setError(null);

    const currentPage = resetPagination ? 0 : page;
    if (resetPagination) {
      setPage(0);
      setLastVisible(null); // Clear pagination state
    }

    try {
      const filters: ProductFilters = {
        searchTerm: searchTerm || undefined,
        category: categoryFilter || undefined,
        status: statusFilter,
        priceRange: priceRange[0] > 0 || priceRange[1] < 10000 ? priceRange : undefined,
        stockRange: stockRange[0] > 0 || stockRange[1] < 1000 ? stockRange : undefined,
      };

      const hasClientSideFilters = !!(filters.searchTerm || filters.priceRange || filters.stockRange);

      const sortOptions: ProductSortOptions = { field: sortField, direction: sortDirection };
      const paginationOptions: PaginationOptions | undefined = (resetPagination || hasClientSideFilters) ? undefined : {
        page: currentPage,
        limit: rowsPerPage,
        lastVisible: lastVisible
      };

      console.log('Fetching products with filters:', filters, 'sort:', sortOptions, 'pagination:', paginationOptions);
      const response = await productService.getProducts(filters, sortOptions, paginationOptions || undefined);
      console.log('Fetched products:', response.products.length, 'total:', response.totalCount);

      setProducts(response.products);
      setTotalCount(response.totalCount);
      setLastVisible(response.lastVisible);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, categoryFilter, statusFilter, priceRange, stockRange, sortField, sortDirection, lastVisible]);

  useEffect(() => {
    fetchCategories();
    const savedRowsPerPage = localStorage.getItem('productsRowsPerPage');
    if (savedRowsPerPage) setRowsPerPage(parseInt(savedRowsPerPage, 10));
  }, [fetchCategories]);

  useEffect(() => {
    if (searchDebounceTimeout.current) clearTimeout(searchDebounceTimeout.current);
    searchDebounceTimeout.current = setTimeout(() => {
      fetchData(true);
    }, 500);
    return () => { if (searchDebounceTimeout.current) clearTimeout(searchDebounceTimeout.current) };
  }, [searchTerm, categoryFilter, statusFilter, priceRange, stockRange, sortField, sortDirection, rowsPerPage]);

  useEffect(() => {
    if (page > 0) {
      const hasClientSideFilters = !!(searchTerm || (priceRange[0] > 0 || priceRange[1] < 10000) || (stockRange[0] > 0 || stockRange[1] < 1000));
      if (!hasClientSideFilters) fetchData(false);
    }
  }, [page]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('all');
    setPriceRange([0, 10000]);
    setStockRange([0, 1000]);
    setAdvancedSearchOpen(false);
  };
  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    localStorage.setItem('productsRowsPerPage', event.target.value);
  };
  const handleSort = (field: SortField) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };
  const handleAddProduct = () => { setSelectedProduct(null); setNewProductData({}); setOpenDialog(true); };
  const handleEditProduct = (product: Product) => { setSelectedProduct(product); setNewProductData(product); setOpenDialog(true); };
  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveProduct = async () => {
    if (!newProductData.name || !newProductData.categoryId || newProductData.price === undefined || newProductData.purchasePrice === undefined || newProductData.quantity === undefined) {
        setSnackbar({ open: true, message: 'Please fill all required fields including purchase price.', severity: 'error' });
        return;
    }
    setLoading(true);
    try {
      if (selectedProduct?.id) {
        await productService.updateProduct(selectedProduct.id, newProductData);
        setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
      } else {
        await productService.createProduct(newProductData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
        setSnackbar({ open: true, message: 'Product created successfully!', severity: 'success' });
      }
      await fetchData(true);
      await fetchCategories();
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving product:', err);
      setSnackbar({ open: true, message: 'Failed to save product.', severity: 'error' });
    } finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      setLoading(true);
      try {
        await productService.deleteProduct(id);
        setSnackbar({ open: true, message: 'Product deleted.', severity: 'success' });
        await fetchData(true);
        await fetchCategories();
      } catch (err) {
        console.error('Error deleting product:', err);
        setSnackbar({ open: true, message: 'Failed to delete product.', severity: 'error' });
      } finally { setLoading(false); }
    }
  };
  
  const handleBulkCategoryChange = async () => {
    if (!selectedBulkCategory || selectedProducts.length === 0) return;
    setLoading(true);
    try {
        await productService.bulkUpdateProducts(selectedProducts, { categoryId: selectedBulkCategory });
        setSnackbar({ open: true, message: 'Products updated.', severity: 'success' });
        await fetchData(true);
        await fetchCategories();
        setSelectedProductsSet(new Set());
        setBulkCategoryDialogOpen(false);
    } catch (err) {
        console.error('Error updating categories:', err);
        setSnackbar({ open: true, message: 'Failed to update categories.', severity: 'error' });
    } finally { setLoading(false); }
  };

  const handleBulkDeleteProducts = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`)) return;
    setLoading(true);
    try {
        await productService.bulkDeleteProducts(selectedProducts);
        setSnackbar({ open: true, message: `${selectedProducts.length} product(s) deleted successfully.`, severity: 'success' });
        await fetchData(true);
        await fetchCategories();
        setSelectedProductsSet(new Set());
    } catch (err) {
        console.error('Error deleting products:', err);
        setSnackbar({ open: true, message: 'Failed to delete selected products.', severity: 'error' });
    } finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewProductData({ ...newProductData, [name as string]: value });
  };
  
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedProductsSet(new Set(products.map((n) => n.id!)));
    } else {
      setSelectedProductsSet(new Set());
    }
  };

  const handleSelectClick = (id: string) => {
    const newSelecteds = new Set(selectedProductsSet);
    if (newSelecteds.has(id)) newSelecteds.delete(id);
    else newSelecteds.add(id);
    setSelectedProductsSet(newSelecteds);
  };

  const productsWithCategoryData = useMemo(() => {
    return products.map(p => ({
        ...p,
        categoryName: categories.find(c => c.id === p.categoryId)?.name || 'N/A',
        status: p.isActive ? (p.quantity < (p.reorderPoint || 10) ? 'Low Stock' : 'In Stock') : 'Inactive',
    }));
  }, [products, categories]);

  const calculateStats = () => {
    const lowStockCount = productsWithCategoryData.filter(p => p.status === 'Low Stock').length;
    const inStockCount = productsWithCategoryData.filter(p => p.status === 'In Stock').length;
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
    const avgProfit = products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (((p.price || 0) - (p.purchasePrice || 0)) / Math.max(p.purchasePrice || 1, 1) * 100), 0) / products.length) : 0;
    return { lowStockCount, inStockCount, totalInventoryValue, avgProfit };
  };

  const stats = calculateStats();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <PageHeader title="Products" />
        
        {/* Enhanced Stats Dashboard */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={!loading} timeout={300}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{totalCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Products</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={!loading} timeout={400}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, width: 56, height: 56 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{stats.inStockCount}</Typography>
                    <Typography variant="body2" color="text.secondary">In Stock</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={!loading} timeout={500}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 56, height: 56 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{stats.lowStockCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Low Stock</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={!loading} timeout={600}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main, width: 56, height: 56 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>₹{(stats.totalInventoryValue / 100000).toFixed(1)}L</Typography>
                    <Typography variant="body2" color="text.secondary">Inventory Value</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Price Analytics Card */}
        <Fade in={!loading} timeout={700}>
          <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)` }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BarChartIcon sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Average Profit Margin</Typography>
                      <Typography variant="h5" fontWeight={700} color="secondary.main">{stats.avgProfit}%</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Categories</Typography>
                      <Typography variant="h5" fontWeight={700} color="secondary.main">{categories.length}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Search & Action Bar */}
        <Fade in={!loading} timeout={800}>
          <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)` }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={5}>
                  <TextField 
                    placeholder="Search products by name, SKU..." 
                    variant="outlined" 
                    size="small" 
                    fullWidth 
                    value={searchTerm} 
                    onChange={handleSearch}
                    InputProps={{ 
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: searchTerm ? <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon fontSize="small" /></IconButton> : null
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    fullWidth
                    variant={advancedSearchOpen ? "contained" : "outlined"}
                    startIcon={<TuneIcon />}
                    onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
                    sx={{ borderRadius: 2 }}
                  >
                    Filters
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button 
                    fullWidth
                    variant="outlined" 
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    sx={{ borderRadius: 2 }}
                  >
                    Clear
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newView) => newView && setViewMode(newView)}
                    aria-label="view mode"
                    size="small"
                    fullWidth
                  >
                    <ToggleButton value="table" aria-label="table view" sx={{ flex: 1 }}>
                      <Tooltip title="Table"><TableViewIcon fontSize="small" /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="cards" aria-label="card view" sx={{ flex: 1 }}>
                      <Tooltip title="Cards"><CardViewIcon fontSize="small" /></Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>

              {/* Advanced Filters */}
              {advancedSearchOpen && (
                <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControl variant="outlined" size="small" fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Category">
                          <MenuItem value=""><em>All Categories</em></MenuItem>
                          {categories.map((c) => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl variant="outlined" size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} label="Status">
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="low-stock">Low Stock</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 600 }}>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Typography>
                      <Slider value={priceRange} onChange={(e, v) => setPriceRange(v as [number, number])} valueLabelDisplay="auto" min={0} max={10000} step={100} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 600 }}>Stock: {stockRange[0]} - {stockRange[1]}</Typography>
                      <Slider value={stockRange} onChange={(e, v) => setStockRange(v as [number, number])} valueLabelDisplay="auto" min={0} max={1000} step={10} />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Main Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProduct} sx={{ borderRadius: 2 }}>
            Add Product
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DiscountIcon />} 
            onClick={() => setCategoryDiscountDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Category Discounts
          </Button>
          <ExcelImportExport onSuccess={() => {
            setLastVisible(null);
            setPage(0);
            setSelectedProductsSet(new Set());
            fetchCategories();
            setTimeout(() => { fetchData(true); }, 500);
          }} />
          <ExportAllProducts />
          <RemoveDuplicatesButton onSuccess={() => fetchData(true)} />
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {selectedProducts.length > 0 && (
          <Fade in={selectedProducts.length > 0} timeout={300}>
            <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`, border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}` }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm="auto">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                        <CheckCircleIcon />
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {selectedProducts.length} selected
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <ExportSelectedProducts
                        selectedIds={selectedProducts}
                        onShowSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })}
                      />
                      <Button variant="contained" color="secondary" onClick={() => setBulkCategoryDialogOpen(true)} sx={{ borderRadius: 1 }}>
                        Update Category
                      </Button>
                      <Button variant="contained" color="error" onClick={handleBulkDeleteProducts} sx={{ borderRadius: 1 }}>
                        Delete Selected
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Products Display - Table or Modern Cards */}
        {viewMode === 'table' ? (
          <Fade in={!loading} timeout={600}>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell padding="checkbox">
                      <Checkbox 
                        indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length} 
                        checked={products.length > 0 && selectedProducts.length === products.length} 
                        onChange={handleSelectAllClick} 
                      />
                    </TableCell>
                    <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer', fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell onClick={() => handleSort('price')} sx={{ cursor: 'pointer', fontWeight: 700 }}>Sell Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Cost Price</TableCell>
                    <TableCell onClick={() => handleSort('quantity')} sx={{ cursor: 'pointer', fontWeight: 700 }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : productsWithCategoryData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No products found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productsWithCategoryData.map((product, idx) => (
                      <Zoom in key={product.id} style={{ transitionDelay: `${idx * 20}ms` }}>
                        <TableRow 
                          hover 
                          selected={selectedProductsSet.has(product.id!)}
                          sx={{ 
                            backgroundColor: selectedProductsSet.has(product.id!) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox 
                              checked={selectedProductsSet.has(product.id!)} 
                              onChange={() => handleSelectClick(product.id!)} 
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={product.categoryName} 
                              size="small" 
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>₹{(parseFloat(product.price as any) || 0).toFixed(2)}</TableCell>
                          <TableCell>₹{(parseFloat(product.purchasePrice as any) || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ minWidth: 40 }}>{product.quantity}</Typography>
                              <Box sx={{ flex: 1, minWidth: 100 }}>
                                <LinearProgress 
                                  variant="determinate"
                                  value={Math.min((product.quantity! / (product.reorderPoint || 50)) * 100, 100)}
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.divider, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 2,
                                      backgroundColor: (product.quantity || 0) < (product.reorderPoint || 10) ? theme.palette.warning.main : theme.palette.success.main
                                    }
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={product.status} 
                              color={product.status === 'Low Stock' ? 'warning' : product.status === 'In Stock' ? 'success' : 'default'} 
                              size="small"
                              icon={product.status === 'Low Stock' ? <WarningIcon /> : <CheckCircleIcon />}
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleEditProduct(product)} size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteProduct(product.id!)} size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </Zoom>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        ) : (
          /* Modern Card Gallery View */
          <Fade in={!loading} timeout={600}>
            <Box>
              {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : productsWithCategoryData.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or add a new product
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2.5}>
                  {productsWithCategoryData.map((product, idx) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Grow in timeout={300 + idx * 50}>
                        <Card sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                          border: selectedProductsSet.has(product.id!) ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderColor: theme.palette.primary.main
                          }
                        }}>
                          {/* Header Section */}
                          <Box sx={{ 
                            p: 2, 
                            pb: 1,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                                {product.categoryName}
                              </Typography>
                              <Typography variant="h6" component="h3" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, mb: 1 }}>
                                {product.name}
                              </Typography>
                            </Box>
                            <Checkbox 
                              checked={selectedProductsSet.has(product.id!)} 
                              onChange={() => handleSelectClick(product.id!)}
                              size="small"
                              sx={{ mt: -1, mr: -1 }}
                            />
                          </Box>

                          {/* Content Section */}
                          <CardContent sx={{ flex: 1, p: 2, pb: 1 }}>
                            {/* Pricing */}
                            <Box sx={{ mb: 2.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Selling Price</Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                ₹{(parseFloat(product.price as any) || 0).toFixed(0)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Cost: ₹{(parseFloat(product.purchasePrice as any) || 0).toFixed(0)}
                              </Typography>
                            </Box>

                            {/* Stock Level Indicator */}
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Stock Level</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: (product.quantity || 0) < (product.reorderPoint || 10) ? theme.palette.warning.main : theme.palette.success.main }}>
                                  {product.quantity} units
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min((product.quantity! / Math.max(product.reorderPoint || 50, 1)) * 100, 100)}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: alpha(theme.palette.divider, 0.2),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    backgroundColor: (product.quantity || 0) < (product.reorderPoint || 10) ? theme.palette.warning.main : theme.palette.success.main
                                  }
                                }}
                              />
                            </Box>

                            {/* Status */}
                            <Chip
                              label={product.status}
                              color={product.status === 'Low Stock' ? 'warning' : product.status === 'In Stock' ? 'success' : 'default'}
                              icon={product.status === 'Low Stock' ? <WarningIcon /> : <CheckCircleIcon />}
                              size="small"
                              sx={{ width: '100%', borderRadius: 1, fontWeight: 600 }}
                            />
                          </CardContent>

                          {/* Actions */}
                          <CardActions sx={{ p: 2, pt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditProduct(product)}
                              sx={{ flex: 1, borderRadius: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteProduct(product.id!)}
                              sx={{ flex: 1, borderRadius: 1 }}
                            >
                              Delete
                            </Button>
                          </CardActions>
                        </Card>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Fade>
        )}
        
        <TablePagination 
          rowsPerPageOptions={[10, 50, 100, 1000]} 
          component="div" 
          count={totalCount} 
          rowsPerPage={rowsPerPage} 
          page={page} 
          onPageChange={handleChangePage} 
          onRowsPerPageChange={handleChangeRowsPerPage} 
          sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }} 
        />
        <Dialog open={openDialog} onClose={handleCloseDialog}><DialogTitle>{selectedProduct ? 'Edit Product' : 'Add Product'}</DialogTitle><DialogContent><TextField autoFocus margin="dense" name="name" label="Product Name" type="text" fullWidth value={newProductData.name || ''} onChange={handleInputChange} /><FormControl fullWidth margin="dense"><InputLabel>Category</InputLabel><Select name="categoryId" value={newProductData.categoryId || ''} label="Category" onChange={handleInputChange}>{categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl><TextField margin="dense" name="price" label="Selling Price (₹)" type="number" fullWidth value={newProductData.price || ''} onChange={handleInputChange} /><TextField margin="dense" name="purchasePrice" label="Purchase Price (₹)" type="number" fullWidth value={newProductData.purchasePrice || ''} onChange={handleInputChange} /><TextField margin="dense" name="quantity" label="Stock" type="number" fullWidth value={newProductData.quantity || ''} onChange={handleInputChange} /></DialogContent><DialogActions><Button onClick={handleCloseDialog}>Cancel</Button><Button onClick={handleSaveProduct}>Save</Button></DialogActions></Dialog>
        <Dialog open={bulkCategoryDialogOpen} onClose={() => setBulkCategoryDialogOpen(false)}><DialogTitle>Update Category for {selectedProducts.length} Products</DialogTitle><DialogContent><FormControl fullWidth margin="dense"><InputLabel>New Category</InputLabel><Select value={selectedBulkCategory} label="New Category" onChange={(e) => setSelectedBulkCategory(e.target.value)}>{categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl></DialogContent><DialogActions><Button onClick={() => setBulkCategoryDialogOpen(false)}>Cancel</Button><Button onClick={handleBulkCategoryChange}>Update</Button></DialogActions></Dialog>
        
        {/* Category Discount Management Dialog */}
        <Dialog 
          open={categoryDiscountDialogOpen} 
          onClose={() => setCategoryDiscountDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DiscountIcon color="primary" />
              Category Discount Management
            </Box>
            <Button 
              onClick={() => setCategoryDiscountDialogOpen(false)}
              size="small"
              color="inherit"
            >
              ✕
            </Button>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <CategoryDiscountManagement 
              onClose={() => setCategoryDiscountDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Container>
  );
}

export default function ModernProductsPage() {
  return (
    <ModernThemeProvider>
      <VisuallyEnhancedDashboardLayout
        title="Products"
        pageType="products"
        enableVisualEffects={true}
        enableParticles={false}
      >
        <ProductsPage />
      </VisuallyEnhancedDashboardLayout>
    </ModernThemeProvider>
  );
}