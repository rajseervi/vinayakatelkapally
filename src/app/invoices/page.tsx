"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  alpha,
  useTheme,
  Skeleton
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { invoiceService } from "@/services/invoiceService";
import { VisuallyEnhancedDashboardLayout } from "@/components/ModernLayout";

// Lightweight Invoices Page
// - Minimal UI, no heavy widgets/animations
// - Simple client-side search, filter, and pagination
// - Small MUI surface usage to reduce bundle size

interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  party?: { name?: string } | null;
  partyName?: string;
  date?: string;
  saleDate?: string;
  createdAt?: string;
  total?: number;
  totalAmount?: number;
  status?: "paid" | "pending" | "overdue" | string;
}

const PAGE_SIZE = 20;

export default function InvoicesPage() {
  const router = useRouter();
  const theme = useTheme();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const list = await invoiceService.getInvoices();
      // Basic sort by date desc if available
      const sorted = [...list].sort((a: InvoiceItem, b: InvoiceItem) => {
        const da = new Date(a.createdAt || a.saleDate || a.date || 0).getTime();
        const db = new Date(b.createdAt || b.saleDate || b.date || 0).getTime();
        return db - da;
      });
      setInvoices(sorted);
      setError(null);
    } catch (e: any) {
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const paidCount = invoices.filter((inv) => (inv.status || "pending").toLowerCase() === "paid").length;
    const pendingCount = invoices.filter((inv) => (inv.status || "pending").toLowerCase() === "pending").length;
    const overdueCount = invoices.filter((inv) => (inv.status || "pending").toLowerCase() === "overdue").length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || inv.totalAmount || 0), 0);
    const pendingAmount = invoices
      .filter((inv) => (inv.status || "pending").toLowerCase() !== "paid")
      .reduce((sum, inv) => sum + (inv.total || inv.totalAmount || 0), 0);

    return { totalCount, paidCount, pendingCount, overdueCount, totalRevenue, pendingAmount };
  }, [invoices]);

  // Derived list (filtered + searched)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      const number = (inv.invoiceNumber || inv.invoiceId || "").toString().toLowerCase();
      const party = (inv.party?.name || inv.partyName || "").toLowerCase();
      const matchesQuery = q ? number.includes(q) || party.includes(q) : true;
      const s = (inv.status || "pending").toLowerCase();
      const matchesStatus = status === "all" ? true : s === status;
      return matchesQuery && matchesStatus;
    });
  }, [invoices, query, status]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  const formatAmount = (n?: number) => {
    const v = typeof n === "number" ? n : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v);
  };

  const getStatusChip = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    let color: "success" | "warning" | "error" | "default" = "default";

    if (s === "paid") color = "success";
    else if (s === "pending") color = "warning";
    else if (s === "overdue") color = "error";

    return (
      <Chip
        label={s.toUpperCase()}
        size="small"
        color={color}
        sx={{ fontWeight: 600, fontSize: "0.65rem", height: 20 }}
      />
    );
  };

  const formatInvoiceNumber = (num?: string) => {
    if (!num) return "-";
    if (num.startsWith("DC-")) return num;
    if (num.startsWith("INV-")) return num.replace("INV-", "DC-");
    return num.length < 10 ? `DC-${num}` : num;
  };

  const handleNewInvoice = () => router.push("/invoices/new");
  const handleView = (inv: InvoiceItem) => {
    const id = inv.id || inv.invoiceId || inv.invoiceNumber;
    if (id) router.push(`/invoices/${id}`);
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ height: "100%", boxShadow: "none", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <VisuallyEnhancedDashboardLayout title="Invoice Management" pageType="invoices" enableVisualEffects={true} enableParticles={false}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
        {/* Page Header */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", mb: 4, gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary", letterSpacing: -0.5 }}>
              Invoices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your sales documents and track payments
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchInvoices}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewInvoice}
              sx={{ borderRadius: 2, textTransform: "none", px: 3, boxShadow: 2 }}
            >
              New Invoice
            </Button>
          </Stack>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={formatAmount(stats.totalRevenue)}
              icon={<TrendingUpIcon />}
              color={theme.palette.primary.main}
              subtitle={`${stats.totalCount} invoices generated`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Pending"
              value={formatAmount(stats.pendingAmount)}
              icon={<PaymentIcon />}
              color={theme.palette.warning.main}
              subtitle={`${stats.pendingCount} unpaid invoices`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Paid Invoices"
              value={stats.paidCount}
              icon={<ReceiptIcon />}
              color={theme.palette.success.main}
              subtitle="Successfully settled"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Overdue"
              value={stats.overdueCount}
              icon={<WarningIcon />}
              color={theme.palette.error.main}
              subtitle="Immediate action required"
            />
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Card sx={{ mb: 3, boxShadow: "none", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Box sx={{ p: 2, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by invoice number or party name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
              <Select
                size="small"
                value={status}
                onChange={(e: SelectChangeEvent) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 150, borderRadius: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </Stack>
          </Box>
        </Card>

        {/* Table Content */}
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          {loading ? (
            <Box sx={{ p: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : error ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <WarningIcon sx={{ fontSize: 48, color: "error.light", mb: 2 }} />
              <Typography variant="h6" gutterBottom>{error}</Typography>
              <Button variant="outlined" onClick={fetchInvoices}>Try Again</Button>
            </Box>
          ) : (
            <Table sx={{ minWidth: 800 }} aria-label="invoice table">
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Party Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageItems.map((inv) => {
                  const id = inv.id || inv.invoiceId || inv.invoiceNumber || Math.random().toString(36);
                  return (
                    <TableRow key={id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                        {formatInvoiceNumber(inv.invoiceNumber || inv.invoiceId)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {inv.party?.name || inv.partyName || "Unknown Party"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {formatDate(inv.date || inv.saleDate || inv.createdAt)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatAmount(inv.total ?? inv.totalAmount)}
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(inv.status)}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleView(inv)} sx={{ color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <IconButton size="small">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <ReceiptIcon sx={{ fontSize: 64, mb: 2 }} />
                        <Typography variant="h6">No invoices found</Typography>
                        <Typography variant="body2">Try adjusting your filters or search query</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination Footer */}
          {!loading && filtered.length > 0 && (
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Showing {Math.min(filtered.length, (currentPage - 1) * PAGE_SIZE + 1)} to {Math.min(filtered.length, currentPage * PAGE_SIZE)} of {filtered.length} invoices
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  sx={{ borderRadius: 1.5, textTransform: "none" }}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  sx={{ borderRadius: 1.5, textTransform: "none" }}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          )}
        </TableContainer>
      </Box>
    </VisuallyEnhancedDashboardLayout>
  );
}