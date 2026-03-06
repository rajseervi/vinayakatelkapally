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
} from "@mui/material";
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

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await invoiceService.getInvoices();
        if (!mounted) return;
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
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

  const getStatus = (inv: InvoiceItem) => (inv.status || "pending").toLowerCase();

  const handleNewInvoice = () => router.push("/invoices/new");
  const handleView = (inv: InvoiceItem) => {
    const id = inv.id || inv.invoiceId || inv.invoiceNumber;
    if (id) router.push(`/invoices/${id}`);
  };

  return (
    <VisuallyEnhancedDashboardLayout title="Invoices" pageType="invoices" enableVisualEffects={true} enableParticles={false}>
      <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Invoices
        </Typography>
        <Button variant="contained" onClick={handleNewInvoice}>
          New Invoice
        </Button>
      </Box>

      {/* Controls */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by invoice # or party"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <Select
          size="small"
          value={status}
          onChange={(e: SelectChangeEvent) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="overdue">Overdue</MenuItem>
        </Select>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label="invoices">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 140 }}>Invoice #</TableCell>
                  <TableCell>Party</TableCell>
                  <TableCell sx={{ width: 140 }}>Date</TableCell>
                  <TableCell sx={{ width: 140 }} align="right">
                    Total
                  </TableCell>
                  <TableCell sx={{ width: 120 }}>Status</TableCell>
                  <TableCell sx={{ width: 120 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageItems.map((inv) => {
                  const id = inv.id || inv.invoiceId || inv.invoiceNumber || Math.random().toString(36);
                  const statusLower = getStatus(inv);
                  return (
                    <TableRow key={id} hover>
                      <TableCell>{inv.invoiceNumber || inv.invoiceId || "-"}</TableCell>
                      <TableCell>{inv.party?.name || inv.partyName || "-"}</TableCell>
                      <TableCell>{formatDate(inv.date || inv.saleDate || inv.createdAt)}</TableCell>
                      <TableCell align="right">{formatAmount(inv.total ?? inv.totalAmount)}</TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{statusLower}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => handleView(inv)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No invoices found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages} • {filtered.length} result(s)
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </Box>
          </Box>
        </>
      )}
      </Box>
    </VisuallyEnhancedDashboardLayout>
  );
}