import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, X, Edit3, Trash2, Save, XCircle, Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchProducts, deleteProduct, updateProduct } from '../utils/api';
import '../style/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    imageUrl: ''
  });

  // Same filter states as CreateOrder
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [products, searchTerm, categoryFilter, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchProducts();
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error('Error loading products:', error);
      showMessage('❌ Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Exact same filtering logic as CreateOrder
  const applyFiltersAndSorting = () => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(p => 
        p.category.toLowerCase().startsWith(categoryFilter.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock-asc') {
      result.sort((a, b) => a.stockQuantity - b.stockQuantity);
    } else if (sortBy === 'stock-desc') {
      result.sort((a, b) => b.stockQuantity - a.stockQuantity);
    }

    setFilteredProducts(result);
  };

  // Get unique categories for filter suggestions
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.stockQuantity > 0).length;
    const outOfStock = products.filter(p => p.stockQuantity === 0).length;
    const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);

    return { totalProducts, inStock, outOfStock, lowStock, totalValue };
  }, [products]);

  const showMessage = (text, type) => {
    setAlert({ show: true, message: text, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSortBy('name-asc');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDelete = async (id) => {
    const product = products.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      try {
        await deleteProduct(id);
        showMessage(`✅ ${product?.name} deleted successfully`, 'success');
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('❌ Failed to delete product', 'error');
      }
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      name: '',
      description: '',
      price: '',
      category: '',
      stockQuantity: '',
      imageUrl: ''
    });
  };

  const handleUpdate = async () => {
    if (!editData.name.trim() || !editData.description.trim() || !editData.category.trim()) {
      showMessage('❌ Please fill in all required fields', 'error');
      return;
    }

    if (editData.price <= 0) {
      showMessage('❌ Price must be greater than 0', 'error');
      return;
    }

    if (editData.stockQuantity < 0) {
      showMessage('❌ Stock quantity cannot be negative', 'error');
      return;
    }

    try {
      const updatedData = {
        ...editData,
        price: parseFloat(editData.price),
        stockQuantity: parseInt(editData.stockQuantity)
      };
      
      await updateProduct(editingId, updatedData);
      const product = products.find(p => p.id === editingId);
      showMessage(`✅ ${product?.name} updated successfully`, 'success');
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      showMessage('❌ Failed to update product', 'error');
    }
  };

  const hasActiveFilters = searchTerm || categoryFilter || sortBy !== 'name-asc';

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
      {/* Enhanced Alert System */}
      {alert.show && (
        <div className="alert-overlay">
          <div className={`alert-window ${alert.type}`}>
            <div className="alert-content">
              <div className="alert-icon">
                {alert.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
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
        {/* Enhanced Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-info">
              <h1 className="page-title">
                <Package className="header-icon" />
                Product Inventory
              </h1>
              <p className="page-subtitle">Manage your product catalog with ease</p>
            </div>
            
            {/* Enhanced Statistics */}
            <div className="stats-grid">
              <div className="stat-card stat-total">
                <div className="stat-icon">
                  <Package size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value">{stats.totalProducts}</div>
                </div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">In Stock</div>
                  <div className="stat-value">{stats.inStock}</div>
                </div>
              </div>
              <div className="stat-card stat-danger">
                <div className="stat-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Out of Stock</div>
                  <div className="stat-value">{stats.outOfStock}</div>
                </div>
              </div>
              <div className="stat-card stat-warning">
                <div className="stat-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Low Stock</div>
                  <div className="stat-value">{stats.lowStock}</div>
                </div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Value</div>
                  <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="filters-card">
          <div className="filters-header">
            <button 
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              <span>Filters & Search</span>
              <div className={`chevron ${showFilters ? 'open' : ''}`}>
                {showFilters ? '▲' : '▼'}
              </div>
              {hasActiveFilters && <div className="active-filters-indicator"></div>}
            </button>
            
            <div className="results-count">
              <span className="results-text">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
          </div>
          
          <div className={`filters-content ${showFilters ? 'expanded' : ''}`}>
            <div className="filters-grid">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <div className="category-filter-wrapper">
                <input
                  type="text"
                  placeholder="Filter by category..."
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="filter-input"
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {categoryFilter && (
                  <button 
                    className="clear-category-btn"
                    onClick={() => setCategoryFilter('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
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
              
              {hasActiveFilters && (
                <button 
                  type="button" 
                  onClick={clearFilters} 
                  className="clear-filters-btn"
                >
                  <X size={16} />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Products Table */}
        <div className="table-card">
          <div className="table-header">
            <h2 className="table-title">Products ({filteredProducts.length})</h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Package size={48} />
              </div>
              <h3 className="empty-title">No products found</h3>
              <p className="empty-subtitle">
                {hasActiveFilters 
                  ? "Try adjusting your search or filters" 
                  : "Start by adding your first product"
                }
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="empty-action-btn">
                  Clear Filters
                </button>
              )}
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
                    <th>Image</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr 
                      key={product.id} 
                      className={`product-row ${editingId === product.id ? 'editing' : ''}`}
                    >
                      <td className="product-cell">
                        {editingId === product.id ? (
                          <div className="edit-product-info">
                            <input 
                              value={editData.name} 
                              onChange={e => setEditData({ ...editData, name: e.target.value })} 
                              className="edit-input" 
                              placeholder="Product name"
                              required
                            />
                          </div>
                        ) : (
                          <div className="product-info">
                            <div className="product-name">{product.name}</div>
                          </div>
                        )}
                      </td>
                      
                      <td className="description-cell">
                        {editingId === product.id ? (
                          <textarea 
                            value={editData.description} 
                            onChange={e => setEditData({ ...editData, description: e.target.value })} 
                            className="edit-textarea" 
                            rows="2"
                            placeholder="Product description"
                            required
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
                            className="edit-input" 
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            required
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
                            list="edit-categories-list"
                            required
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
                            className="edit-input"
                            min="0"
                            placeholder="0"
                            required
                          />
                        ) : (
                          <span className={`stock-badge ${
                            product.stockQuantity === 0 ? 'out-of-stock' : 
                            product.stockQuantity <= 10 ? 'low-stock' : 'in-stock'
                          }`}>
                            {product.stockQuantity === 0 ? 'Out of Stock' : product.stockQuantity}
                          </span>
                        )}
                      </td>
                      
                      <td>
                        {editingId === product.id ? (
                          <input 
                            value={editData.imageUrl} 
                            onChange={e => setEditData({ ...editData, imageUrl: e.target.value })} 
                            className="edit-input" 
                            placeholder="Image URL (optional)"
                          />
                        ) : (
                          <div className="product-image-container">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="product-image"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`product-image-fallback ${product.imageUrl ? 'hidden' : ''}`}>
                              <Package size={16} />
                            </div>
                          </div>
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
                              <Edit3 size={16} />
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

      {/* Hidden datalist for edit mode categories */}
      <datalist id="edit-categories-list">
        {categories.map(category => (
          <option key={category} value={category} />
        ))}
      </datalist>
    </div>
  );
};

export default ProductList;