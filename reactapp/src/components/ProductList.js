import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, Edit2, Trash2, Save, XCircle, Package, AlertCircle, CheckCircle } from 'lucide-react';
import './ProductList.css';

// Mock API functions - replace with your actual API
const mockAPI = {
  fetchProducts: () => Promise.resolve({
    data: [
      { id: 1, name: 'Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 2999, category: 'Electronics', stockQuantity: 25, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
      { id: 2, name: 'Smart Watch', description: 'Feature-rich smartwatch with health monitoring', price: 4999, category: 'Electronics', stockQuantity: 0, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop' },
      { id: 3, name: 'Coffee Mug', description: 'Premium ceramic coffee mug', price: 299, category: 'Home & Kitchen', stockQuantity: 50, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=100&h=100&fit=crop' },
      { id: 4, name: 'Yoga Mat', description: 'Non-slip exercise yoga mat', price: 799, category: 'Sports', stockQuantity: 15, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop' },
      { id: 5, name: 'Bluetooth Speaker', description: 'Portable wireless speaker with excellent sound quality', price: 1999, category: 'Electronics', stockQuantity: 8, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop' }
    ]
  }),
  deleteProduct: (id) => Promise.resolve({ success: true }),
  updateProduct: (id, data) => Promise.resolve({ success: true, data })
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [editData, setEditData] = useState({
    name: '', description: '', price: '', category: '', stockQuantity: '', imageUrl: ''
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [stockFilter, setStockFilter] = useState('all');

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await mockAPI.fetchProducts();
      setProducts(res.data);
    } catch (error) {
      console.error('Error loading products:', error);
      showAlert('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(p => 
        p.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Stock filter
    if (stockFilter === 'in-stock') {
      result = result.filter(p => p.stockQuantity > 0);
    } else if (stockFilter === 'out-of-stock') {
      result = result.filter(p => p.stockQuantity === 0);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock-asc': return a.stockQuantity - b.stockQuantity;
        case 'stock-desc': return b.stockQuantity - a.stockQuantity;
        default: return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, searchTerm, categoryFilter, sortBy, stockFilter]);

  // Get unique categories
  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category))].sort()
  , [products]);

  const showAlert = useCallback((message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('');
    setStockFilter('all');
    setSortBy('name-asc');
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const handleDelete = useCallback(async (id) => {
    const product = products.find(p => p.id === id);
    if (window.confirm(`Delete "${product?.name}"? This action cannot be undone.`)) {
      try {
        await mockAPI.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        showAlert(`${product?.name} deleted successfully`, 'success');
      } catch (error) {
        console.error('Error deleting product:', error);
        showAlert('Failed to delete product', 'error');
      }
    }
  }, [products, showAlert]);

  const startEdit = useCallback((product) => {
    setEditingId(product.id);
    setEditData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stockQuantity: product.stockQuantity.toString(),
      imageUrl: product.imageUrl || ''
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditData({ name: '', description: '', price: '', category: '', stockQuantity: '', imageUrl: '' });
  }, []);

  const validateEditData = useCallback(() => {
    const errors = [];
    
    if (!editData.name.trim()) errors.push('Product name is required');
    if (!editData.description.trim()) errors.push('Description is required');
    if (!editData.category.trim()) errors.push('Category is required');
    
    const price = parseFloat(editData.price);
    if (isNaN(price) || price <= 0) errors.push('Price must be a valid number greater than 0');
    
    const stock = parseInt(editData.stockQuantity);
    if (isNaN(stock) || stock < 0) errors.push('Stock quantity must be a valid number >= 0');
    
    return errors;
  }, [editData]);

  const handleUpdate = useCallback(async () => {
    const validationErrors = validateEditData();
    if (validationErrors.length > 0) {
      showAlert(validationErrors[0], 'error');
      return;
    }

    try {
      const updatedData = {
        ...editData,
        price: parseFloat(editData.price),
        stockQuantity: parseInt(editData.stockQuantity)
      };
      
      await mockAPI.updateProduct(editingId, updatedData);
      
      setProducts(prev => prev.map(p => 
        p.id === editingId ? { ...p, ...updatedData } : p
      ));
      
      const product = products.find(p => p.id === editingId);
      showAlert(`${product?.name} updated successfully`, 'success');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating product:', error);
      showAlert('Failed to update product', 'error');
    }
  }, [editData, editingId, products, showAlert, validateEditData]);

  // Statistics
  const stats = useMemo(() => ({
    total: products.length,
    filtered: filteredProducts.length,
    inStock: filteredProducts.filter(p => p.stockQuantity > 0).length,
    outOfStock: filteredProducts.filter(p => p.stockQuantity === 0).length,
    totalValue: filteredProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  }), [products, filteredProducts]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Alert System */}
      {alert.show && (
        <div className="alert-overlay">
          <div className={`alert-window alert-${alert.type}`}>
            <div className="alert-content">
              {alert.type === 'success' ? 
                <CheckCircle className="alert-icon" /> :
                <AlertCircle className="alert-icon" />
              }
              <span className="alert-message">{alert.message}</span>
              <button
                className="alert-close"
                onClick={() => setAlert({ show: false, message: '', type: '' })}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-container">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-info">
              <h1 className="page-title">Product Inventory</h1>
              <p className="page-subtitle">Manage your product catalog and inventory</p>
            </div>
            
            {/* Statistics */}
            <div className="stats-grid">
              <div className="stat-card stat-total">
                <div className="stat-label">Total Products</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-label">In Stock</div>
                <div className="stat-value">{stats.inStock}</div>
              </div>
              <div className="stat-card stat-danger">
                <div className="stat-label">Out of Stock</div>
                <div className="stat-value">{stats.outOfStock}</div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-label">Total Value</div>
                <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <div className="filters-header">
            <Filter size={20} className="filters-icon" />
            <h2 className="filters-title">Search & Filter</h2>
          </div>
          
          <div className="filters-grid">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock Only</option>
              <option value="out-of-stock">Out of Stock Only</option>
            </select>
            
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low-High)</option>
              <option value="price-desc">Price (High-Low)</option>
              <option value="stock-asc">Stock (Low-High)</option>
              <option value="stock-desc">Stock (High-Low)</option>
            </select>
            
            <button onClick={clearFilters} className="clear-filters-btn">
              <X size={16} />
              Clear
            </button>
            
            <div className="results-count">
              <span>{stats.filtered} of {stats.total} products</span>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-card">
          <div className="table-header">
            <h2 className="table-title">Products ({stats.filtered})</h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Package size={48} className="empty-icon" />
              <h3 className="empty-title">No products found</h3>
              <p className="empty-subtitle">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className={`product-row ${editingId === product.id ? 'editing' : ''}`}>
                      <td className="product-cell">
                        {editingId === product.id ? (
                          <div className="edit-product-info">
                            <input
                              value={editData.name}
                              onChange={e => setEditData({ ...editData, name: e.target.value })}
                              className="edit-input"
                              placeholder="Product name"
                            />
                            <input
                              value={editData.imageUrl}
                              onChange={e => setEditData({ ...editData, imageUrl: e.target.value })}
                              className="edit-input"
                              placeholder="Image URL (optional)"
                            />
                          </div>
                        ) : (
                          <div className="product-info">
                            <div className="product-image-container">
                              {product.imageUrl ? (
                                <img
                                  className="product-image"
                                  src={product.imageUrl}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`product-image-fallback ${product.imageUrl ? 'hidden' : ''}`}>
                                <Package size={20} />
                              </div>
                            </div>
                            <div className="product-name">{product.name}</div>
                          </div>
                        )}
                      </td>
                      
                      <td className="description-cell">
                        {editingId === product.id ? (
                          <textarea
                            value={editData.description}
                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                            rows="3"
                            className="edit-textarea"
                            placeholder="Product description"
                          />
                        ) : (
                          <div className="product-description">{product.description}</div>
                        )}
                      </td>
                      
                      <td className="price-cell">
                        {editingId === product.id ? (
                          <input
                            type="number"
                            value={editData.price}
                            onChange={e => setEditData({ ...editData, price: e.target.value })}
                            min="0"
                            step="0.01"
                            className="edit-input"
                            placeholder="0.00"
                          />
                        ) : (
                          <div className="product-price">{formatCurrency(product.price)}</div>
                        )}
                      </td>
                      
                      <td className="category-cell">
                        {editingId === product.id ? (
                          <input
                            value={editData.category}
                            onChange={e => setEditData({ ...editData, category: e.target.value })}
                            className="edit-input"
                            placeholder="Category"
                          />
                        ) : (
                          <span className="category-badge">{product.category}</span>
                        )}
                      </td>
                      
                      <td className="stock-cell">
                        {editingId === product.id ? (
                          <input
                            type="number"
                            value={editData.stockQuantity}
                            onChange={e => setEditData({ ...editData, stockQuantity: e.target.value })}
                            min="0"
                            className="edit-input"
                            placeholder="0"
                          />
                        ) : (
                          <span className={`stock-badge ${
                            product.stockQuantity === 0 ? 'out-of-stock' :
                            product.stockQuantity < 10 ? 'low-stock' : 'in-stock'
                          }`}>
                            {product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} in stock`}
                          </span>
                        )}
                      </td>
                      
                      <td className="actions-cell">
                        {editingId === product.id ? (
                          <div className="action-buttons editing">
                            <button onClick={handleUpdate} className="btn btn-save">
                              <Save size={16} />
                              Save
                            </button>
                            <button onClick={cancelEdit} className="btn btn-cancel">
                              <XCircle size={16} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button onClick={() => startEdit(product)} className="btn btn-edit">
                              <Edit2 size={16} />
                              Edit
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="btn btn-delete">
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;