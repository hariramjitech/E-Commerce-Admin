import React, { useState } from 'react';
import { createProduct } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../style/ProductForm.css'; // ✅ Import the CSS

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: '', description: '', price: '', category: '', stockQuantity: '', imageUrl: ''
  });

  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const formatted = {
      ...product,
      price: parseFloat(product.price),
      stockQuantity: parseInt(product.stockQuantity)
    };
    createProduct(formatted)
      .then(() => {
        alert("✅ Product created successfully!");
        navigate('/');
      });
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Add Product</h2>
      {Object.keys(product).map(key => (
        <input
          key={key}
          name={key}
          value={product[key]}
          onChange={handleChange}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          type={key === 'price' || key === 'stockQuantity' ? 'number' : 'text'}
        />
      ))}
      <button type="submit">Create</button>
    </form>
  );
};

export default ProductForm;
