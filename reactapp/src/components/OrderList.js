import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../utils/api';
import '../style/OrderList.css'; // ✅ Import the CSS

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  const load = () => {
    fetchOrders()
      .then(res => {
        const data = res.data;
        console.log("Fetched orders:", data); // Debugging
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          console.error("Unexpected response format for orders:", data);
        }
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
      });
  };

  useEffect(load, []);

  const updateStatus = (id, status) => {
    updateOrderStatus(id, status)
      .then(load)
      .catch(err => {
        console.error("Error updating status:", err);
      });
  };

  const deleteOrderById = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrder(id)
        .then(load)
        .catch(err => {
          console.error("Error deleting order:", err);
        });
    }
  };

  return (
    <div className="order-container">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <p><strong>{order.customerName}</strong> | {order.customerEmail}</p>
            <p>Shipping Address: {order.shippingAddress}</p>
            <p>Status: <strong>{order.status}</strong></p>
            <p>Total Amount: ₹{order.totalAmount}</p>
            <div className="actions">
              <button className="ship-btn" onClick={() => updateStatus(order.id, 'SHIPPED')}>Mark SHIPPED</button>
              <button className="deliver-btn" onClick={() => updateStatus(order.id, 'DELIVERED')}>Mark DELIVERED</button>
              <button className="delete-btn" onClick={() => deleteOrderById(order.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderList;
