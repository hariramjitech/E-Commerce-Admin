import { useState, useEffect } from 'react';
import * as api from '../utils/api';

const OrderDetails = ({ orderId, onBack }) => {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(orderId);
        setOrder(data);
        setStatus(data.status);
      } catch (err) {
        setError(err.message || 'Order not found');
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSave = async () => {
    try {
      await api.updateOrderStatus(orderId, status);
      setMessage('Status updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  if (error) {
    return (
      <div data-testid="error-message" className="text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (!order) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      {message && <div data-testid="success-message" className="text-green-500 mb-4">Status updated</div>}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Email:</strong> {order.customerEmail}</p>
          <p><strong>Address:</strong> {order.shippingAddress}</p>
        </div>
        <div>
          <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
          <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-2" htmlFor="status" data-testid="order-status-label">Order Status:</label>
        <select
          id="status"
          value={status}
          onChange={handleStatusChange}
          className="border p-2 rounded w-full"
          data-testid="order-status"
        >
          <option value="PENDING">PENDING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>
      </div>
      <table className="w-full mb-4 border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Product</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems.map(item => (
            <tr key={item.id} className="border">
              <td className="border p-2">{item.product.name}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">${item.priceAtPurchase.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          data-testid="save-button"
        >
          Save
        </button>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          data-testid="back-button"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;