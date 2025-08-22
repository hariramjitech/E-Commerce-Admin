import { useState } from 'react';
import * as api from '../utils/api';

const ProductForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.stockQuantity || formData.stockQuantity < 0) newErrors.stockQuantity = 'Stock quantity must be non-negative';
    if (!formData.imageUrl) newErrors.imageUrl = 'Image URL is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const newProduct = await api.createProduct(formData);
      onSave(newProduct);
    } catch (err) {
      setServerError(err.message || 'Invalid product data');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>
      {serverError && <div data-testid="server-error" className="text-red-500 mb-4">Invalid product data</div>}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Description', name: 'description', type: 'text' },
          { label: 'Price', name: 'price', type: 'number' },
          { label: 'Category', name: 'category', type: 'text' },
          { label: 'Stock Quantity', name: 'stockQuantity', type: 'number' },
          { label: 'Image URL', name: 'imageUrl', type: 'text' },
        ].map(field => (
          <div key={field.name} className="mb-4">
            <label className="block mb-2" htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={handleChange}
              data-testid={`${field.name}-input`}
              className="border p-2 rounded w-full"
            />
            {errors[field.name] && <div className="text-red-500 text-sm">{errors[field.name]}</div>}
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        <button
          data-testid="form-save"
          onClick={handleSubmit}
          disabled={Object.keys(validate()).length > 0}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 hover:bg-blue-600"
        >
          Save
        </button>
        <button
          data-testid="form-cancel"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProductForm;