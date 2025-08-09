import React, { useState } from 'react';
import { createProduct } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../style/ProductForm.css';

const ProductForm = ({ onSave, onCancel }) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formatted = {
        ...product,
        price: parseFloat(product.price) || 0,
        stockQuantity: parseInt(product.stockQuantity) || 0,
      };
      const response = await createProduct(formatted);
      if (onSave) onSave(response);
      navigate('/');
    } catch (err) {
      setError('Invalid product data');
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Add Product</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {[
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
        { key: 'imageUrl', label: 'Image URL', type: 'text' },
      ].map(({ key, label, type }) => (
        <div key={key} className="form-group">
          <label htmlFor={key}>{label}</label>
          <input
            id={key}
            name={key}
            value={product[key]}
            onChange={handleChange}
            placeholder={label}
            type={type}
            data-testid={`${key}-input`}
          />
        </div>
      ))}
      <div className="form-actions">
        <button type="submit" data-testid="form-save">
          Save
        </button>
        <button type="button" onClick={handleCancel} data-testid="form-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;