'use client';
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  ColorLens as ColorIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Category } from '@/types/inventory';
import { categoryService } from '@/services/categoryService';

interface CategoryFormProps {
  initialData?: Partial<Category>;
  onSubmit: (data: Omit<Category, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PREDEFINED_COLORS = [
  '#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#607d8b', '#e91e63', '#f44336'
];

const PREDEFINED_ICONS = [
  'category', 'inventory', 'shopping_cart', 'store', 'local_grocery_store',
  'restaurant', 'computer', 'phone_android', 'home', 'directions_car',
  'sports_esports', 'book', 'music_note', 'movie', 'fitness_center'
];

const COMMON_TAGS = [
  'Electronics', 'Food', 'Clothing', 'Books', 'Home & Garden',
  'Sports', 'Automotive', 'Health', 'Beauty', 'Toys',
  'Office Supplies', 'Pet Supplies', 'Jewelry', 'Tools', 'Music'
];

export default function CategoryForm({ initialData, onSubmit, onCancel, loading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    parentId: initialData?.parentId,
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder || 0,
    defaultDiscount: initialData?.defaultDiscount || 0,
    color: initialData?.color || '#1976d2',
    icon: initialData?.icon || 'category',
    tags: initialData?.tags || [],
    createdAt: initialData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadParentCategories();
  }, []);

  const loadParentCategories = async () => {
    try {
      setLoadingData(true);
      const categories = await categoryService.getCategories({ includeInactive: false });
      // Exclude current category if editing
      const filteredCategories = initialData?.id 
        ? categories.filter(cat => cat.id !== initialData.id)
        : categories;
      setParentCategories(filteredCategories);
    } catch (error) {
      console.error('Error loading parent categories:', error);
    } finally {
      setLoadingData(false);
    }
  };

  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (formData.defaultDiscount < 0 || formData.defaultDiscount > 100) {
      newErrors.defaultDiscount = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleTagAdd = (newTag: string) => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag]
      });
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToDelete) || []
    });
  };



  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{
            bgcolor: formData.color || '#1976d2',
            width: 48,
            height: 48,
            mr: 2
          }}>
            <span className="material-icons">{formData.icon}</span>
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {initialData?.id ? 'Edit Category' : 'Create New Category'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {initialData?.id ? 'Update category details and settings' : 'Set up a new category for your products'}
            </Typography>
          </Box>
        </Box>

        {/* Quick Preview */}
        <Box sx={{ textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
          <Chip
            label={formData.name || 'Category Name'}
            size="small"
            sx={{
              bgcolor: formData.color || '#1976d2',
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Preview
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2
          }}>
            <CategoryIcon sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Essential details for your category
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Category Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
              label="Parent Category"
            >
              <MenuItem value="">
                <em>None (Root Category)</em>
              </MenuItem>
              {parentCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what products belong to this category..."
          />
        </Grid>

        {/* Visual Customization */}
        <Grid item xs={12}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            p: 2,
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            borderRadius: 2
          }}>
            <ColorIcon sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Visual Customization
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Choose colors and icons to make your category stand out
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <ColorIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              Category Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
              {PREDEFINED_COLORS.map((color) => (
                <Tooltip key={color} title={color}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: color,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: formData.color === color ? `3px solid ${color}` : '2px solid transparent',
                      boxShadow: formData.color === color ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                </Tooltip>
              ))}
            </Box>
            <TextField
              fullWidth
              label="Custom Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              sx={{
                '& input': {
                  height: 56,
                  cursor: 'pointer'
                }
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Category Icon
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Choose Icon</InputLabel>
              <Select
                value={formData.icon || 'category'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                label="Choose Icon"
              >
                {PREDEFINED_ICONS.map((icon) => (
                  <MenuItem key={icon} value={icon} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>
                      {icon}
                    </span>
                    <Typography sx={{ textTransform: 'capitalize' }}>{icon.replace('_', ' ')}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Live Preview */}
          <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
              Live Preview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: formData.color,
                  width: 40,
                  height: 40,
                  boxShadow: 2
                }}
              >
                <span className="material-icons">{formData.icon}</span>
              </Avatar>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.name || 'Category Name'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Default Settings */}
        <Grid item xs={12}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            p: 2,
            bgcolor: 'info.main',
            color: 'info.contrastText',
            borderRadius: 2
          }}>
            <InfoIcon sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Default Settings
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Configure default values for products in this category
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Default Discount (%)"
            value={formData.defaultDiscount}
            onChange={(e) => setFormData({ ...formData, defaultDiscount: Number(e.target.value) })}
            InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
            error={!!errors.defaultDiscount}
            helperText={errors.defaultDiscount || 'Applied to new products in this category'}
          />
        </Grid>

        
        {/* Tags */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Tags & Organization
            </Typography>
            <Autocomplete
              multiple
              freeSolo
              options={COMMON_TAGS}
              value={formData.tags || []}
              onChange={(_, newValue) => {
                setFormData({ ...formData, tags: newValue });
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="filled"
                    color="primary"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Add tags to help organize and search categories"
                  helperText="Choose from suggestions or type custom tags (press Enter)"
                />
              )}
            />
          </Paper>
        </Grid>

        {/* Advanced Settings */}
        <Grid item xs={12}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            p: 2,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            borderRadius: 2
          }}>
            <SettingsIcon sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Advanced Settings
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Fine-tune category behavior and organization
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Sort Order"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
            helperText="Lower numbers appear first in lists"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Active"
          />
          <Typography variant="body2" color="text.secondary">
            Inactive categories are hidden from product forms
          </Typography>
        </Grid>

        {/* Metadata Display (for editing existing categories) */}
        {initialData?.metadata && (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Category Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {initialData.metadata.totalProducts || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    ₹{(initialData.metadata.totalValue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    ₹{(initialData.metadata.averagePrice || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Price
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Form Actions */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="info" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {initialData?.id ? 'Changes will be saved to this category' : 'This will create a new category in your inventory'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CategoryIcon />}
                  size="large"
                  sx={{ minWidth: 150 }}
                >
                  {loading ? 'Saving...' : (initialData?.id ? 'Update Category' : 'Create Category')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <Typography variant="body2">{error}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
}