"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { validateProductName } from '@/utils/validation';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Autocomplete,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Chip,
  Divider,
  Tooltip,
  Badge,
  Checkbox,
  ListItemText // Import ListItemText
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Summarize as SummarizeIcon,
  CheckCircle as CheckCircleIcon,
  Percent as PercentIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy, doc, getDoc, updateDoc, writeBatch, increment } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { executeWithRetry, getFirestoreErrorMessage } from '@/utils/firestoreHelpers';
import { validateUpdateDocData } from '@/utils/firestoreUtils';
import { useParties } from "@/app/hooks/useParties";
import { useProducts } from '@/app/hooks/useProducts';
import { useCategories } from '@/app/hooks/useCategories';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import CategoryDiscountEditor from '@/components/invoices/CategoryDiscountEditor';
import LineItemDiscountEditor from '@/components/invoices/LineItemDiscountEditor';
import EnhancedPartySelector from '@/components/invoices/EnhancedPartySelector';
import { transactionService } from '@/services/transactionService';
import InvoiceWithStockService from '@/services/invoiceWithStockService';
import StockValidationEnforcementService from '@/services/stockValidationEnforcementService';
import CentralizedInvoiceService from '@/services/centralizedInvoiceService';
import StockValidationConfigService from '@/services/stockValidationConfig';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions 
} from '@mui/material'; 
import { useRouter } from 'next/navigation';

interface Party {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  categoryDiscounts: Record<string, number>;
  productDiscounts?: Record<string, number>;
}

interface InvoiceLineItem {
  productId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  category: string;
  discount: number;
  discountType: 'none' | 'category' | 'product' | 'custom';
  finalPrice: number;
  gstRate?: number;
  margin?: number;
}

interface TabbedInvoiceFormProps {
  onSuccess?: (invoiceId?: string) => void;
  invoiceId?: string;
}

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, index, value, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      {...other}
      style={{ padding: '20px 0' }}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

// function a11yProps(index: number) {
//   return {
//     id: `invoice-tab-${index}`,
//     'aria-controls': `invoice-tabpanel-${index}`,
//   };
// }

function a11yProps(index: number) {
  return {
    id: `invoice-tab-${index}`,
    'aria-controls': `invoice-tabpanel-${index}`,
  };
}

// export default function InvoiceForm({ onSuccess, invoiceId }: TabbedInvoiceFormProps) {
  export default function InvoiceForm({ onSuccess, invoiceId }: TabbedInvoiceFormProps) {
    const router = useRouter();
    const { parties, loading: loadingParties } = useParties();
 
  // const { parties, loading: loadingParties } = useParties();
  const { products, loading: loadingProducts, error: productsError, refetch: refetchProducts } = useProducts();
  const { categories, loading: loadingCategories, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { userId, userRole } = useCurrentUser();
  const quantityInputRef = React.useRef<HTMLInputElement>(null);
  const productSearchRef = React.useRef<HTMLInputElement>(null);
  const partySearchRef = React.useRef<HTMLInputElement>(null);
  
  // Handle key press events for product selection
  const handleProductKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && selectedProductId) {
      event.preventDefault();
      handleAddProduct();
    }
  };

  // Handle focus out events for product selection
  const handleProductFocusOut = () => {
    if (selectedProductId) {
      handleAddProduct();
    }
  };

  // Handle quantity input key press events
  const handleQuantityKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Focus on product search field
      setTimeout(() => {
        if (productSearchRef.current) {
          productSearchRef.current.focus();
        }
      }, 100);
    }
  };
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Invoice data
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  // State to track which line items have editable prices
  const [editablePriceItems, setEditablePriceItems] = useState<Record<number, boolean>>({});
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [transportCharges, setTransportCharges] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  
  // Description column visibility
  const [showDescriptionColumn, setShowDescriptionColumn] = useState<boolean>(false);
  const [showMargin, setShowMargin] = useState<boolean>(false);
  
  // Party dialog
  const [openPartyDialog, setOpenPartyDialog] = useState(false);
  const [openPartyDropdown, setOpenPartyDropdown] = useState(false);
  const [newParty, setNewParty] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    categoryDiscounts: {} as Record<string, number>,
    productDiscounts: {} as Record<string, number>
  });
  const [creatingParty, setCreatingParty] = useState(false);
  
  // Category discount editor
  const [openCategoryDiscountEditor, setOpenCategoryDiscountEditor] = useState(false);
  
  // New party category discount editor
  const [openNewPartyCategoryDiscountEditor, setOpenNewPartyCategoryDiscountEditor] = useState(false);
  
  // New product dialog
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number>(0);
  const [newProductPurchasePrice, setNewProductPurchasePrice] = useState<number>(0);
  const [newProductStock, setNewProductStock] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [isQuickCreateMode, setIsQuickCreateMode] = useState(false);
  const [productCreationErrors, setProductCreationErrors] = useState<Record<string, string>>({});
  
  // New category dialog
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  
  // Get all available categories from the categories collection
  const availableCategories = useMemo(() => {
    // Combine categories from the dedicated categories collection and existing product categories
    const categoryNames = new Set<string>();
    
    // Add categories from the categories collection
    categories.forEach(category => {
      if (category.name) {
        categoryNames.add(category.name);
      }
    });
    
    // Also add categories from existing products (for backward compatibility)
    products.forEach(product => {
      if (product.category) {
        categoryNames.add(product.category);
      }
    });
    
    return Array.from(categoryNames).sort();
  }, [categories, products]);
  
  // Effect to handle custom category toggle
  useEffect(() => {
    if (useCustomCategory) {
      // When switching to custom category, clear the selected category
      setNewProductCategory('');
    } else {
      // When switching back to dropdown, clear the custom category
      setCustomCategory('');
    }
  }, [useCustomCategory]);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product && product.purchasePrice) {
        setPurchasePrice(product.purchasePrice);
      }
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    if (activeTab === 0 && partySearchRef.current) {
      setTimeout(() => {
        partySearchRef.current?.focus();
      }, 100);
    } else if (activeTab === 1 && productSearchRef.current) {
      setTimeout(() => {
        productSearchRef.current?.focus();
      }, 100);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!loadingParties && parties.length > 0) {
      setTimeout(() => {
        partySearchRef.current?.focus();
        setOpenPartyDropdown(true);
      }, 100);
    }
  }, [loadingParties, parties]);

  // Fetch existing invoice data if editing
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!invoiceId) return;
      if (!parties.length || !products.length) return;
      
      try {
        setLoading(true);
        
        // Use the executeWithRetry utility to handle connectivity issues
        await executeWithRetry(async () => {
          const invoiceRef = doc(db, 'invoices', invoiceId);
          const invoiceSnap = await getDoc(invoiceRef);
          
          if (!invoiceSnap.exists()) {
            setError('Invoice not found');
            return;
          }
          
          const invoiceData = invoiceSnap.data();
          setInvoiceNumber(invoiceData.invoiceNumber);
          setInvoiceDate(invoiceData.date);
          setSelectedPartyId(invoiceData.partyId);
          setTransportCharges(invoiceData.transportCharges || 0); // Load transport charges
          setNotes(invoiceData.notes || ''); // Load notes
          
          // Find the party to get their discounts
          const party = parties.find(p => p.id === invoiceData.partyId);
          
          // Map items preserving original discount values
          setLineItems(invoiceData.items.map((item) => {
            const product = products.find(p => p.id === item.productId);
            
            // Determine the appropriate discount based on saved values
            let discount = 0;
            let discountType: 'none' | 'category' | 'product' = 'none';
            
            if (item.discountType === 'product' || item.discountType === 'category') {
              discount = item.discount;
              discountType = item.discountType;
            } else if (party) {
              // Check for product-specific discount first
              const productDiscount = party.productDiscounts?.[item.productId] || 0;
              
              // Use category name to look up discount
              const categoryName = product?.category || '';
              const categoryDiscount = party.categoryDiscounts[categoryName] || 0;
              
              
              
              if (productDiscount > 0) {
                discount = productDiscount;
                discountType = 'product';
              } else if (categoryDiscount > 0) {
                discount = categoryDiscount;
                discountType = 'category';
              }
            }
            
            const finalPrice = item.price * (1 - discount/100) * item.quantity;
            
            return {
              productId: item.productId,
              name: item.name,
              description: item.description || '',
              quantity: item.quantity,
              price: item.price,
              category: product?.category || '',
              discount,
              discountType,
              finalPrice: parseFloat(finalPrice.toFixed(2)),
              margin: item.margin || 0,
              gstRate: item.gstRate || 0
            };
          }));
        }, 3, (attempt, maxRetries) => {
          setError(`Connection error while loading invoice. Retrying... (Attempt ${attempt}/${maxRetries})`);
        });
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(getFirestoreErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    
    if (invoiceId) {
      fetchInvoiceData();
    } else {
      // Generate sequential invoice number for new invoices
      const generateInvoiceNumber = async () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        try {
          // Use the executeWithRetry utility to handle connectivity issues
          return await executeWithRetry(async () => {
            // Get the latest invoice for the current month
            const invoicesQuery = query(
              collection(db, 'invoices'),
              where('invoiceNumber', '>=', `INV-${year}${month}-000`),
              where('invoiceNumber', '<=', `INV-${year}${month}-999`),
              orderBy('invoiceNumber', 'desc'),
              limit(1)
            );
            
            const snapshot = await getDocs(invoicesQuery);
            let sequence = 1;
            
            if (!snapshot.empty) {
              const latestInvoice = snapshot.docs[0].data();
              const latestNumber = latestInvoice.invoiceNumber;
              
              // Extract the sequence number and increment it
              const currentSequence = parseInt(latestNumber.split('-')[2]);
              sequence = currentSequence + 1;
              
              // If sequence exceeds 999, show error
              if (sequence > 999) {
                setError('Maximum invoice number reached for this month');
                return null;
              }
            }
            
            // Format the sequence number with leading zeros
            const sequenceStr = sequence.toString().padStart(3, '0');
            return `DC-${year}${month}-${sequenceStr}`;
          });
        } catch (err) {
          console.error('Error generating invoice number:', err);
          // Fallback to a timestamp-based number if there's an error
          const timestamp = Date.now();
          return `DC-${timestamp}`;
        }
      };
      
      const initializeInvoiceNumber = async () => {
        const number = await generateInvoiceNumber();
        if (number) setInvoiceNumber(number);
      };
      initializeInvoiceNumber();
    }
  }, [invoiceId, parties.length, products.length]);
  
  // Get selected party
  const selectedParty = parties.find(party => party.id === selectedPartyId) || null;
  
  // Calculate discounts for a single line item
  const calculateItemDiscounts = (item: InvoiceLineItem, party: Party | null) => {
    if (!party) return item;
    
    // If the item already has a custom discount, preserve it
    if (item.discountType === 'custom') {
      const finalPrice = item.price * (1 - item.discount/100) * item.quantity;
      return {
        ...item,
        finalPrice: parseFloat(finalPrice.toFixed(2))
      };
    }
    
    const product = products.find(p => p.id === item.productId);
    if (!product) return item;
    
    // Use category name to look up discount
    const categoryDiscount = party.categoryDiscounts[product.category] || 0;
    
    const productDiscount = party.productDiscounts?.[item.productId] || 0;
    
    let discount = 0;
    let discountType: 'none' | 'category' | 'product' | 'custom' = 'none';
    
    if (productDiscount > 0) {
      discount = productDiscount;
      discountType = 'product';
    } else if (categoryDiscount > 0) {
      discount = categoryDiscount;
      discountType = 'category';
    }
    
    const gstRate = item.gstRate || 0;
    const finalPrice = item.price * (1 - discount/100) * item.quantity * (1 + gstRate / 100);
    const result = { 
      ...item, 
      discount, 
      discountType,
      finalPrice: parseFloat(finalPrice.toFixed(2))
    };
    
        
    return result;
  };

  // Update discounts when party changes
  useEffect(() => {
    if (!selectedParty) return;
    
    const updatedItems = lineItems.map(item => calculateItemDiscounts(item, selectedParty));
    setLineItems(updatedItems);
  }, [selectedPartyId, products, selectedParty]); // Don't include lineItems to avoid infinite loop
  
  const handleOpenPartyDialog = () => {
    setNewParty({
      name: '',
      email: '',
      phone: '',
      address: '',
      categoryDiscounts: {},
      productDiscounts: {}
    });
    setOpenPartyDialog(true);
  };
  
  const handleOpenProductDialog = (searchedName?: string, isQuickCreate?: boolean) => {
    setProductCreationErrors({});
    setNewProductName(searchedName || '');
    setNewProductDescription('');
    setNewProductPrice(0);
    setNewProductPurchasePrice(0);
    setNewProductStock(0);
    setNewProductCategory('');
    setCustomCategory('');
    setUseCustomCategory(false);
    setIsQuickCreateMode(isQuickCreate || false);
    setError(null);
    setOpenProductDialog(true);
  };

  const handlePartyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParty(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler for updating new party's category discounts
  const handleUpdateNewPartyCategoryDiscounts = (updatedDiscounts: Record<string, number>) => {
    setNewParty(prev => ({
      ...prev,
      categoryDiscounts: updatedDiscounts
    }));
    
    // Show success message
    setSuccessMessage('Category discounts updated for new party');
  };

  const handleCreateParty = async () => {
    if (!newParty.name) {
      setError('Party name is required');
      return;
    }
    
    try {
      setCreatingParty(true);
      
      // Use the executeWithRetry utility to handle connectivity issues
      const partyRef = await executeWithRetry(
        async () => {
          return await addDoc(collection(db, 'parties'), {
            ...newParty,
            createdAt: serverTimestamp()
          });
        },
        3, // Max retries
        (attempt, maxRetries, error) => {
          // This callback is called on each retry attempt
          setError(`Connection error. Retrying... (Attempt ${attempt}/${maxRetries})`);
        }
      );
      
      const newPartyWithId = {
        ...newParty,
        id: partyRef.id
      };
      
      parties.push(newPartyWithId);
      setSelectedPartyId(partyRef.id);
      setOpenPartyDialog(false);
      setError(null);
      
      // Show success message with discount info if any discounts were set
      const discountCount = Object.keys(newParty.categoryDiscounts).length;
      if (discountCount > 0) {
        setSuccessMessage(`Party created successfully with ${discountCount} category discount${discountCount > 1 ? 's' : ''}`);
      } else {
        setSuccessMessage('Party created successfully');
      }
    } catch (err) {
      console.error('Error creating party:', err);
      setError(getFirestoreErrorMessage(err));
    } finally {
      setCreatingParty(false);
    }
  };
  
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      setCreatingCategory(true);
      setError(null);
      
      // Check if category already exists
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('name', '==', newCategoryName.trim())
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      if (!categoriesSnapshot.empty) {
        setError('Category with this name already exists');
        return;
      }
      
      // Create new category
      const categoryData = {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || '',
        isActive: true,
        defaultDiscount: 0,
        sortOrder: 0,
        color: '#1976d2',
        icon: 'category',
        tags: [],
        metadata: {
          totalProducts: 0,
          totalValue: 0,
          averagePrice: 0,
          lastUpdated: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'categories'), categoryData);
      
      // Refresh categories
      await refetchCategories();
      
      // Set the newly created category as selected
      setNewProductCategory(newCategoryName.trim());
      setUseCustomCategory(false);
      
      // Close the category dialog
      setOpenCategoryDialog(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      
      setSuccessMessage('Category created successfully');
      
    } catch (err) {
      console.error('Error creating category:', err);
      setError(getFirestoreErrorMessage(err));
    } finally {
      setCreatingCategory(false);
    }
  };
  
  const handleCreateProduct = async () => {
    const errors: Record<string, string> = {};
    
    if (!newProductName.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (newProductPrice <= 0) {
      errors.price = 'Price must be greater than ₹0';
    } else if (!Number.isFinite(newProductPrice)) {
      errors.price = 'Please enter a valid price';
    }
    
    if (newProductPurchasePrice < 0) {
      errors.purchasePrice = 'Purchase price cannot be negative';
    } else if (!Number.isFinite(newProductPurchasePrice)) {
      errors.purchasePrice = 'Please enter a valid purchase price';
    }

    if (newProductStock < 0) {
      errors.stock = 'Stock quantity cannot be negative';
    } else if (!Number.isFinite(newProductStock)) {
      errors.stock = 'Please enter a valid stock quantity';
    }
    
    if (useCustomCategory && !customCategory.trim()) {
      errors.category = 'Custom category cannot be empty';
    }
    
    if (lineItems.length >= 25) {
      errors.general = 'Maximum 25 items allowed per invoice. Remove some items first.';
    }
    
    if (Object.keys(errors).length > 0) {
      setProductCreationErrors(errors);
      setError(errors.general || Object.values(errors)[0]);
      return;
    }
    
    setProductCreationErrors({});
    
    try {
      setCreatingProduct(true);
      setError(null);
      
      const finalCategoryName = useCustomCategory ? customCategory.trim() : newProductCategory;
      let categoryId = '';
      
      if (finalCategoryName) {
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('name', '==', finalCategoryName)
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        if (!categoriesSnapshot.empty) {
          categoryId = categoriesSnapshot.docs[0].id;
        } else {
          const categoryData = {
            name: finalCategoryName,
            description: `Auto-created category for ${finalCategoryName} products`,
            isActive: true,
            sortOrder: 0,
            color: '#1976d2',
            icon: 'category',
            tags: [],
            metadata: {
              totalProducts: 0,
              totalValue: 0,
              averagePrice: 0,
              lastUpdated: new Date().toISOString()
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const categoryRef = await addDoc(collection(db, 'categories'), categoryData);
          categoryId = categoryRef.id;
        }
      }
      
      const productData = {
        name: newProductName.trim(),
        price: newProductPrice,
        purchasePrice: newProductPurchasePrice,
        categoryId: categoryId,
        categoryName: finalCategoryName,
        category: finalCategoryName,
        quantity: newProductStock,
        stock: newProductStock,
        description: newProductDescription.trim(),
        isActive: true,
        gstRate: 18,
        unitOfMeasurement: 'nos',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const productRef = await executeWithRetry(
        async () => {
          return await addDoc(collection(db, 'products'), productData);
        },
        3,
        (attempt, maxRetries) => {
          setError(`Connection error. Retrying... (Attempt ${attempt}/${maxRetries})`);
        }
      );
      
      const newProduct = {
        id: productRef.id,
        name: newProductName.trim(),
        price: newProductPrice,
        purchasePrice: newProductPurchasePrice,
        category: finalCategoryName,
        categoryId: categoryId,
        categoryName: finalCategoryName,
        stock: newProductStock,
        description: newProductDescription.trim()
      };
      
      products.push(newProduct);
      
      let discount = 0;
      let discountType: 'none' | 'category' | 'product' | 'custom' = 'none';
      
      if (selectedParty && finalCategoryName) {
        const categoryDiscount = selectedParty.categoryDiscounts[finalCategoryName] || 0;
        if (categoryDiscount > 0) {
          discount = categoryDiscount;
          discountType = 'category';
        }
      }
      
      const gstRate = selectedParty?.gstRate || 0;
      const finalPrice = parseFloat((newProductPrice * (1 - discount/100) * 1 * (1 + gstRate / 100)).toFixed(2));
      
      const newItem: InvoiceLineItem = {
        productId: productRef.id,
        name: newProductName.trim(),
        description: newProductDescription.trim(),
        quantity: 1,
        price: newProductPrice,
        category: finalCategoryName,
        discount: discount,
        discountType: discountType,
        finalPrice: finalPrice
      };
      
      setLineItems([...lineItems, newItem]);
      
      setSelectedProductId('');
      
      try {
        await refetchProducts();
        if (categoryId) {
          await refetchCategories();
        }
      } catch (refetchErr) {
        console.warn('Error refetching products:', refetchErr);
      }
      
      setOpenProductDialog(false);
      const stockInfo = newProductStock > 0 ? ` (Stock: ${newProductStock})` : '';
      setSuccessMessage(`✓ Product "${newProductName.trim()}" created and added to invoice${stockInfo}`);
      
    } catch (err) {
      console.error('Error creating product:', err);
      const errorMsg = getFirestoreErrorMessage(err);
      setError(errorMsg || 'Failed to create product. Please try again.');
      setProductCreationErrors({ general: errorMsg || 'Failed to create product' });
    } finally {
      setCreatingProduct(false);
    }
  };  const handleAddProduct = () => {
    if (!selectedProductId) return;
    
    // Check if we've reached the maximum limit of 25 items
    if (lineItems.length >= 25) {
      setWarningMessage('Maximum 25 items allowed per invoice. Please remove some items to add new ones.');
      return;
    }
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    let discount = 0;
    let discountType: 'none' | 'category' | 'product' | 'custom' = 'none';
    
    if (selectedParty) {
      // Use category name to look up discount
      const categoryDiscount = selectedParty.categoryDiscounts[product.category] || 0;
      const productDiscount = selectedParty.productDiscounts?.[product.id] || 0;
      
            
      if (productDiscount > 0) {
        discount = productDiscount;
        discountType = 'product';
      } else if (categoryDiscount > 0) {
        discount = categoryDiscount;
        discountType = 'category';
      }
    }
    
    // Calculate the final price with discount and quantity
    const gstRate = selectedParty?.gstRate || 0;
    const finalPrice = parseFloat((product.price * (1 - discount/100) * 1 * (1 + gstRate / 100)).toFixed(2));
    
    let newItem: InvoiceLineItem = {
      productId: product.id,
      name: product.name,
      description: '', // Default empty description for existing products
      quantity: 1, // Default to 1 instead of 0
      price: product.price,
      purchasePrice: product.purchasePrice,
      category: product.category || '',
      discount: discount, // Apply the calculated discount
      discountType: discountType, // Apply the calculated discount type
      finalPrice: finalPrice
    };
    
        
    setLineItems([...lineItems, newItem]);
    setSelectedProductId(''); // Reset the selected product ID to clear the selection field
    
    // Focus on the quantity input of the newly added item and select its content
    setTimeout(() => {
      if (quantityInputRef.current) {
        quantityInputRef.current.focus();
        quantityInputRef.current.select(); // Select the content so it can be easily replaced
      }
    }, 100); // Slightly longer timeout to ensure the DOM has updated
  };
  
  const handleUpdateQuantity = (index: number, quantity: number | string) => {
    const updatedItems = lineItems.map((item, i) => {
      if (i !== index) return item;
      
      const updatedItem = { ...item, quantity: quantity };
      return calculateItemDiscounts(updatedItem, selectedParty);
    });
    
    setLineItems(updatedItems);
  };
  
  const handleUpdatePrice = (index: number, price: number | string) => {
    const updatedItems = lineItems.map((item, i) => {
      if (i !== index) return item;
      
      const updatedItem = { ...item, price: price, margin: undefined };
      return calculateItemDiscounts(updatedItem, selectedParty);
    });
    
    setLineItems(updatedItems);
  };

  const handleUpdateMargin = (index: number, margin: number | string) => {
    const updatedItems = lineItems.map((item, i) => {
      if (i !== index) return item;

      const numericMargin = typeof margin === 'string' ? parseFloat(margin) : margin;
      
      const updatedItem = { ...item, margin: isNaN(numericMargin) ? undefined : numericMargin };

      return calculateItemDiscounts(updatedItem, selectedParty);
    });
    setLineItems(updatedItems);
  };
  
  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
    // Also remove from editable prices if it exists
    if (editablePriceItems[index]) {
      const updatedEditableItems = { ...editablePriceItems };
      delete updatedEditableItems[index];
      setEditablePriceItems(updatedEditableItems);
    }
  };
  
  // Toggle price edit mode for a specific line item
  const togglePriceEditMode = (index: number) => {
    setEditablePriceItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Handle updating category discounts
  const handleUpdateCategoryDiscounts = async (updatedDiscounts: Record<string, number>) => {
        
    // Update the party's category discounts (both in state and in the database)
    if (selectedParty) {
      try {
        setLoading(true);
        
        const updatedParty = {
          ...selectedParty,
          categoryDiscounts: updatedDiscounts // Replace entirely instead of merging
        };
        
                
        // Update the party in the database
        const partyUpdateData = {
          categoryDiscounts: updatedDiscounts, // Use the complete updated discounts object
          updatedAt: new Date().toISOString()
        };

        // Validate the party update data
        const validation = validateUpdateDocData(partyUpdateData, 'party');
        
        if (!validation.isValid) {
          console.error('Party data validation failed:', validation.errors);
          throw new Error(`Invalid party data: ${validation.errors.join(', ')}`);
        }

        const partyRef = doc(db, 'parties', selectedParty.id);
        await updateDoc(partyRef, validation.cleanedData);
        
        // Find the party in the parties array and update it
        const partyIndex = parties.findIndex(p => p.id === selectedParty.id);
        if (partyIndex !== -1) {
          parties[partyIndex] = updatedParty;
        }
        
        // Recalculate discounts for all line items, preserving custom discounts
        const updatedItems = lineItems.map(item => {
          // Skip items with custom discounts
          if (item.discountType === 'custom') {
            return item;
          }
          
          // For items with the category that was updated, apply the new discount
          const product = products.find(p => p.id === item.productId);
          if (product && updatedDiscounts.hasOwnProperty(product.category)) {
            const newDiscount = updatedDiscounts[product.category];
            const finalPrice = item.price * (1 - newDiscount/100) * item.quantity;
            
            return {
              ...item,
              discount: newDiscount,
              discountType: 'category',
              finalPrice: parseFloat(finalPrice.toFixed(2))
            };
          }
          
          // For other items, recalculate using the standard logic
          return calculateItemDiscounts(item, updatedParty);
        });
        
        setLineItems(updatedItems);
        
        // Show success message
        setSuccessMessage('Category discounts updated and saved to party successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error updating party category discounts:', error);
        setError('Failed to update category discounts. Please try again.');
        setLoading(false);
      }
    }
  };
  
  // Handle updating a single line item's discount
  const handleUpdateLineItemDiscount = (index: number, discount: number, discountType: 'none' | 'category' | 'product' | 'custom') => {
    const updatedItems = [...lineItems];
    const item = { ...updatedItems[index] };
    
        
    item.discount = discount;
    item.discountType = discountType; // Keep the custom discount type
    const gstRate = item.gstRate || 0;
    item.finalPrice = item.price * (1 - discount/100) * item.quantity * (1 + gstRate / 100);
    item.finalPrice = parseFloat(item.finalPrice.toFixed(2));
    
    updatedItems[index] = item;
    setLineItems(updatedItems);
  };
  
  const subtotal = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal - lineItems.reduce((sum, item) => sum + item.finalPrice, 0);
  
  // Total DP on unit price
  const totalMargin = lineItems.reduce((sum, item) => {
    const margin = typeof item.margin === 'number' ? item.margin : 0;
    return sum + (item.price * item.quantity * margin / 100);
  }, 0);
  
  // Calculate exact total before rounding (includes DP)
  const exactTotal = subtotal - discountAmount + transportCharges + totalMargin;
  // Round to nearest rupee for Grand Total
  const total = Math.round(exactTotal);
  // Calculate round-off amount
  const roundOffAmount = total - exactTotal;
  
  const handleSaveInvoice = async () => {
    if (!selectedPartyId || lineItems.length === 0) {
      setError('Please select a party and add at least one product');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const invoiceData = {
      invoiceNumber,
      date: invoiceDate,
      partyId: selectedParty?.id || '',
      partyName: selectedParty?.name || '',
      partyAddress: selectedParty?.address || '',
      partyEmail: selectedParty?.email || '',
      partyPhone: selectedParty?.phone || '',
      partyGstin: selectedParty?.gstin || '',
      partyStateCode: selectedParty?.gstin ? 
        selectedParty.gstin.substring(0, 2) : '',
      userId: userId || 'default-user',
      type: 'sales', // Explicitly set as sales invoice
      items: lineItems.map(item => {
        const itemData: any = {
          productId: item.productId,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          discountType: item.discountType,
          finalPrice: item.finalPrice,
          category: item.category
        };
        
        // Only include margin if it's a valid number
        if (typeof item.margin === 'number' && !isNaN(item.margin)) {
          itemData.margin = item.margin;
        }
        
        return itemData;
      }),
      subtotal,
      discount: discountAmount,
      dp: totalMargin, // DP amount total
      total, // This is now the rounded value (includes DP)
      transportCharges,
      roundOffAmount,
      notes,
      categoryDiscounts: selectedParty?.categoryDiscounts || {},
      isGstInvoice: false,
      stockUpdated: false
    };

    try {
      if (invoiceId) {
        // Update existing invoice with stock management
        const updateResult = await InvoiceWithStockService.updateInvoiceWithStock(
          invoiceId,
          invoiceData,
          true // adjustStock
        );

        if (!updateResult.success) {
          setError(updateResult.errors?.join(', ') || 'Failed to update invoice');
          if (updateResult.warnings && updateResult.warnings.length > 0) {
            setSuccessMessage(updateResult.warnings.join(', '));
          }
          return;
        }

        setSuccessMessage('Invoice updated successfully with stock adjustments');
        
        // Show warnings if any
        if (updateResult.warnings && updateResult.warnings.length > 0) {
          setTimeout(() => {
            setSuccessMessage(prev => prev + '. Warnings: ' + updateResult.warnings!.join(', '));
          }, 1000);
        }

      } else {
        // Create new invoice using centralized service with mandatory stock validation
        // Get stock validation configuration
        const stockConfig = StockValidationConfigService.getConfigForInvoiceType('sales');
        
        const createResult = await CentralizedInvoiceService.createInvoice(
          invoiceData,
          stockConfig
        );

        if (!createResult.success) {
          // Handle stock validation errors with user-friendly messages
          if (createResult.blockingErrors && createResult.blockingErrors.length > 0) {
            const stockErrors = createResult.blockingErrors.filter(error => 
              error.includes('ZERO STOCK') || error.includes('INSUFFICIENT STOCK')
            );
            
            if (stockErrors.length > 0) {
              setError('🚫 Cannot create invoice due to stock issues:\n\n' + stockErrors.join('\n\n'));
            } else {
              setError(createResult.blockingErrors.join('\n'));
            }
          } else {
            setError(createResult.errors?.join(', ') || 'Failed to create invoice');
          }
          
          if (createResult.warnings && createResult.warnings.length > 0) {
            setSuccessMessage(createResult.warnings.join(', '));
          }
          return;
        }

        setSuccessMessage('Invoice created successfully with stock management');
        
        // Show warnings if any
        if (createResult.warnings && createResult.warnings.length > 0) {
          setTimeout(() => {
            setSuccessMessage(prev => prev + '. Warnings: ' + createResult.warnings!.join(', '));
          }, 1000);
        }

        // Navigate away after success - use the newly created invoice ID
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(createResult.invoiceId);
          } else {
            router.push('/invoices');
          }
        }, 1500);
        return; // Early return to avoid the general navigation code below
      }

      // Navigate away after success (for update case)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(invoiceId);
        } else {
          router.push('/invoices');
        }
      }, 1500);

    } catch (err) {
      console.error('Error saving invoice:', err);
      setError(getFirestoreErrorMessage(err) || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Check if we can proceed to the next tab
  const canProceedToProducts = !!selectedPartyId && !!invoiceNumber && !!invoiceDate;
  const canProceedToSummary = lineItems.length > 0;

  // Navigation between tabs
  const handleNext = () => {
    setActiveTab(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveTab(prev => prev - 1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
      
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="invoice creation tabs"
            variant="fullWidth"
          >
            <Tab 
              label="Invoice Details" 
              icon={<ReceiptIcon />} 
              iconPosition="start" 
              {...a11yProps(0)} 
            />
            <Tab 
              label="Products" 
              icon={<ShoppingCartIcon />} 
              iconPosition="start" 
              {...a11yProps(1)} 
              disabled={!canProceedToProducts}
            />
            <Tab 
              label="Summary" 
              icon={<SummarizeIcon />} 
              iconPosition="start" 
              {...a11yProps(2)} 
              disabled={!canProceedToSummary}
            />
          </Tabs>
        </Box>
        
        {/* Invoice Details Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 2, sm: 3 },
            mb: 3,
            '& > *': { flex: 1 }
          }}>
            <TextField
              fullWidth
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              size="small"
              required
              error={!invoiceNumber}
              helperText={!invoiceNumber ? "Invoice number is required" : ""}
            />
            
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              required
              error={!invoiceDate}
              helperText={!invoiceDate ? "Date is required" : ""}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Party Information
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {/* Party Selection Row */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'flex-start',
              mb: 2
            }}>
              <Autocomplete
                fullWidth
                options={parties}
                getOptionLabel={(option) => option.name}
                value={selectedParty}
                open={openPartyDropdown}
                onOpen={() => setOpenPartyDropdown(true)}
                onClose={() => setOpenPartyDropdown(false)}
                onChange={(_, newValue) => {
                  setSelectedPartyId(newValue?.id || '');
                  // Automatically navigate to Products tab when party is selected
                  if (newValue?.id) {
                    setTimeout(() => {
                      setActiveTab(1);
                      // Focus on product search field after tab navigation
                      setTimeout(() => {
                        if (productSearchRef.current) {
                          productSearchRef.current.focus();
                        }
                      }, 100); // Additional delay to ensure tab content is rendered
                    }, 300); // Small delay for better UX
                  }
                }}
                disabled={loadingParties}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Party"
                    size="small"
                    error={!selectedPartyId}
                    helperText={!selectedPartyId ? "Please select a party" : ""}
                    required
                    inputRef={partySearchRef}
                  />
                )}
                filterOptions={(options, state) => {
                  const inputValue = state.inputValue.toLowerCase().trim();
                  return options.filter(option => 
                    option.name.toLowerCase().includes(inputValue) ||
                    (option.phone && option.phone.includes(inputValue)) ||
                    (option.email && option.email.toLowerCase().includes(inputValue))
                  );
                }}
                loading={loadingParties}
                loadingText="Loading parties..."
                noOptionsText="No parties found"
              />
              
              <Button 
                variant="outlined" 
                onClick={handleOpenPartyDialog}
                size="small"
                sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                startIcon={<PersonIcon />}
              >
                New Party
              </Button>
            </Box>
            

          </Box>
          
          {selectedParty && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedParty.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedParty.email && (
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedParty.email}
                  </Typography>
                )}
                
                {selectedParty.phone && (
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedParty.phone}
                  </Typography>
                )}
                
                {selectedParty.address && (
                  <Typography variant="body2">
                    <strong>Address:</strong> {selectedParty.address}
                  </Typography>
                )}
                
                {Object.keys(selectedParty.categoryDiscounts).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Category Discounts:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {Object.entries(selectedParty.categoryDiscounts).map(([category, discount]) => (
                        discount > 0 && (
                          <Chip 
                            key={category} 
                            label={`${category}: ${discount}%`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        )
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              disabled={!canProceedToProducts}
            >
              Next: Add Products
            </Button>
          </Box>
        </TabPanel>
        
        {/* Products Tab */}
        <TabPanel value={activeTab} index={1}>
          {/* Selected Party Display */}
          {selectedParty && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
                📋 Invoice for: {selectedParty.name}
              </Typography>
              {selectedParty.address && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedParty.address}
                </Typography>
              )}
              {(selectedParty.phone || selectedParty.email) && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedParty.phone && selectedParty.phone}
                  {selectedParty.phone && selectedParty.email && ' • '}
                  {selectedParty.email && selectedParty.email}
                </Typography>
              )}
            </Box>
          )}

    {/* Category Discounts Section */}
          {selectedPartyId && (
            <Box sx={{ mt: 3, mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PercentIcon color="primary" fontSize="small" />
                  Category Discounts Configuration
                </Typography>
                <Tooltip title="Set discount percentages for product categories for this party">
                  <Badge 
                    badgeContent={selectedParty ? Object.keys(selectedParty.categoryDiscounts).length : 0} 
                    color="primary"
                    showZero
                    sx={{ '& .MuiBadge-badge': { right: -3, top: 3 } }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setOpenCategoryDiscountEditor(true)}
                      startIcon={<PercentIcon />}
                      color="primary"
                    >
                      Edit Category Discounts
                    </Button>
                  </Badge>
                </Tooltip>
              </Box>
              
              {selectedParty && Object.keys(selectedParty.categoryDiscounts).length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Category Discounts:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(selectedParty.categoryDiscounts).map(([category, discount]) => (
                      discount > 0 && (
                        <Chip 
                          key={category} 
                          label={`${category}: ${discount}%`} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {/* Items Header with Count and Description Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" component="h3">
                Invoice Items
              </Typography>
              <Chip 
                label={`${lineItems.length}/25 items`}
                color={lineItems.length >= 25 ? 'error' : lineItems.length >= 22 ? 'warning' : 'primary'}
                size="small"
                variant="outlined"
              />
              {lineItems.length >= 22 && (
                <Typography variant="caption" color="warning.main">
                  {lineItems.length >= 25 ? 'Maximum limit reached' : `${25 - lineItems.length} items remaining`}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DescriptionIcon />}
              onClick={() => setShowDescriptionColumn(!showDescriptionColumn)}
              sx={{ textTransform: 'none' }}
            >
              {showDescriptionColumn ? 'Hide' : 'Show'} Description
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PercentIcon />}
              onClick={() => setShowMargin(!showMargin)}
              sx={{ textTransform: 'none' }}
            >
              {showMargin ? 'Hide' : 'Show'} DP
            </Button>
          </Box>

          {/* Maximum Items Alert */}
          {lineItems.length >= 18 && (
            <Alert 
              severity={lineItems.length >= 25 ? "error" : "warning"} 
              sx={{ mb: 2 }}
              icon={lineItems.length >= 25 ? <CheckCircleIcon /> : undefined}
            >
              <Typography variant="body2">
                {lineItems.length >= 25 ? (
                  <>
                    <strong>Maximum items reached!</strong> You have added the maximum allowed 25 items to this invoice. 
                    To add more items, please remove some existing items first or create a new invoice.
                  </>
                ) : (
                  <>
                    <strong>Approaching limit!</strong> You have {lineItems.length} items. 
                    You can add {25 - lineItems.length} more item{25 - lineItems.length !== 1 ? 's' : ''} to this invoice.
                  </>
                )}
              </Typography>
            </Alert>
          )}
          
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', maxHeight: { xs: 400, sm: 'none' }, mb: 2 }}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 150 }}>Product</TableCell>
                  {showDescriptionColumn && (
                    <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
                  )}
                  {showMargin && (
                    <TableCell align="right" sx={{ minWidth: 100 }}>DP(+)</TableCell>
                  )}
                  <TableCell align="right" sx={{ minWidth: 80 }}>Price</TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ minWidth: 120 }}>Discount</TableCell>
                  <TableCell align="right" sx={{ minWidth: 100 }}>Total</TableCell>
                  <TableCell align="center" sx={{ minWidth: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showDescriptionColumn ? 7 : 6} align="center">
                      No products added
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      {showDescriptionColumn && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              value={item.description || ''}
                              onChange={(e) => {
                                const updatedItems = [...lineItems];
                                updatedItems[index] = { ...updatedItems[index], description: e.target.value };
                                setLineItems(updatedItems);
                              }}
                              placeholder="Add description..."
                              variant="outlined"
                              sx={{ flexGrow: 1, minWidth: '150px' }}
                              multiline
                              maxRows={2}
                            />
                            <Tooltip title="Add description">
                              <IconButton size="small" color="primary">
                                <DescriptionIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                      {showMargin && (
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.margin || '0'}
                            onChange={(e) => handleUpdateMargin(index, e.target.value)}
                            onFocus={(e) => e.target.select()} // Select all text when focused
                            sx={{ width: { xs: '60px', sm: '70px' } }}
                          />
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {editablePriceItems[index] ? (
                            <>
                              <TextField
                                type="number"
                                size="small"
                                value={item.price}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '') {
                                    handleUpdatePrice(index, '');
                                  } else {
                                    const numericValue = parseFloat(value);
                                    if (numericValue >= 0 && !isNaN(numericValue)) {
                                      handleUpdatePrice(index, numericValue);
                                    }
                                  }
                                }}
                                onFocus={(e) => e.target.select()} // Select all text when focused
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{ width: { xs: '80px', sm: '90px' } }}
                                InputProps={{
                                  startAdornment: <span style={{ fontSize: '0.8rem', marginRight: '2px' }}>₹</span>
                                }}
                                autoFocus
                              />
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => togglePriceEditMode(index)}
                                sx={{ ml: 0.5 }}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <Typography variant="body2" sx={{ mr: 1 }}>₹{item.price}</Typography>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => togglePriceEditMode(index)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              handleUpdateQuantity(index, '');
                            } else {
                              const numericValue = parseInt(value);
                              if (numericValue >= 0 && !isNaN(numericValue)) {
                                handleUpdateQuantity(index, numericValue);
                              }
                            }
                          }}
                          onFocus={(e) => e.target.select()} // Select all text when focused
                          onKeyDown={handleQuantityKeyPress} // Focus product search on Enter
                          sx={{ width: { xs: '60px', sm: '70px' } }}
                          inputRef={index === lineItems.length - 1 ? quantityInputRef : null}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {(() => {
                          const product = products.find(p => p.id === item.productId);
                          const categoryName = product?.category || '';
                          const categoryDiscount = selectedParty?.categoryDiscounts[categoryName] || 0;
                          const productDiscount = selectedParty?.productDiscounts?.[item.productId] || 0;
                          
                                                    
                          return (
                            <LineItemDiscountEditor
                              discount={item.discount}
                              discountType={item.discountType}
                              categoryDiscount={categoryDiscount}
                              productDiscount={productDiscount}
                              onSave={(discount, discountType) => 
                                handleUpdateLineItemDiscount(index, discount, discountType)
                              }
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell align="right">₹{item.finalPrice}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            mb: 3,
            alignItems: 'flex-start'
          }}>

          

            {productsError ? (
              <Box sx={{ width: '100%' }}>
                <Alert 
                  severity="error" 
                  action={
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={() => {
                        refetchProducts();
                      }}
                    >
                      Retry
                    </Button>
                  }
                  sx={{ mb: 2 }}
                >
                  {productsError}
                </Alert>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenProductDialog()}
                  disabled={lineItems.length >= 25}
                  fullWidth
                  title={lineItems.length >= 25 ? 'Maximum 25 items allowed per invoice' : ''}
                >
                  Create New Product Manually {lineItems.length >= 25 ? '(Max 25 reached)' : ''}
                </Button>
              </Box>
            ) : (
              <Autocomplete
                fullWidth
                options={products}
                filterOptions={(options, state) => {
                  const inputValue = state.inputValue.toLowerCase().trim();
                  let filtered = options.filter(option => {
                    const cleanProductName = option.name.toLowerCase().replace(/["'\s]/g, '');
                    const cleanInputValue = inputValue.replace(/["'\s]/g, '');
                    return cleanProductName.includes(cleanInputValue);
                  });
                  if (inputValue === '') {
                    filtered = filtered.filter(p => !p.name.includes('"') && !p.name.includes("'") && !p.name.includes(' '));
                  }
                  return filtered;
                }}
                getOptionLabel={(product) => `${product.name} - ₹${product.price}`}
                renderOption={(props, option) => ( // Modify renderOption
                  <Box component="li" {...props} key={option.id}>
                    <ListItemText
                      primary={option.name}
                      secondary={
                        <>
                          {/* <Typography component="span" variant="body2" color="text.primary">Price: ₹{option.price.toFixed(2)}</Typography> */}
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>Stock: {option.stock !== undefined ? option.stock : 'N/A'}</Typography> {/* Display stock */}
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>Category: {option.category || 'N/A'}</Typography>
                        </>
                      }
                    />
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Products"
                    disabled={loadingProducts}
                    placeholder="Type to search..."
                    size="small"
                    onKeyDown={handleProductKeyPress}
                    inputRef={productSearchRef}
                  />
                )}
                onBlur={handleProductFocusOut}
                onChange={(_, product) => {
                  if (product) {
                    if (lineItems.length < 25) {
                      let discount = 0;
                      let discountType: 'none' | 'category' | 'product' | 'custom' = 'none';
                      
                      if (selectedParty) {
                        const categoryDiscount = selectedParty.categoryDiscounts[product.category] || 0;
                        const productDiscount = selectedParty.productDiscounts?.[product.id] || 0;
                        
                        if (productDiscount > 0) {
                          discount = productDiscount;
                          discountType = 'product';
                        } else if (categoryDiscount > 0) {
                          discount = categoryDiscount;
                          discountType = 'category';
                        }
                      }
                      
                      const gstRate = selectedParty?.gstRate || 0;
                      const finalPrice = parseFloat((product.price * (1 - discount/100) * 1 * (1 + gstRate / 100)).toFixed(2));
                      
                      const newItem: InvoiceLineItem = {
                        productId: product.id,
                        name: product.name,
                        description: '',
                        quantity: 1,
                        price: product.price,
                        purchasePrice: product.purchasePrice,
                        category: product.category || '',
                        discount: discount,
                        discountType: discountType,
                        finalPrice: finalPrice
                      };
                      
                      setLineItems(prev => [...prev, newItem]);
                      
                      setTimeout(() => {
                        if (quantityInputRef.current) {
                          quantityInputRef.current.focus();
                          quantityInputRef.current.select();
                        }
                      }, 100);
                    } else {
                      setWarningMessage('Maximum 25 items allowed per invoice. Please remove some items to add new ones.');
                    }
                    setSelectedProductId('');
                  } else {
                    setSelectedProductId('');
                  }
                }}
                value={products.find(p => p.id === selectedProductId) || null}
                loading={loadingProducts}
                loadingText="Loading products..."
                noOptionsText={
                  <Box sx={{ textAlign: 'center', py: 2, px: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                      No products found
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Create a new product with the details below
                    </Typography>
                    <Button 
                      size="small" 
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const searchText = document.querySelector('input[placeholder="Type to search..."]') as HTMLInputElement;
                        const searchedName = searchText && searchText.value.trim() ? searchText.value.trim() : '';
                        handleOpenProductDialog(searchedName, true);
                      }}
                      disabled={lineItems.length >= 25}
                      startIcon={<AddIcon />}
                      title={lineItems.length >= 25 ? 'Maximum 25 items allowed per invoice' : 'Create a new product'}
                      sx={{ mt: 1 }}
                    >
                      Create New Product {lineItems.length >= 25 ? '(Max 25 reached)' : ''}
                    </Button>
                  </Box>
                }
              />
            )}
            
            {!productsError && (
              <Box sx={{ display: 'flex', gap: 1, alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  disabled={!selectedProductId || lineItems.length >= 25}
                  size="small"
                  sx={{ minWidth: 'auto' }}
                  title={lineItems.length >= 25 ? 'Maximum 25 items allowed per invoice' : ''}
                >
                  Add {lineItems.length >= 25 ? '(Max 25)' : `(${lineItems.length}/25)`}
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenProductDialog()}
                  disabled={lineItems.length >= 25}
                  size="small"
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                  title={lineItems.length >= 25 ? 'Maximum 25 items allowed per invoice' : ''}
                >
                  New Product
                </Button>
              </Box>
            )}
          </Box>

      
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back to Details
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              disabled={!canProceedToSummary}
            >
              Next: Review
            </Button>
          </Box>
        </TabPanel>
        
        {/* Summary Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Invoice Summary
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight="medium">Invoice Number:</Typography>
                  <Typography variant="body1">{invoiceNumber}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight="medium">Date:</Typography>
                  <Typography variant="body1">{invoiceDate}</Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight="medium">Party:</Typography>
                  <Typography variant="body1">{selectedParty?.name}</Typography>
                </Box>
                
                {selectedParty?.email && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight="medium">Email:</Typography>
                    <Typography variant="body1">{selectedParty.email}</Typography>
                  </Box>
                )}
                
                {selectedParty?.phone && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight="medium">Phone:</Typography>
                    <Typography variant="body1">{selectedParty.phone}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
            
            <Typography variant="h6" gutterBottom>
              Products
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    {showDescriptionColumn && (
                      <TableCell>Description</TableCell>
                    )}
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      {showDescriptionColumn && (
                        <TableCell>{item.description || '-'}</TableCell>
                      )}
                      <TableCell align="right">₹{item.price}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {item.discount}%
                        {item.discountType === 'category' && ' (Category)'}
                        {item.discountType === 'product' && ' (Product)'}
                        {item.discountType === 'custom' && ' (Custom)'}
                      </TableCell>
                      <TableCell align="right">₹{item.finalPrice}</TableCell>
                    </TableRow>
                  ))}
                  
                  <TableRow>
                    <TableCell colSpan={showDescriptionColumn ? 5 : 4} align="right">
                      <Typography variant="subtitle2">Subtotal:</Typography>
                    </TableCell>
                    <TableCell align="right">₹{subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={showDescriptionColumn ? 5 : 4} align="right">
                      <Typography variant="subtitle2">Discount:</Typography>
                    </TableCell>
                    <TableCell align="right">₹{discountAmount.toFixed(2)}</TableCell>
                  </TableRow>

                  {/* DP Row */}
                  <TableRow>
                    <TableCell colSpan={showDescriptionColumn ? 5 : 4} align="right">
                      <Typography variant="subtitle2">DP:</Typography>
                    </TableCell>
                    <TableCell align="right">₹{totalMargin.toFixed(2)}</TableCell>
                  </TableRow>
                  
                  {/* Transport Charges Row */}
                  <TableRow>
                    <TableCell colSpan={showDescriptionColumn ? 5 : 4} align="right">
                      <Typography variant="subtitle2">Transport Charges:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={transportCharges}
                        onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: <span style={{ fontSize: '0.8rem', marginRight: '2px' }}>₹</span>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ width: '100px', textAlign: 'right' }}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        onFocus={(e) => e.target.select()}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Round Off Row */}
                  <TableRow>
                    <TableCell colSpan={showDescriptionColumn ? 5 : 4} align="right">
                      <Typography variant="subtitle2" color={roundOffAmount >= 0 ? 'success.main' : 'error.main'}>
                        Round Off:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color={roundOffAmount >= 0 ? 'success.main' : 'error.main'}>
                        {roundOffAmount >= 0 ? '+' : ''}₹{roundOffAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Grand Total Row */}
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell colSpan={showDescriptionColumn ? 5 : 4} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">Grand Total:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        ₹{total.toFixed(0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Notes Section */}
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              size="small"
              placeholder="Add any additional notes here..."
              sx={{ mb: 3 }} // Add margin below notes
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back to Products
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveInvoice}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {invoiceId ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Party Creation Dialog */}
      <Dialog open={openPartyDialog} onClose={() => setOpenPartyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Party</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Party Name"
              name="name"
              value={newParty.name}
              onChange={handlePartyInputChange}
              fullWidth
              required
              error={!newParty.name && creatingParty}
              helperText={!newParty.name && creatingParty ? "Party name is required" : ""}
            />
            
            <TextField
              label="Email"
              name="email"
              type="email"
              value={newParty.email}
              onChange={handlePartyInputChange}
              fullWidth
            />
            
            <TextField
              label="Phone"
              name="phone"
              value={newParty.phone}
              onChange={handlePartyInputChange}
              fullWidth
            />
            
            <TextField
              label="Address"
              name="address"
              value={newParty.address}
              onChange={handlePartyInputChange}
              fullWidth
              multiline
              rows={3}
            />
            
            {/* Category Discounts Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PercentIcon fontSize="small" sx={{ mr: 1 }} />
                Category Discounts
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {Object.keys(newParty.categoryDiscounts).length > 0 
                    ? `${Object.keys(newParty.categoryDiscounts).length} category discount${Object.keys(newParty.categoryDiscounts).length > 1 ? 's' : ''} configured` 
                    : 'No category discounts configured'}
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setOpenNewPartyCategoryDiscountEditor(true)}
                  startIcon={<PercentIcon />}
                >
                  Configure Discounts
                </Button>
              </Box>
              
              {Object.keys(newParty.categoryDiscounts).length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(newParty.categoryDiscounts).map(([category, discount]) => (
                    <Chip 
                      key={category}
                      label={`${category}: ${discount}%`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPartyDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateParty} 
            variant="contained" 
            disabled={creatingParty || !newParty.name}
            startIcon={creatingParty ? <CircularProgress size={20} /> : null}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Product Dialog */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isQuickCreateMode ? '⚡ Create Product Not Found' : 'Create New Product'}
        </DialogTitle>
        <DialogContent>
          {isQuickCreateMode && (
            <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
              Product not found. Fill in the details below to create it and add to your invoice.
            </Alert>
          )}
          <Box sx={{ mt: isQuickCreateMode ? 1 : 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              fullWidth
              required
              error={!!productCreationErrors.name}
              helperText={productCreationErrors.name || validateProductName(newProductName || '') || 'Enter product name'}
              placeholder="e.g., Laptop, Shirt, Food Items"
              autoFocus
            />
            
            {!isQuickCreateMode && (
              <TextField
                label="Description (Optional)"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Add details about this product..."
                helperText="Helps identify the product later"
              />
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price"
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(parseFloat(e.target.value) || 0)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <span style={{ fontSize: '0.8rem', marginRight: '2px' }}>₹</span>
                }}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!productCreationErrors.price}
                helperText={productCreationErrors.price || 'Selling price'}
                placeholder="0.00"
              />
              <TextField
                label="Purchase Price (Optional)"
                type="number"
                value={newProductPurchasePrice}
                onChange={(e) => setNewProductPurchasePrice(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <span style={{ fontSize: '0.8rem', marginRight: '2px' }}>₹</span>
                }}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!productCreationErrors.purchasePrice}
                helperText={productCreationErrors.purchasePrice || 'Cost price'}
                placeholder="0.00"
              />
            </Box>

            <TextField
              label="Stock Quantity (Optional)"
              type="number"
              value={newProductStock}
              onChange={(e) => setNewProductStock(parseInt(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              error={!!productCreationErrors.stock}
              helperText={productCreationErrors.stock || 'Initial stock (can be updated later)'}
              placeholder="0"
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormControl fullWidth disabled={useCustomCategory}>
                  <InputLabel id="new-product-category-label">Category</InputLabel>
                  <Select
                    labelId="new-product-category-label"
                    value={newProductCategory}
                    onChange={(e: SelectChangeEvent) => setNewProductCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCategoryDialog(true)}
                  disabled={useCustomCategory || creatingProduct}
                  sx={{ minWidth: 'auto', whiteSpace: 'nowrap', mt: 1 }}
                  size="small"
                >
                  New Category
                </Button>
              </Box>
              
              {!isQuickCreateMode && (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    p: 1, 
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    <Checkbox
                      checked={useCustomCategory}
                      onChange={(e) => {
                        setUseCustomCategory(e.target.checked);
                        console.log('Custom category checkbox changed:', e.target.checked);
                      }}
                      id="use-custom-category"
                      color="primary"
                    />
                    <Typography component="label" htmlFor="use-custom-category" sx={{ fontWeight: useCustomCategory ? 'bold' : 'normal' }}>
                      Enter a custom category instead
                    </Typography>
                  </Box>
                  
                  {useCustomCategory && (
                    <TextField
                      label="Custom Category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      fullWidth
                      required
                      error={!customCategory.trim() && creatingProduct}
                      helperText={!customCategory.trim() && creatingProduct ? "Custom category is required" : ""}
                      placeholder="e.g., Electronics, Clothing, etc."
                    />
                  )}
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button 
            onClick={() => {
              setOpenProductDialog(false);
              setProductCreationErrors({});
            }}
            disabled={creatingProduct}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProduct} 
            variant="contained"
            color="primary"
            disabled={
              creatingProduct || 
              !newProductName.trim() || 
              newProductPrice <= 0 ||
              (useCustomCategory && !customCategory.trim())
            }
            startIcon={creatingProduct ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {creatingProduct ? 'Creating...' : 'Create & Add to Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Category Discount Editor Dialog for Selected Party */}
      {selectedParty && (
        <CategoryDiscountEditor
          open={openCategoryDiscountEditor}
          onClose={() => setOpenCategoryDiscountEditor(false)}
          partyId={selectedParty.id}
          categoryDiscounts={selectedParty.categoryDiscounts}
          onSave={handleUpdateCategoryDiscounts}
        />
      )}
      
      {/* Category Discount Editor Dialog for New Party */}
      <CategoryDiscountEditor
        open={openNewPartyCategoryDiscountEditor}
        onClose={() => setOpenNewPartyCategoryDiscountEditor(false)}
        partyId="new-party" // Temporary ID for new party
        categoryDiscounts={newParty.categoryDiscounts}
        onSave={handleUpdateNewPartyCategoryDiscounts}
      />
      
      {/* New Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              fullWidth
              required
              error={!newCategoryName.trim() && creatingCategory}
              helperText={!newCategoryName.trim() && creatingCategory ? "Category name is required" : ""}
              placeholder="e.g., Electronics, Clothing, Food Items"
            />
            
            <TextField
              label="Description (Optional)"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief description of this category"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCategory} 
            variant="contained" 
            disabled={creatingCategory || !newCategoryName.trim()}
            startIcon={creatingCategory ? <CircularProgress size={20} /> : null}
          >
            Create Category
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
      
      {/* Warning Message Snackbar */}
      <Snackbar
        open={!!warningMessage}
        autoHideDuration={8000}
        onClose={() => setWarningMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setWarningMessage(null)} 
          severity="warning" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {warningMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}