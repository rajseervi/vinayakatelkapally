"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  Menu,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Fade,
  Zoom,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Badge,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  FileCopy as FileCopyIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { doc, getDoc, deleteDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { VisuallyEnhancedDashboardLayout } from '@/components/ModernLayout';
import ModernThemeProvider from '@/contexts/ModernThemeContext';
import SimpleInvoiceService from '@/services/simpleInvoiceService';
import { Invoice } from '@/types/invoice_no_gst';
import Link from 'next/link';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Enhanced Print Dialog Component
interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  invoice: Invoice;
}

const EnhancedPrintDialog: React.FC<PrintDialogProps> = ({ open, onClose, invoiceId, invoice }) => {
  const [printSettings, setPrintSettings] = useState({
    template: 'modern',
    paperSize: 'A4',
    orientation: 'portrait',
    includeHeader: true,
    includeFooter: true,
    showWatermark: false,
    copies: 2,
    colorMode: 'color',
    leftWidth: 50,
    rightWidth: 50,
    gapWidth: 12,
    equalWidth: true,
    // Enhanced print settings
    copyType: 'original' as 'original' | 'duplicate' | 'triplicate' | 'all',
    singlePageOptimization: true,
    autoScale: true,
    marginType: 'normal' as 'minimal' | 'normal' | 'wide',
    printQuality: 'high' as 'draft' | 'normal' | 'high',
    pageBreaks: 'auto' as 'auto' | 'force' | 'avoid',
    showBorders: false,
    compactMode: false,
    fontSize: 'normal' as 'small' | 'normal' | 'large'
  });
  const [printing, setPrinting] = useState(false);
  const router = useRouter();

  const handlePrint = async (action: 'print' | 'preview' | 'download') => {
    setPrinting(true);
    try {
      const params = new URLSearchParams({
        template: printSettings.template,
        paperSize: printSettings.paperSize,
        orientation: printSettings.orientation,
        includeHeader: printSettings.includeHeader.toString(),
        includeFooter: printSettings.includeFooter.toString(),
        showWatermark: printSettings.showWatermark.toString(),
        copies: printSettings.copies.toString(),
        colorMode: printSettings.colorMode,
        // Enhanced parameters
        copyType: printSettings.copyType,
        singlePageOptimization: printSettings.singlePageOptimization.toString(),
        autoScale: printSettings.autoScale.toString(),
        marginType: printSettings.marginType,
        printQuality: printSettings.printQuality,
        pageBreaks: printSettings.pageBreaks,
        showBorders: printSettings.showBorders.toString(),
        compactMode: printSettings.compactMode.toString(),
        fontSize: printSettings.fontSize,
        action
      });

      // Handle dual-classic template specially
      if (printSettings.template === 'dual-classic') {
        if (action === 'preview') {
          window.open(`/invoices/${invoiceId}/print/dual-classic`, '_blank');
        } else if (action === 'download') {
          window.open(`/invoices/${invoiceId}/print/dual-classic?download=true`, '_blank');
        } else {
          // Direct print - Open in print mode without auto-triggering print dialog
          window.open(`/invoices/${invoiceId}/print/dual-classic`, '_blank');
        }
      } else if (printSettings.template === 'printable-dual') {
        // Handle PrintableInvoiceDual template with width settings
        const dualParams = new URLSearchParams({
          leftWidth: printSettings.leftWidth.toString(),
          rightWidth: printSettings.rightWidth.toString(),
          gapWidth: printSettings.gapWidth.toString(),
          equalWidth: printSettings.equalWidth.toString(),
          colorMode: printSettings.colorMode,
          orientation: printSettings.orientation
        });
        
        if (action === 'preview') {
          window.open(`/invoices/${invoiceId}/print/printable-dual?${dualParams.toString()}`, '_blank');
        } else if (action === 'download') {
          window.open(`/invoices/${invoiceId}/print/printable-dual?${dualParams.toString()}&download=true`, '_blank');
        } else {
          // Direct print - Open in print mode without auto-triggering print dialog
          window.open(`/invoices/${invoiceId}/print/printable-dual?${dualParams.toString()}`, '_blank');
        }
      } else {
        // Handle other templates
        if (action === 'preview') {
          window.open(`/invoices/${invoiceId}/print/enhanced?${params.toString()}`, '_blank');
        } else if (action === 'download') {
          window.open(`/invoices/${invoiceId}/print/enhanced?${params.toString()}&download=true`, '_blank');
        } else {
          // Direct print - Open in print mode without auto-triggering print dialog
          window.open(`/invoices/${invoiceId}/print/enhanced?${params.toString()}`, '_blank');
        }
      }
      onClose();
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: 1, 
              backgroundColor: 'rgba(255,255,255,0.2)' 
            }}>
              <PrintIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Enhanced Print Settings
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Advanced options for perfect printing • Invoice #{invoice?.invoiceNumber || invoiceId}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)' 
              }
            }}
          >
            <ErrorIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={printSettings.template}
                label="Template"
                onChange={(e) => {
                  const newTemplate = e.target.value;
                  setPrintSettings(prev => ({ 
                    ...prev, 
                    template: newTemplate,
                    // Auto-set landscape for dual templates for better space utilization
                    orientation: (newTemplate === 'dual-classic' || newTemplate === 'printable-dual') ? 'landscape' : prev.orientation
                  }))
                }}
              >
                <MenuItem value="modern">Modern Template</MenuItem>
                <MenuItem value="classic">Classic Template</MenuItem>
                <MenuItem value="minimal">Minimal Template</MenuItem>
                <MenuItem value="thermal">Thermal Receipt</MenuItem>
                <MenuItem value="dualapp">Dual Format</MenuItem>
                <MenuItem value="dual-classic">Dual Classic (Original + Duplicate)</MenuItem>
                <MenuItem value="printable-dual">PrintableInvoiceDual (Side by Side)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Paper Size</InputLabel>
              <Select
                value={printSettings.paperSize}
                label="Paper Size"
                onChange={(e) => setPrintSettings(prev => ({ ...prev, paperSize: e.target.value }))}
              >
                <MenuItem value="A4">A4</MenuItem>
                <MenuItem value="A5">A5</MenuItem>
                <MenuItem value="Letter">Letter</MenuItem>
                <MenuItem value="Thermal">Thermal (80mm)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Orientation</InputLabel>
              <Select
                value={printSettings.orientation}
                label="Orientation"
                onChange={(e) => setPrintSettings(prev => ({ ...prev, orientation: e.target.value }))}
              >
                <MenuItem value="portrait">Portrait</MenuItem>
                <MenuItem value="landscape">Landscape</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Color Mode</InputLabel>
              <Select
                value={printSettings.colorMode}
                label="Color Mode"
                onChange={(e) => setPrintSettings(prev => ({ ...prev, colorMode: e.target.value }))}
              >
                <MenuItem value="color">Color</MenuItem>
                <MenuItem value="grayscale">Grayscale</MenuItem>
                <MenuItem value="blackwhite">Black & White</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeHeader}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, includeHeader: e.target.checked }))}
                  />
                }
                label="Include Header"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeFooter}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, includeFooter: e.target.checked }))}
                  />
                }
                label="Include Footer"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.showWatermark}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, showWatermark: e.target.checked }))}
                  />
                }
                label="Show Watermark"
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Typography gutterBottom>Number of Copies: {printSettings.copies}</Typography>
            <Box sx={{ px: 2 }}>
              <input
                type="range"
                min="1"
                max="10"
                value={printSettings.copies}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, copies: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </Box>
          </Grid>

          {/* Enhanced Print Settings Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>
              <Chip 
                icon={<SettingsIcon />} 
                label="Advanced Settings" 
                color="primary" 
                variant="outlined" 
                size="small"
              />
            </Divider>
          </Grid>
          
          {/* Copy Type Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Copy Type</InputLabel>
              <Select
                value={printSettings.copyType}
                label="Copy Type"
                onChange={(e) => setPrintSettings(prev => ({ ...prev, copyType: e.target.value as any }))}
              >
                <MenuItem value="original">📋 Original for Recipient</MenuItem>
                <MenuItem value="duplicate">📄 Duplicate for Supplier</MenuItem>
                <MenuItem value="triplicate">🚛 Triplicate for Transporter</MenuItem>
                <MenuItem value="all">📋📄🚛 All Copies</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Print Quality */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Print Quality</InputLabel>
              <Select
                value={printSettings.printQuality}
                label="Print Quality"
                onChange={(e) => setPrintSettings(prev => ({ ...prev, printQuality: e.target.value as any }))}
              >
                <MenuItem value="draft">💡 Draft (Fast, Lower Ink)</MenuItem>
                <MenuItem value="normal">📄 Normal (Balanced)</MenuItem>
                <MenuItem value="high">⭐ High (Best Quality)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Font Size */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Font Size</InputLabel>
              <Select
                value={printSettings.fontSize}
                label="Font Size"
                onChange={(e) => setPrintSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
              >
                <MenuItem value="small">🔍 Small (Fit More Content)</MenuItem>
                <MenuItem value="normal">📰 Normal (Standard)</MenuItem>
                <MenuItem value="large">🔎 Large (Better Readability)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Margin Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Margins</InputLabel>
              <Select
                value={printSettings.marginType}
                label="Margins"
                onChange={(e) => setPrintSettings(prev => ({ ...prev, marginType: e.target.value as any }))}
              >
                <MenuItem value="minimal">📏 Minimal (Max Content)</MenuItem>
                <MenuItem value="normal">📐 Normal (Balanced)</MenuItem>
                <MenuItem value="wide">📖 Wide (More Spacing)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Advanced Toggles */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.singlePageOptimization}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, singlePageOptimization: e.target.checked }))}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      📄 Single Page Optimization
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Auto-scale content to fit exactly one page
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.autoScale}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, autoScale: e.target.checked }))}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      🔧 Auto Scale Content
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically adjust size to fit page bounds
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.compactMode}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, compactMode: e.target.checked }))}
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      🗜️ Compact Mode
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reduce spacing and padding for more content
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.showBorders}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, showBorders: e.target.checked }))}
                    color="secondary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      🖼️ Show Borders & Guidelines
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Display borders and guides (preview only)
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Grid>

          {/* Print Optimization Info */}
          {printSettings.singlePageOptimization && (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>✅ Single Page Mode Active:</strong> Content will automatically scale to fit perfectly on one page. 
                  {printSettings.autoScale && " Auto-scaling is enabled for optimal results."}
                  {printSettings.compactMode && " Compact mode will reduce spacing for maximum content."}
                </Typography>
              </Alert>
            </Grid>
          )}
          
          {/* Dual Classic Template Info */}
          {printSettings.template === 'dual-classic' && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Dual Classic Template:</strong> This will print both Original (for recipient) and Duplicate (for supplier) copies side by side on one A4 page in landscape orientation. Perfect for maintaining records while providing customer copies.
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* PrintableInvoiceDual Template Info & Width Controls */}
          {printSettings.template === 'printable-dual' && (
            <>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>PrintableInvoiceDual Template:</strong> Side-by-side layout with customizable widths. Original and Duplicate copies can have different widths for optimal space utilization.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={printSettings.equalWidth}
                      onChange={(e) => setPrintSettings(prev => ({ ...prev, equalWidth: e.target.checked }))}
                    />
                  }
                  label="Equal Width (50/50)"
                />
              </Grid>

              {!printSettings.equalWidth && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Original Width: {printSettings.leftWidth}%
                    </Typography>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={printSettings.leftWidth}
                      onChange={(e) => {
                        const leftWidth = parseInt(e.target.value);
                        const rightWidth = Math.min(100 - leftWidth, 80);
                        setPrintSettings(prev => ({ 
                          ...prev, 
                          leftWidth,
                          rightWidth: Math.max(rightWidth, 20)
                        }));
                      }}
                      style={{ width: '100%' }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Duplicate Width: {printSettings.rightWidth}%
                    </Typography>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={printSettings.rightWidth}
                      onChange={(e) => {
                        const rightWidth = parseInt(e.target.value);
                        const leftWidth = Math.min(100 - rightWidth, 80);
                        setPrintSettings(prev => ({ 
                          ...prev, 
                          rightWidth,
                          leftWidth: Math.max(leftWidth, 20)
                        }));
                      }}
                      style={{ width: '100%' }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  Gap Width: {printSettings.gapWidth}px
                </Typography>
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="2"
                  value={printSettings.gapWidth}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, gapWidth: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        {/* Settings Summary */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            Current Settings:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            <Chip 
              size="small" 
              label={`${printSettings.template} template`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              size="small" 
              label={`${printSettings.paperSize} ${printSettings.orientation}`} 
              color="default" 
              variant="outlined" 
            />
            <Chip 
              size="small" 
              label={`${printSettings.copies} ${printSettings.copies === 1 ? 'copy' : 'copies'}`} 
              color="secondary" 
              variant="outlined" 
            />
            {printSettings.singlePageOptimization && (
              <Chip 
                size="small" 
                label="Single Page" 
                color="success" 
                variant="outlined"
                icon={<CheckCircleIcon fontSize="small" />}
              />
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button 
            onClick={onClose}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handlePrint('preview')}
            startIcon={<VisibilityIcon />}
            disabled={printing}
            variant="outlined"
            color="primary"
          >
            Preview
          </Button>
          <Button
            onClick={() => handlePrint('download')}
            startIcon={<PdfIcon />}
            disabled={printing}
            variant="outlined"
            color="secondary"
          >
            PDF
          </Button>
          <Button
            onClick={() => handlePrint('print')}
            startIcon={printing ? <CircularProgress size={16} color="inherit" /> : <PrintIcon />}
            variant="contained"
            color="primary"
            disabled={printing}
            sx={{ minWidth: '120px' }}
          >
            {printing ? 'Printing...' : 'Print Now'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, index, value, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export default function EnhancedInvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState<null | HTMLElement>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [relatedInvoices, setRelatedInvoices] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // Memoized calculations
  const invoiceStats = useMemo(() => {
    if (!invoice) return null;
    
    return {
      totalItems: invoice.items?.length || 0,
      totalQuantity: invoice.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
      averageItemValue: invoice.items?.length ? (invoice.subtotal || 0) / invoice.items.length : 0,
      discountPercentage: invoice.subtotal ? ((invoice.totalDiscount || 0) / invoice.subtotal) * 100 : 0,
      profitMargin: invoice.subtotal ? ((invoice.totalAmount || 0) - (invoice.subtotal || 0)) / (invoice.subtotal || 0) * 100 : 0
    };
  }, [invoice]);

  // Fetch invoice data with error handling and retry logic
  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('Invoice ID is missing');
        return;
      }

      const invoiceData = await SimpleInvoiceService.getInvoiceById(id as string);
      
      if (!invoiceData) {
        setError('Invoice not found');
        return;
      }

      setInvoice(invoiceData);
      
      // Fetch related data in parallel
      await Promise.all([
        fetchRelatedInvoices(invoiceData.partyId),
        fetchPaymentHistory(invoiceData.id!)
      ]);
      
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch related invoices for the same party
  const fetchRelatedInvoices = async (partyId: string) => {
    try {
      if (!partyId) return;
      
      const invoicesQuery = query(
        collection(db, 'invoices'),
        where('partyId', '==', partyId),
        where('id', '!=', id),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(invoicesQuery);
      const related = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setRelatedInvoices(related);
    } catch (error) {
      console.error('Error fetching related invoices:', error);
    }
  };

  // Fetch payment history
  const fetchPaymentHistory = async (invoiceId: string) => {
    try {
      // This would typically fetch from a payments collection
      // For now, we'll simulate some payment data
      setPaymentHistory([]);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleEdit = () => {
    if (invoice) {
      router.push(`/invoices/${invoice.id}/edit`);
    }
  };

  const handleDelete = () => {
    setOpenConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setOpenConfirmDelete(false);
    if (!invoice) return;

    try {
      const result = await SimpleInvoiceService.deleteInvoice(invoice.id!, true);
      if (result.success) {
        setSuccessMessage('Invoice deleted successfully');
        setTimeout(() => {
          router.push('/invoices');
        }, 2000);
      } else {
        setError(result.errors?.join(', ') || 'Failed to delete invoice');
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
    }
  };

  const handleDuplicate = () => {
    if (invoice) {
      router.push(`/invoices/create?duplicate=${invoice.id}`);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!invoice) return;

    try {
      const result = await SimpleInvoiceService.updateInvoice(invoice.id!, { status });
      if (result.success) {
        setSuccessMessage(`Invoice status updated to ${status}`);
        setInvoice(prev => prev ? { ...prev, status } : null);
      } else {
        setError(result.errors?.join(', ') || 'Failed to update invoice status');
      }
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError('Failed to update invoice status');
    }
  };

  const handleShare = (method: string) => {
    setShareMenuAnchor(null);
    
    if (method === 'email') {
      const subject = `Invoice ${invoice?.invoiceNumber}`;
      const body = `Please find attached invoice ${invoice?.invoiceNumber} for ₹${invoice?.totalAmount?.toLocaleString()}.`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else if (method === 'whatsapp') {
      const message = `Invoice ${invoice?.invoiceNumber} for ₹${invoice?.totalAmount?.toLocaleString()} is ready. View: ${window.location.href}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } else if (method === 'download') {
      window.open(`/invoices/${id}/print/enhanced?download=true&template=modern`);
    }
  };

  const handleCopyInvoiceNumber = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice.invoiceNumber);
      setSuccessMessage('Invoice number copied to clipboard');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setSuccessMessage('Invoice link copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'error';
      case 'partial': return 'warning';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  // Enhanced header with better actions
  const PageHeader = () => (
    <Fade in timeout={800}>
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        p: 3,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Button
                component={Link}
                href="/invoices"
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                size="small"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  mb: 2,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Back to Invoices
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Zoom in timeout={1000}>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    p: 1.5,
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <ReceiptIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Zoom>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Invoice Details
                  </Typography>
                  {!loading && invoice && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        {invoice.invoiceNumber}
                      </Typography>
                      <Tooltip title="Copy invoice number">
                        <IconButton
                          size="small"
                          onClick={handleCopyInvoiceNumber}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy invoice link">
                        <IconButton
                          size="small"
                          onClick={handleCopyLink}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {!loading && invoice && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Tooltip title="Edit invoice">
                  <Button
                    onClick={handleEdit}
                    startIcon={<EditIcon />}
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Edit
                  </Button>
                </Tooltip>

                <Tooltip title="Print options">
                  <Button
                    onClick={() => setPrintDialogOpen(true)}
                    startIcon={<PrintIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Print
                  </Button>
                </Tooltip>
 

                <Tooltip title="More options">
                  <IconButton
                    onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>

          {/* Enhanced Status Chips */}
          {!loading && invoice && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`Status: ${invoice.status?.toUpperCase() || 'DRAFT'}`}
                color={getStatusColor(invoice.status || 'draft') as any}
                variant="outlined"
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }}
              />
              <Chip
                label={`Payment: ${invoice.paymentStatus?.toUpperCase() || 'PENDING'}`}
                color={getPaymentStatusColor(invoice.paymentStatus || 'pending') as any}
                variant="outlined"
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }}
              />
              <Chip
                label={`Type: ${invoice.type?.toUpperCase() || 'SALES'}`}
                variant="outlined"
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }}
              />
              {invoiceStats && (
                <Chip
                  label={`${invoiceStats.totalItems} Items`}
                  variant="outlined"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.3)',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }}
                />
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Fade>
  );

  // Enhanced overview with more metrics
  const InvoiceOverview = () => (
    <Fade in timeout={1000}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Financial Summary</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                ₹{invoice?.totalAmount?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Subtotal: ₹{invoice?.subtotal?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Discount: ₹{invoice?.totalDiscount?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Balance: ₹{invoice?.balanceAmount?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Timeline</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Invoice Date:</strong> {invoice?.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
              </Typography>
              {invoice?.dueDate && (
                <Typography variant="body1" gutterBottom>
                  <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Created: {invoice?.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
              {invoice?.updatedAt && (
                <Typography variant="body2" color="text.secondary">
                  Updated: {new Date(invoice.updatedAt).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Party Details</Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                {invoice?.partyName || 'N/A'}
              </Typography>
              {invoice?.partyPhone && (
                <Typography variant="body2" color="text.secondary">
                  Phone: {invoice.partyPhone}
                </Typography>
              )}
              {invoice?.partyEmail && (
                <Typography variant="body2" color="text.secondary">
                  Email: {invoice.partyEmail}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {invoice?.type === 'sales' ? 'Customer' : 'Supplier'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Statistics</Typography>
              </Box>
              {invoiceStats && (
                <>
                  <Typography variant="body2" gutterBottom>
                    <strong>Items:</strong> {invoiceStats.totalItems}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Quantity:</strong> {invoiceStats.totalQuantity}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Avg. Value:</strong> ₹{invoiceStats.averageItemValue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Discount:</strong> {invoiceStats.discountPercentage.toFixed(1)}%
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fade>
  );

  // Enhanced tabbed content
  const TabbedContent = () => (
    <Card sx={{ mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon fontSize="small" />
                Items ({invoice?.items?.length || 0})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon fontSize="small" />
                Payments
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon fontSize="small" />
                Related ({relatedInvoices.length})
              </Box>
            } 
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="right"><strong>Qty</strong></TableCell>
                <TableCell align="right"><strong>Unit</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell align="right"><strong>Discount</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!invoice?.items || invoice.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 4 }}>
                      <InventoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No items found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                invoice.items.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {item.name || item.productName || 'N/A'}
                        </Typography>
                        {item.description && (
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={item.quantity || 0} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.unitOfMeasurement || 'PCS'}
                    </TableCell>
                    <TableCell align="right">₹{(item.price || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {item.discount > 0 && (
                        <Chip
                          label={item.discountType === 'percentage' ? `${item.discount}%` : `₹${item.discount}`}
                          size="small"
                          color="secondary"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        ₹{(item.totalAmount || item.finalPrice || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PaymentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Payment History
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Payment tracking feature coming soon
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {relatedInvoices.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Related Invoices
            </Typography>
            <Typography variant="body2" color="text.disabled">
              No other invoices found for this party
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {relatedInvoices.map((relatedInvoice) => (
              <Grid item xs={12} md={6} key={relatedInvoice.id}>
                <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => router.push(`/invoices/${relatedInvoice.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {relatedInvoice.invoiceNumber}
                      </Typography>
                      <Chip 
                        label={relatedInvoice.status || 'draft'} 
                        size="small" 
                        color={getStatusColor(relatedInvoice.status || 'draft') as any}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {relatedInvoice.date ? new Date(relatedInvoice.date).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{relatedInvoice.totalAmount?.toLocaleString() || '0'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </Card>
  );

  if (loading) {
    return (
      <ModernThemeProvider>
        <VisuallyEnhancedDashboardLayout
          title="Invoice Details"
          pageType="invoices"
          enableVisualEffects={true}
          enableParticles={true}
        >
          <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid item xs={12} md={3} key={i}>
                    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </VisuallyEnhancedDashboardLayout>
      </ModernThemeProvider>
    );
  }

  if (error || !invoice) {
    return (
      <ModernThemeProvider>
        <VisuallyEnhancedDashboardLayout
          title="Invoice Details"
          pageType="invoices"
          enableVisualEffects={true}
          enableParticles={false}
        >
          <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center'
            }}>
              <Avatar sx={{ bgcolor: 'error.light', width: 80, height: 80, mb: 3 }}>
                <ErrorIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography variant="h5" color="text.primary" gutterBottom fontWeight="bold">
                Unable to Load Invoice
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                {error || 'The invoice you\'re looking for could not be found or there was an error loading it.'}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  href="/invoices"
                  startIcon={<ArrowBackIcon />}
                  variant="contained"
                  size="large"
                >
                  Return to Invoices
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outlined"
                  size="large"
                >
                  Try Again
                </Button>
              </Stack>
            </Box>
          </Container>
        </VisuallyEnhancedDashboardLayout>
      </ModernThemeProvider>
    );
  }

  return (
    <ModernThemeProvider>
      <VisuallyEnhancedDashboardLayout
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={`${invoice.partyName} • ₹${invoice.totalAmount?.toLocaleString()}`}
        showBreadcrumbs={true} 
        pageHeaderActions={
          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleEdit}
              startIcon={<EditIcon />}
              variant="outlined"
              size="small"
            >
              Edit
            </Button>
            <Button
              onClick={() => setPrintDialogOpen(true)}
              startIcon={<PrintIcon />}
              variant="contained"
              size="small"
            >
              Print
            </Button>
            <Button
              onClick={() => window.open(`/invoices/${id}/print/printable-dual`, '_blank')}
              startIcon={<ReceiptIcon />}
              variant="outlined"
              size="small"
              sx={{ 
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              Side by Side
            </Button>
          </Stack>
        }
      >
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', pb: 4 }}>
          <Container maxWidth="xl" sx={{ pt: 2 }}>
            <PageHeader />
            <InvoiceOverview />
            <TabbedContent />

            {/* Additional Notes */}
            {invoice?.notes && (
              <Fade in timeout={1400}>
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EditIcon color="primary" />
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {invoice.notes}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            )}

            {/* Enhanced Print Dialog */}
            <EnhancedPrintDialog
              open={printDialogOpen}
              onClose={() => setPrintDialogOpen(false)}
              invoiceId={id as string}
              invoice={invoice}
            />

            {/* Share Menu */}
            <Menu
              anchorEl={shareMenuAnchor}
              open={Boolean(shareMenuAnchor)}
              onClose={() => setShareMenuAnchor(null)}
            >
              <MenuItem onClick={() => handleShare('email')}>
                <EmailIcon sx={{ mr: 1 }} />
                Email
              </MenuItem>
              <MenuItem onClick={() => handleShare('whatsapp')}>
                <WhatsAppIcon sx={{ mr: 1 }} />
                WhatsApp
              </MenuItem>
              <MenuItem onClick={() => handleShare('download')}>
                <DownloadIcon sx={{ mr: 1 }} />
                Download PDF
              </MenuItem>
            </Menu>

            {/* More Menu */}
            <Menu
              anchorEl={moreMenuAnchor}
              open={Boolean(moreMenuAnchor)}
              onClose={() => setMoreMenuAnchor(null)}
            >
              <MenuItem onClick={handleDuplicate}>
                <FileCopyIcon sx={{ mr: 1 }} />
                Duplicate Invoice
              </MenuItem>
              <MenuItem onClick={() => handleStatusChange('confirmed')}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                Mark as Confirmed
              </MenuItem>
              <MenuItem onClick={() => handleStatusChange('cancelled')}>
                <ErrorIcon sx={{ mr: 1 }} />
                Cancel Invoice
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon sx={{ mr: 1 }} />
                Delete Invoice
              </MenuItem>
            </Menu>

            {/* Success/Error Messages */}
            <Snackbar
              open={!!successMessage}
              autoHideDuration={6000}
              onClose={() => setSuccessMessage(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setSuccessMessage(null)}
                severity="success"
                variant="filled"
                sx={{ borderRadius: 2 }}
              >
                {successMessage}
              </Alert>
            </Snackbar>

            <Snackbar
              open={!!error}
              autoHideDuration={6000}
              onClose={() => setError(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setError(null)}
                severity="error"
                variant="filled"
                sx={{ borderRadius: 2 }}
              >
                {error}
              </Alert>
            </Snackbar>

            <ConfirmationDialog
              open={openConfirmDelete}
              onClose={() => setOpenConfirmDelete(false)}
              onConfirm={handleConfirmDelete}
              title="Confirm Deletion"
              message={`Are you sure you want to delete invoice ${invoice?.invoiceNumber}? This action cannot be undone.`}
              confirmText="Delete"
              confirmColor="error"
            />
          </Container>
        </Box>
      </VisuallyEnhancedDashboardLayout>
    </ModernThemeProvider>
  );
}