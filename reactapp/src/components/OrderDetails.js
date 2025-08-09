import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus, deleteOrder } from '../utils/api';

export default function OrderDetails({ orderId: propOrderId, onBack }) {
  const params = useParams();
  const navigate = useNavigate();
  const orderId = propOrderId ?? params.id;

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOrderById(orderId);
      if (!data) {
        setError('Order not found');
        setOrder(null);
        return;
      }
      setOrder(data);
      setStatus(data.status || '');
    } catch (err) {
      setError('Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setError('Order not found');
      setLoading(false);
      return;
    }
    loadOrder();
  }, [orderId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateOrderStatus(orderId, status);
      setOrder((prev) => prev ? { ...prev, status } : prev);
      setSuccessMessage('Status updated');
      return response;
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(orderId);
      if (onBack) onBack();
      else navigate('/orders');
    } catch (err) {
      setError('Failed to delete order');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={onBack ?? (() => navigate('/orders'))}>Back to Orders</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p>Order not found</p>
        <button onClick={onBack ?? (() => navigate('/orders'))}>Back to Orders</button>
      </div>
    );
  }

  const items = Array.isArray(order.orderItems) ? order.orderItems : [];

  return (
    <div>
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      <h1>Order #{order.id}</h1>
      <div>
        <p>Customer: {order.customerName}</p>
        <p>Email: {order.customerEmail}</p>
        <p>Address: {order.shippingAddress}</p>
      </div>
      <div>
        <p>Order Date: {order.orderDate ? new Date(order.orderDate).toLocaleString() : '—'}</p>
        <p>Status: {order.status}</p>
        <p>Total: ₹{order.totalAmount.toFixed(2)}</p>
      </div>
      <div>
        <label aria-label="Order Status:">
          Order Status:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PENDING">PENDING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleDelete}>Delete</button>
      </div>
      <h2>Items</h2>
      {items.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>ID</th>
              <th>Quantity</th>
              <th>Price at Purchase</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const prod = it.product ?? {};
              return (
                <tr key={it.id}>
                  <td>{prod.name ?? 'Product'}</td>
                  <td>{prod.id ?? 'N/A'}</td>
                  <td>{it.quantity ?? 1}</td>
                  <td>₹{(it.priceAtPurchase ?? 0).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No items in this order.</p>
      )}
      <button onClick={onBack ?? (() => navigate('/orders'))}>Back to Orders</button>
    </div>
  );
}