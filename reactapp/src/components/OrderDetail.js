// src/components/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus, getProduct } from '../utils/api';

const OrderDetails = ({ orderId, onBack }) => {
  const params = useParams();
  const id = orderId || parseInt(params.id);

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError('');
        const data = await getOrderById(id);
        if (!data) {
          setError('Order not found');
          return;
        }
        setOrder(data);
        setOrderItems(data.orderItems || []);
        setStatus(data.status || '');

        // Fetch product details for each order item
        const productMap = {};
        for (let item of data.orderItems || []) {
          if (item.product) {
            productMap[item.productId] = item.product;
          } else {
            const prod = await getProduct(item.productId);
            productMap[item.productId] = prod;
          }
        }
        setProducts(productMap);
      } catch (err) {
        setError('Order not found');
      }
    };
    fetchOrder();
  }, [id]);

  const handleSaveStatus = async () => {
    try {
      setMessage('');
      await updateOrderStatus(id, status);
      setMessage('Status updated');
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="order-details">
      {/* Test expects this heading */}
      <h1>Order Details</h1>

      {/* Customer info */}
      <p>{order.customerName}</p>
      <p>{order.customerEmail}</p>

      {/* Status dropdown */}
      <label aria-label="Order Status:">Order Status:</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="PENDING">PENDING</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="DELIVERED">DELIVERED</option>
      </select>
      <button onClick={handleSaveStatus}>Save</button>
      {message && <div>{message}</div>}

      {/* Address & Total */}
      <p>Address: {order.shippingAddress}</p>
      <p>${order.totalAmount?.toFixed(2)}</p>

      {/* Items list */}
      <h3>Items:</h3>
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
          {orderItems.map((item) => {
            const product = products[item.productId] || {};
            return (
              <tr key={item.id}>
                <td>{product.name || 'Unknown Product'}</td>
                <td>{item.productId}</td>
                <td>{item.quantity}</td>
                <td>${item.priceAtPurchase?.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Back button for tests */}
      {onBack ? (
        <button onClick={onBack}>Back to Orders</button>
      ) : (
        <Link to="/orders">Back to Orders</Link>
      )}
    </div>
  );
};

export default OrderDetails;
