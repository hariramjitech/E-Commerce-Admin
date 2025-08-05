import React, { useEffect, useState } from 'react';
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
          <div className={`alert-window ${alert.type}`}>
            <div className="alert-content">
              <span className="alert-message">{alert.message}</span>
              <button 
                className="alert-close"
                onClick={() => setAlert({ show: false, message: '', type: '' })}
              >
                ×
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
              <h1>Product Inventory</h1>
              <p>Manage your product catalog</p>
            </div>
            <div className="header-summary">
              <div className="summary-badge total">
                {filteredProducts.length} of {products.length} products
              </div>
              <div className="summary-badge items">
                {filteredProducts.filter(p => p.stockQuantity > 0).length} in stock
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section - Same as CreateOrder */}
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Search & Filter Products</h2>
          </div>
          
          <div className="filters-section">
            <div className="filters-grid">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <input
                type="text"
                placeholder="Filter by category..."
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="filter-input"
              />
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
              <button 
                type="button" 
                onClick={clearFilters} 
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Products ({filteredProducts.length})</h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
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
                    <tr key={product.id} className={editingId === product.id ? 'editing-row' : ''}>
                      <td>
                        {editingId === product.id ? (
                          <input 
                            value={editData.name} 
                            onChange={e => setEditData({ ...editData, name: e.target.value })} 
                            className="edit-input" 
                            placeholder="Product name"
                            required
                          />
                        ) : (
                          <div className="product-name">{product.name}</div>
                        )}
                      </td>
                      
                      <td>
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
                      
                      <td>
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
                      
                      <td>
                        {editingId === product.id ? (
                          <input 
                            value={editData.category} 
                            onChange={e => setEditData({ ...editData, category: e.target.value })} 
                            className="edit-input"
                            placeholder="Category"
                            required
                          />
                        ) : (
                          <span className="product-category">{product.category}</span>
                        )}
                      </td>
                      
                      <td>
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
                            product.stockQuantity === 0 ? 'out-of-stock' : 'in-stock'
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
                          product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="product-image" />
                          ) : (
                            <span className="no-image">No Image</span>
                          )
                        )}
                      </td>
                      
                      <td>
                        {editingId === product.id ? (
                          <div className="action-buttons">
                            <button onClick={handleUpdate} className="btn btn-success btn-save">
                              Save
                            </button>
                            <button onClick={cancelEdit} className="btn btn-secondary btn-cancel">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button onClick={() => startEdit(product)} className="btn btn-primary btn-edit">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-delete">
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