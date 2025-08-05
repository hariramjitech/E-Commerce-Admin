import React, { useEffect, useState } from 'react';
import { fetchProducts, deleteProduct, updateProduct } from '../utils/api';
import '../style/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    imageUrl: ''
  });

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    stockStatus: 'all'
  });

  const [sortBy, setSortBy] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchProducts(filters); // Send filters to backend
      let fetched = res.data;

      // Apply client-side sorting
      if (sortBy === 'name-asc') fetched.sort((a, b) => a.name.localeCompare(b.name));
      else if (sortBy === 'name-desc') fetched.sort((a, b) => b.name.localeCompare(a.name));
      else if (sortBy === 'price-asc') fetched.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-desc') fetched.sort((a, b) => b.price - a.price);
      else if (sortBy === 'stock-asc') fetched.sort((a, b) => a.stockQuantity - b.stockQuantity);
      else if (sortBy === 'stock-desc') fetched.sort((a, b) => b.stockQuantity - a.stockQuantity);

      setProducts(fetched);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters, sortBy]); // reload when filters/sort change

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
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
      imageUrl: product.imageUrl
    });
  };

  const handleUpdate = async () => {
    try {
      await updateProduct(editingId, {
        ...editData,
        price: parseFloat(editData.price),
        stockQuantity: parseInt(editData.stockQuantity)
      });
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', category: '', stockStatus: 'all' });
    setSortBy('');
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading products...</div></div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Product Inventory</h1>
        <div className="count">{products.length} products</div>
      </div>

      <div className="filters">
        <div className="filter-row">
          <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min Price" className="filter-input" />
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max Price" className="filter-input" />
          <input type="text" name="category" value={filters.category} onChange={handleFilterChange} placeholder="Category (starts with...)" className="filter-input" />
          <select name="stockStatus" value={filters.stockStatus} onChange={handleFilterChange} className="filter-select">
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="">No Sort</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low-High)</option>
            <option value="price-desc">Price (High-Low)</option>
            <option value="stock-asc">Stock (Low-High)</option>
            <option value="stock-desc">Stock (High-Low)</option>
          </select>
          <button onClick={clearFilters} className="clear-btn">Clear</button>
        </div>
      </div>

      <div className="table-wrapper">
        {products.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className={editingId === product.id ? 'editing' : ''}>
                  <td>{editingId === product.id ? <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="edit-input" /> : product.name}</td>
                  <td>{editingId === product.id ? <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="edit-textarea" rows="2" /> : <div className="description">{product.description}</div>}</td>
                  <td>{editingId === product.id ? <input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} className="edit-input" /> : <span className="price">₹{product.price}</span>}</td>
                  <td>{editingId === product.id ? <input value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} className="edit-input" /> : <span className="category">{product.category}</span>}</td>
                  <td>{editingId === product.id ? <input type="number" value={editData.stockQuantity} onChange={e => setEditData({ ...editData, stockQuantity: e.target.value })} className="edit-input" /> : <span className={`stock ${product.stockQuantity === 0 ? 'out-of-stock' : 'in-stock'}`}>{product.stockQuantity === 0 ? "Out of Stock" : product.stockQuantity}</span>}</td>
                  <td>{editingId === product.id ? <input value={editData.imageUrl} onChange={e => setEditData({ ...editData, imageUrl: e.target.value })} className="edit-input" placeholder="Image URL" /> : (product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="product-img" /> : <span className="no-img">No Image</span>)}</td>
                  <td>{editingId === product.id ? (
                    <div className="actions">
                      <button onClick={handleUpdate} className="btn save">Save</button>
                      <button onClick={() => setEditingId(null)} className="btn cancel">Cancel</button>
                    </div>
                  ) : (
                    <div className="actions">
                      <button onClick={() => startEdit(product)} className="btn edit">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="btn delete">Delete</button>
                    </div>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList;
