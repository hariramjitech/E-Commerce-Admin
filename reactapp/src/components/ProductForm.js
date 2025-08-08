import React, { useState } from 'react';
import { createProduct } from '../utils/api';

export default function ProductForm({ onSave, onCancel }) {
  const [product, setProduct] = useState({
    name: '', description: '', price: '', category: '', stockQuantity: '', imageUrl: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    const { name, description, price, category, stockQuantity } = product;
    if (!name || !description || price <= 0 || !category || !stockQuantity) {
      setError('Please fill out all required fields correctly');
      return;
    }
    createProduct({ ...product, price: parseFloat(price) })
      .then(onSave)
      .catch(err => setError(err.message));
  };

  return (
    <div>
      {['name', 'description', 'price', 'category', 'stockQuantity', 'imageUrl'].map(f => (
        <div key={f}>
          <label>{f}</label>
          <input name={f} data-testid={`${f}-input`} value={product[f]} onChange={handleChange} />
        </div>
      ))}
      <button data-testid="form-save" onClick={handleSubmit}>Save</button>
      <button onClick={onCancel}>Cancel</button>
      {error && <p>[Error - You need to specify the message]</p>}
    </div>
  );
}
