# Firestore Index Documentation

## Overview
This directory contains automatically generated Firestore indexes for optimal query performance across all application pages.

## Generated Files

### `firestore.indexes.json`
The main index configuration file that should be deployed to Firebase.

### `deploy-indexes.sh`
Deployment script that:
- Backs up existing indexes
- Deploys new indexes to Firebase
- Provides deployment confirmation

### `validate-indexes.js`
Validation script that checks index structure and provides summary.

## Collections Covered

### products (12 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### parties (7 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### invoices (11 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### purchases (7 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### orders (7 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### categories (4 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### inventory (6 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### stockMovements (6 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### transactions (7 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### users (4 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### reports (4 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### settings (4 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)

### notifications (4 indexes)
Essential indexes for:
- Listing with filters and sorting
- User-specific queries
- Status-based filtering
- Date range queries
- Text search support (where applicable)


## Usage

1. **Validate indexes:**
   ```bash
   ./validate-indexes.js
   ```

2. **Deploy to Firebase:**
   ```bash
   ./deploy-indexes.sh
   ```

3. **Monitor performance:**
   - Firebase Console → Firestore → Usage tab
   - Check for slow queries
   - Monitor index usage

## Index Types Included

1. **Basic Filters:** isActive, status, type fields
2. **User Queries:** userId-based filtering with sorting
3. **Relationship Queries:** Foreign key relationships (partyId, productId, etc.)
4. **Date Queries:** createdAt, updatedAt with DESC ordering
5. **Amount Queries:** price, totalAmount with DESC ordering
6. **Search Support:** searchTerms array-contains indexes
7. **Status Combinations:** Multi-field status queries

## Performance Notes

- All indexes are optimized for common query patterns
- Array-contains indexes support text search
- Composite indexes reduce query complexity
- Proper field ordering minimizes index size

## Maintenance

Re-run the index generator when:
- Adding new collections
- Changing query patterns
- Adding new filter combinations
- Optimizing slow queries

Generated on: 2025-08-28T04:39:46.183Z
