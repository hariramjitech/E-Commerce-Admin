import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, updateOrderStatus, deleteOrder } from '../utils/api';

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

  // Helper: accept axios response or plain object
  const extractData = (resp) => {
    if (!resp) return resp;
    if (resp.data !== undefined) return resp.data;
    return resp;
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await getOrder(orderId);
      const data = extractData(resp);
      if (!data) {
        setError('Order not found');
        setOrder(null);
        return;
      }
      setOrder(data);
      setStatus(data.status || '');
    } catch (err) {
      console.error('loadOrder error', err);
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
      await updateOrderStatus(orderId, status);
      setOrder((prev) => (prev ? { ...prev, status } : prev));
      setSuccessMessage('Status updated');
    } catch (err) {
      console.error('updateOrderStatus error', err);
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
      console.error('deleteOrder error', err);
      setError('Failed to delete order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p style={{ color: 'red' }}>{error}</p>
        <div style={{ marginTop: 12 }}>
          <button onClick={onBack ?? (() => navigate('/orders'))}>Back to Orders</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p>Order not found</p>
        <div style={{ marginTop: 12 }}>
          <button onClick={onBack ?? (() => navigate('/orders'))}>Back to Orders</button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.orderItems) ? order.orderItems : [];

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow border">
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p><strong>Customer:</strong> {order.customerName} </p>
          <p><strong>Email:</strong> {order.customerEmail}</p>
          <p><strong>Address:</strong> {order.shippingAddress}</p>
        </div>
        <div>
          <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString() : '—'}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span
              className={
                order.status === 'DELIVERED'
                  ? 'text-green-600 font-semibold'
                  : order.status === 'SHIPPED'
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-700 font-semibold'
              }
            >
              {order.status}
            </span>
          </p>
          <p><strong>Total:</strong> ₹{order.totalAmount ?? '0.00'}</p>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <label aria-label="Order Status:" htmlFor="order-status" className="font-medium">
          Order Status:
        </label>
        <select
          id="order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="PENDING">PENDING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button onClick={handleSave} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded">
          Delete
        </button>
      </div>
      <h2 className="text-lg font-semibold mb-2">Items</h2>
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Product</th>
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Quantity</th>
                <th className="border px-3 py-2">Price at Purchase</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const prod = it.product ?? {};
                return (
                  <tr key={it.id ?? `${prod.id}-${Math.random()}`}>
                    <td className="border px-3 py-2">{prod.name ?? 'Product'}</td>
                    <td className="border px-3 py-2 text-center">{prod.id ?? 'N/A'}</td>
                    <td className="border px-3 py-2 text-center">{it.quantity ?? it.qty ?? 1}</td>
                    <td className="border px-3 py-2 text-right">
                      ₹{(it.priceAtPurchase ?? it.price ?? prod.price ?? 0).toFixed
                        ? (it.priceAtPurchase ?? it.price ?? prod.price ?? 0).toFixed(2)
                        : (it.priceAtPurchase ?? it.price ?? prod.price ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No items in this order.</p>
      )}
      <div className="mt-4">
        <button onClick={onBack ?? (() => navigate('/orders'))} className="px-3 py-1 bg-gray-200 rounded">
          Back to Orders
        </button>
      </div>
    </div>
  );
}