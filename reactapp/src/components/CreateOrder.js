import React, { useEffect, useState } from 'react';
import { createOrder, fetchProducts } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../style/CreateOrder.css';

const CreateOrder = () => {
  const [order, setOrder] = useState({
    customerName: '',
    customerEmail: '',
    shippingAddress: '',
    orderItems: []
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const navigate = useNavigate();

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

  const showMessage = (text, type, shouldNavigate = false) => {
    setAlert({ show: true, message: text, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
      // Only navigate when explicitly requested
      if (shouldNavigate) {
        setTimeout(() => navigate('/orders'), 300);
      }
    }, 3000);
  };

const addItem = (product) => {
  if (!order.orderItems.find(item => item.productId === product.id)) {
    if (product.stockQuantity === 0) {
      showMessage('❌ Product is out of stock', 'error');
      return;
    }
    setOrder({
      ...order,
      orderItems: [...order.orderItems, { 
        productId: product.id, 
        quantity: 1
        // ✅ Removed product: product
      }]
    });
    showMessage(`✅ ${product.name} added to order`, 'success');
  } else {
    showMessage('⚠️ Product already in order', 'warning');
  }
};


  const updateQuantity = (productId, qty) => {
    const quantity = parseInt(qty);
    const product = products.find(p => p.id === productId);
    
    if (quantity < 1) {
      showMessage('❌ Quantity must be at least 1', 'error');
      return;
    }
    
    if (quantity > product.stockQuantity) {
      showMessage(`❌ Only ${product.stockQuantity} units available`, 'error');
      return;
    }
    
    setOrder({
      ...order,
      orderItems: order.orderItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    });
  };

  const removeItem = (productId) => {
    const product = products.find(p => p.id === productId);
    setOrder({
      ...order,
      orderItems: order.orderItems.filter(item => item.productId !== productId)
    });
    showMessage(`🗑️ ${product?.name} removed from order`, 'info');
  };

  const getTotalAmount = () => {
    return order.orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
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

  const handleSubmit = async () => {
  if (order.orderItems.length === 0) {
    showMessage("❌ Please select at least one product", 'error');
    return;
  }

  if (!order.customerName.trim() || !order.customerEmail.trim() || !order.shippingAddress.trim()) {
    showMessage("❌ Please fill in all required fields", 'error');
    return;
  }

  const orderData = {
    customerName: order.customerName.trim(),
    customerEmail: order.customerEmail.trim(),
    shippingAddress: order.shippingAddress.trim(),
    orderItems: order.orderItems.map(item => ({
      productId: parseInt(item.productId),  // Must be a number
      quantity: parseInt(item.quantity)     // Must be a number
    }))
  };

  console.log("Sending order:", JSON.stringify(orderData, null, 2));

  try {
    setSubmitting(true);
    const response = await createOrder(orderData);

    showMessage("✅ Order created successfully!", 'success', true);

    setTimeout(() => {
      setOrder({
        customerName: '',
        customerEmail: '',
        shippingAddress: '',
        orderItems: []
      });
    }, 2000);
  } catch (err) {
    console.error('Order creation error:', err);
    console.log('Backend response:', err?.response?.data);

    if (err?.response?.status === 400) {
      const errorMessage = err?.response?.data?.message ||
                          err?.response?.data?.error ||
                          '❌ Invalid order data. Please check all fields.';
      showMessage(errorMessage, 'error');
    } else {
      showMessage('❌ Order creation failed. Please try again.', 'error');
    }
  } finally {
    setSubmitting(false);
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
              <h1>Create New Order</h1>
              <p>Add products and customer details to create an order</p>
            </div>
            <div className="header-summary">
              <div className="summary-badge items">
                {getTotalItems()} items
              </div>
              <div className="summary-badge total">
                {formatCurrency(getTotalAmount())}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-number">
              <span>1</span>
            </div>
            <h2 className="section-title">Customer Information</h2>
          </div>
          <div className="customer-grid">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                value={order.customerName}
                onChange={e => setOrder({ ...order, customerName: e.target.value })}
                className="form-input"
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Email *</label>
              <input
                type="email"
                value={order.customerEmail}
                onChange={e => setOrder({ ...order, customerEmail: e.target.value })}
                className="form-input"
                placeholder="customer@example.com"
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Shipping Address *</label>
              <textarea
                value={order.shippingAddress}
                onChange={e => setOrder({ ...order, shippingAddress: e.target.value })}
                className="form-textarea"
                rows="3"
                placeholder="Enter complete shipping address"
                required
              />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-number">
              <span>2</span>
            </div>
            <h2 className="section-title">Select Products</h2>
          </div>
          
          {/* Filters */}
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

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-badges">
                      <span className="badge price">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="badge category">
                        {product.category}
                      </span>
                      <span className={`badge ${
                        product.stockQuantity === 0 ? 'out-of-stock' : 'stock'
                      }`}>
                        {product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} in stock`}
                      </span>
                    </div>
                  </div>
                  <div className="product-actions">
                    {product.stockQuantity > 0 ? (
                      <button 
                        type="button" 
                        onClick={() => addItem(product)}
                        disabled={order.orderItems.some(item => item.productId === product.id)}
                        className={`btn ${
                          order.orderItems.some(item => item.productId === product.id)
                            ? 'btn-added'
                            : 'btn-primary'
                        }`}
                      >
                        {order.orderItems.some(item => item.productId === product.id) ? 'Added ✓' : 'Add to Order'}
                      </button>
                    ) : (
                      <button type="button" className="btn btn-disabled" disabled>
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-number">
              <span>3</span>
            </div>
            <h2 className="section-title">Order Summary ({order.orderItems.length} items)</h2>
          </div>
          
          {order.orderItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3>No items selected yet</h3>
              <p>Add products from above to create your order</p>
            </div>
          ) : (
            <div className="order-items">
              {order.orderItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                
                return (
                  <div key={item.productId} className="order-item">
                    <div className="item-content">
                      <div className="item-info">
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <span className="item-price">{formatCurrency(product.price)} each</span>
                      </div>
                      <div className="item-controls">
                        <div className="quantity-control">
                          <label className="quantity-label">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            max={product.stockQuantity}
                            value={item.quantity}
                            onChange={e => updateQuantity(item.productId, e.target.value)}
                            className="quantity-input"
                          />
                          <span className="max-stock">max: {product.stockQuantity}</span>
                        </div>
                        <div className="item-total">
                          {formatCurrency(product.price * item.quantity)}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeItem(item.productId)}
                          className="btn btn-danger btn-remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="order-total">
                <div className="total-summary">
                  <span className="total-label">Order Total:</span>
                  <span className="total-value">{formatCurrency(getTotalAmount())}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button 
            onClick={handleSubmit}
            disabled={order.orderItems.length === 0 || submitting}
            className={`btn submit-btn ${
              order.orderItems.length === 0 || submitting
                ? 'btn-disabled'
                : 'btn-success'
            }`}
          >
            {submitting ? 'Processing...' : `Place Order • ${formatCurrency(getTotalAmount())}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;