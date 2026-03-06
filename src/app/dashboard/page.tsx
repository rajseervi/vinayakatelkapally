"use client";
import React, { useMemo, lazy, Suspense } from "react";
import { VisuallyEnhancedDashboardLayout } from "@/components/ModernLayout";
import { Box, Grid, Card, CardContent, CardHeader, Typography, Chip, Button, CircularProgress, Alert, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Stack } from "@mui/material";
import { TrendingUp, Inventory, People, Receipt, Add as AddIcon, Refresh as RefreshIcon, Warning as WarningIcon, FileDownload as DownloadIcon, MoreVert as MoreIcon } from "@mui/icons-material";
import { useDashboard } from "@/hooks/useDashboard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3f51b5', '#f57c00', '#388e3c', '#d32f2f', '#7b1fa2'];

const StatCard = React.memo(function StatCard({ 
  title, 
  value, 
  delta, 
  icon, 
  loading = false, 
  warning = false,
  color = 'primary'
}: { 
  title: string; 
  value: string | number; 
  delta?: string; 
  icon: React.ReactNode;
  loading?: boolean;
  warning?: boolean;
  color?: string;
}) {
  return (
    <Card sx={{ height: "100%", background: loading ? 'transparent' : undefined }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {warning && <WarningIcon color="warning" fontSize="small" />}
            {icon}
          </Box>
        </Box>
        {loading ? (
          <Skeleton variant="text" sx={{ fontSize: "2.5rem", width: "70%", mb: 1 }} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{value}</Typography>
        )}
        {delta && !loading && (
          <Chip
            label={delta}
            size="small"
            color={delta.startsWith("+") ? "success" : delta.startsWith("-") ? "error" : "default"}
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
});

const TopProductsTable = React.memo(function TopProductsTable({ products, loading }: any) {
  return (
    <Card>
      <CardHeader title="Top Products" subheader="By Revenue" titleTypographyProps={{ variant: 'h6' }} />
      <Divider />
      <TableContainer>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Box>
        ) : products?.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="right"><strong>Sales</strong></TableCell>
                <TableCell align="right"><strong>Revenue</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product: any, idx: number) => (
                <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                      <Typography variant="body2">{product.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2">{product.sales}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>₹{product.revenue.toLocaleString('en-IN')}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No data available</Typography>
          </Box>
        )}
      </TableContainer>
    </Card>
  );
});

const TopPartiesTable = React.memo(function TopPartiesTable({ parties, loading }: any) {
  return (
    <Card>
      <CardHeader title="Top Customers" subheader="By Total Spent" titleTypographyProps={{ variant: 'h6' }} />
      <Divider />
      <TableContainer>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Box>
        ) : parties?.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell align="right"><strong>Orders</strong></TableCell>
                <TableCell align="right"><strong>Total Spent</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parties.map((party: any, idx: number) => (
                <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                      <Typography variant="body2">{party.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2">{party.orders}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>₹{party.totalSpent.toLocaleString('en-IN')}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No data available</Typography>
          </Box>
        )}
      </TableContainer>
    </Card>
  );
});

const ChartSkeleton = React.memo(function ChartSkeleton() {
  return (
    <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
});

export default function DashboardPage() {
  const { data, loading, error, refresh, isStale } = useDashboard(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const exportDashboardData = () => {
    if (!data) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      monthlyRevenue: data.monthlyRevenue,
      totalOrders: data.totalOrders,
      activeProducts: data.activeProducts,
      activeParties: data.activeParties,
      averageOrderValue: data.averageOrderValue,
      topProducts: data.topProducts,
      topParties: data.topParties
    };
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2)));
    element.setAttribute('download', `dashboard-export-${new Date().toISOString().substring(0, 10)}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <VisuallyEnhancedDashboardLayout 
      title="Dashboard v1.0" 
      pageType="dashboard"
      enableVisualEffects={true}
      enableParticles={false}
    >
      <Box>
        {/* Quick Actions Section */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardHeader 
            title="Quick Actions" 
            titleTypographyProps={{ variant: 'h6', sx: { color: 'white', fontWeight: 700 } }}
            sx={{ pb: 1 }}
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth
                  variant="contained" 
                  startIcon={<AddIcon />}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: 'white' }
                  }}
                  href="/invoices/new"
                >
                  Add Invoice
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth
                  variant="contained"
                  startIcon={<People />}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: 'white' }
                  }}
                  href="/customers/new"
                >
                  Add Party
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth
                  variant="contained"
                  startIcon={<Receipt />}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: 'white' }
                  }}
                  href="/invoices"
                >
                  View Invoices
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert 
            severity={error.includes('fallback') ? 'warning' : 'error'} 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={refresh}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Main Stats Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Monthly Revenue" 
              value={data ? formatCurrency(data.monthlyRevenue.current) : "₹0"} 
              delta={data ? formatGrowth(data.monthlyRevenue.growth) : undefined}
              icon={<TrendingUp color="primary" />}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Orders" 
              value={data ? data.totalOrders.count : 0} 
              delta={data ? formatGrowth(data.totalOrders.growth) : undefined}
              icon={<Receipt color="info" />}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Avg Order Value" 
              value={data ? formatCurrency(data.averageOrderValue) : "₹0"} 
              icon={<TrendingUp color="success" />}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Active Products" 
              value={data ? data.activeProducts.count : 0}
              icon={<Inventory color="warning" />}
              loading={loading}
              warning={data ? data.activeProducts.lowStock > 0 : false}
            />
          </Grid>
        </Grid>

        {/* Control Bar */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 3 }}>
          <Button variant="contained" startIcon={<AddIcon />} size="small">New Invoice</Button>
          <Button variant="outlined" size="small">Import Products</Button>
          <Button variant="outlined" size="small">View Reports</Button>
          <Button 
            variant={isStale ? "contained" : "outlined"} 
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={refresh}
            disabled={loading}
            color={isStale ? "warning" : "primary"}
            size="small"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={exportDashboardData}
            disabled={!data}
            size="small"
          >
            Export
          </Button>
          {data && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Revenue Trend" subheader="Last 6 Months" titleTypographyProps={{ variant: 'h6' }} />
              <Divider />
              <CardContent>
                {loading ? (
                  <ChartSkeleton />
                ) : data?.revenueByMonth && data.revenueByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3f51b5" strokeWidth={2} dot={{ fill: '#3f51b5' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No data available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Key Metrics" titleTypographyProps={{ variant: 'h6' }} />
              <Divider />
              <CardContent>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Active Parties</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{data?.activeParties.count || 0}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Low Stock Products</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: data?.activeProducts.lowStock > 0 ? '#d32f2f' : 'inherit' }}>
                        {data?.activeProducts.lowStock || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Recent Parties (30d)</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{data?.activeParties.recent || 0}</Typography>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Tables Row */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TopProductsTable products={data?.topProducts} loading={loading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopPartiesTable parties={data?.topParties} loading={loading} />
          </Grid>
        </Grid>
      </Box>
    </VisuallyEnhancedDashboardLayout>
  );
}