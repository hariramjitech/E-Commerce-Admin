import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, getProduct } from '../utils/api';
import '../style/OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrder(id)
      .then(res => {
        const fetchedOrder = res.data;
        setOrder(fetchedOrder);

        const productIds = [...new Set(fetchedOrder.orderItems.map(item => item.productId))];
        return Promise.all(productIds.map(pid => getProduct(pid)));
      })
      .then(responses => {
        const productMap = {};
        responses.forEach(r => {
          productMap[r.data.id] = r.data;
        });
        setProducts(productMap);
      })
      .catch(err => console.error("Error fetching order details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading order details...</p>;
  if (!order) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Order not found.</p>;

  return (
    <div className="order-detail-container">
      <h2>Order #{order.id}</h2>
      <p><strong>Name:</strong> {order.customerName}</p>
      <p><strong>Email:</strong> {order.customerEmail}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Address:</strong> {order.shippingAddress}</p>
      <p><strong>Total:</strong> ₹{order.totalAmount}</p>

      <h4 style={{ marginTop: '25px', marginBottom: '15px' }}>Items:</h4>
      <ul className="items-list">
        {order.orderItems.map((item) => {
          const product = products[item.productId];
          return (
            <li key={item.productId} className="item-card">
              {product?.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="item-image"
                />
              )}
              <div className="item-details">
                <div><strong>{product?.name || 'Product'} (ID: {item.productId})</strong></div>
                <div>Quantity: {item.quantity}</div>
                <div>Price at Purchase: ₹{item.priceAtPurchase}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <Link to="/orders" className="back-btn">← Back to Orders</Link>
    </div>
  );
};

export default OrderDetail;
