import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../utils/api';
import '../style/OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchOrders()
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          console.error("Unexpected response format:", data);
        }
      })
      .catch(err => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = (id, status) => {
    updateOrderStatus(id, status)
      .then(load)
      .catch(err => console.error("Error updating status:", err));
  };

  const deleteOrderById = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrder(id)
        .then(load)
        .catch(err => console.error("Error deleting order:", err));
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading orders...</p>;

  return (
    <div className="order-container">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <p>
              <strong>
                <Link to={`/orders/${order.id}`} className="view-link">
                  {order.customerName}
                </Link>
              </strong> | {order.customerEmail}
            </p>
            <p>Shipping Address: {order.shippingAddress}</p>
            <p>Status: <strong>{order.status}</strong></p>
            <p>Total Amount: ₹{order.totalAmount}</p>
            <div className="actions">
              <button className="ship-btn" onClick={() => updateStatus(order.id, 'SHIPPED')}>Mark SHIPPED</button>
              <button className="deliver-btn" onClick={() => updateStatus(order.id, 'DELIVERED')}>Mark DELIVERED</button>
              <button className="delete-btn" onClick={() => deleteOrderById(order.id)}>Delete</button>
              <Link to={`/orders/${order.id}`} className="details-btn">View Details</Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderList;
