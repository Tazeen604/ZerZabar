# Dashboard and Inventory Consistency Fix

## Problem
Dashboard and inventory page were showing different low stock counts because they used different calculation logic.

## Root Cause
- **Inventory Page**: Uses `SettingsContext.getStockStatus()` with admin-configurable `low_stock_threshold`
- **Dashboard**: Was using hardcoded threshold (10) and different calculation logic

## Solution Implemented

### 1. Added SettingsContext Integration
```javascript
import { useSettings } from '../contexts/SettingsContext';

const { getSetting, getStockStatus, refreshSettings } = useSettings();
```

### 2. Added Settings Refresh
```javascript
useEffect(() => {
  const loadDashboardData = async () => {
    // Refresh settings first to ensure we have latest threshold values
    await refreshSettings();
    await fetchDashboardData();
    // ...
  };
  loadDashboardData();
}, []);
```

### 3. Implemented Same Logic as Inventory Page

#### getComputedTotal Function (Exact Copy)
```javascript
const getComputedTotal = (product) => {
  const invQty = product.inventory && typeof product.inventory.quantity !== 'undefined'
    ? Number(product.inventory.quantity) || 0
    : null;
  const variantsQty = Array.isArray(product.variants)
    ? product.variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0)
    : null;
  const totalQtyField = typeof product.total_quantity !== 'undefined' ? Number(product.total_quantity) || 0 : 0;
  return invQty !== null ? invQty : (variantsQty !== null ? variantsQty : totalQtyField);
};
```

#### Low Stock Calculation (Same Logic)
```javascript
const calculateLowStockProducts = () => {
  const products = data.products?.recent_products || [];
  if (products && Array.isArray(products)) {
    const lowStockProducts = products.filter(product => {
      // Calculate total quantity for the product (same logic as inventory page)
      const totalQuantity = getComputedTotal(product);
      
      // Use the same stock status logic as inventory page
      const stockStatus = getStockStatus(totalQuantity);
      return stockStatus.status === 'low_stock';
    });
    return lowStockProducts.length;
  }
  return 0;
};
```

#### Out of Stock Calculation (Same Logic)
```javascript
const calculateOutOfStockProducts = () => {
  const products = data.products?.recent_products || [];
  if (products && Array.isArray(products)) {
    return products.filter(product => {
      const totalQuantity = getComputedTotal(product);
      const stockStatus = getStockStatus(totalQuantity);
      return stockStatus.status === 'out_of_stock';
    }).length;
  }
  return 0;
};
```

## Key Features

### 1. Admin-Configurable Threshold
- Uses `getSetting('low_stock_threshold', 10)` from admin settings
- Same threshold used by inventory page
- Admin can change threshold and both pages update

### 2. Identical Stock Status Logic
- Uses `getStockStatus(totalQuantity)` from SettingsContext
- Same logic: `quantity <= threshold && quantity > 0` for low stock
- Same logic: `quantity <= 0` for out of stock

### 3. Same Product Quantity Calculation
- Uses `getComputedTotal(product)` function
- Handles inventory quantity, variants quantity, and total_quantity field
- Same priority: inventory > variants > total_quantity

## Expected Result
- **Dashboard**: Shows count of products with low stock (using admin threshold)
- **Inventory**: Shows count of products with low stock (using admin threshold)
- **Consistency**: Both pages show identical counts
- **Admin Control**: Admin can change threshold and both pages reflect the change

## Settings Integration
The dashboard now respects:
- `low_stock_threshold` (default: 10)
- `out_of_stock_threshold` (default: 0)
- All other admin settings from SettingsContext

Both pages now use the exact same calculation logic and will always show consistent results.















