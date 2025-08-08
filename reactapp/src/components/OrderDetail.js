import React, { useEffect, useState } from 'react';
import { getOrderById, updateOrderStatus } from '../utils/api';

export default function OrderDetails({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getOrderById(orderId)
      .then(res => { setOrder(res); setStatus(res.status); })
      .catch(err => setError(err.message));
  }, [orderId]);

  const handleSave = () => {
    updateOrderStatus(orderId, status)
      .then(() => setSuccess('Status updated'))
      .catch(err => setError(err.message));
  };

  if (error) return <p>[Error - You need to specify the message]</p>;
  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <h2>Order Details</h2>
      <p>{order.customerName}</p>
      <p>{order.customerEmail}</p>
      <p>{order.shippingAddress}</p>
      {order.orderItems.map(i => <p key={i.id}>{i.product.name}</p>)}
      <label>Order Status:</label>
      <select aria-label="Order Status:" value={status} onChange={e => setStatus(e.target.value)}>
        {['PENDING','PROCESSING','SHIPPED','DELIVERED'].map(s => <option key={s}>{s}</option>)}
      </select>
      <button onClick={handleSave}>Save</button>
      <button onClick={onBack}>Back to Orders</button>
      <p>${order.totalAmount.toFixed(2)}</p>
      {success && <p>{success}</p>}
    </div>
  );
}
