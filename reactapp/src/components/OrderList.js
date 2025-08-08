import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../utils/api';
import '../style/OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const normalizeOrders = (raw) => {
    return raw.map(o => ({ ...o, id: o.id || o._id || o.orderId }));
  };

  const load = () => {
    setLoading(true);
    fetchOrders()
      .then(res => {
        const data = res.data;
        const raw = Array.isArray(data) ? data
                  : Array.isArray(data?.orders) ? data.orders
                  : [];
        setOrders(normalizeOrders(raw));
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = (e, id, status) => {
    e.stopPropagation();
    updateOrderStatus(id, status).then(load).catch(err => console.error(err));
  };

  const deleteOrderById = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrder(id).then(load).catch(err => console.error(err));
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 20 }}>Loading orders...</p>;

  return (
    <div className="order-container">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="order-card"
            onClick={() => navigate(`/orders/${order.id}`)}
            style={{ cursor: 'pointer' }}
            data-testid={`order-card-${order.id}`}
          >
            <p>
              <strong>{order.customerName}</strong> | {order.customerEmail}
            </p>
            <p>Shipping Address: {order.shippingAddress}</p>
            <p>Status: <strong>{order.status}</strong></p>
            <p>Total Amount: ₹{order.totalAmount}</p>

            <div className="actions">
              <button
                className="ship-btn"
                onClick={(e) => updateStatus(e, order.id, 'SHIPPED')}
              >
                Mark SHIPPED
              </button>

              <button
                className="deliver-btn"
                onClick={(e) => updateStatus(e, order.id, 'DELIVERED')}
              >
                Mark DELIVERED
              </button>

              <button
                className="delete-btn"
                onClick={(e) => deleteOrderById(e, order.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderList;
