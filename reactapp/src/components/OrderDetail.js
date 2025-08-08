import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, getProduct } from '../utils/api';
import '../style/OrderDetail.css';

const OrderDetail = () => {
  const { id: routeId } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState({}); // map by product id/_id
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await getOrder(routeId);
        const fetchedOrder = res.data || {};

        // normalize id and ensure orderItems exists
        const normalizedOrder = {
          ...fetchedOrder,
          id: fetchedOrder.id || fetchedOrder._id || routeId,
          orderItems: Array.isArray(fetchedOrder.orderItems) ? fetchedOrder.orderItems : []
        };
        if (cancelled) return;
        setOrder(normalizedOrder);

        // collect potential product ids from different shapes:
        const ids = [...new Set(
          normalizedOrder.orderItems.map(item => (
            item.productId ||
            item.product?.id ||
            item.product?._id ||
            (typeof item.product === 'string' ? item.product : null)
          ))
        )].filter(Boolean);

        if (ids.length === 0) {
          // no product ids to fetch
          setProducts({});
          return;
        }

        // fetch products defensively (Promise.allSettled)
        const results = await Promise.allSettled(ids.map(pid => getProduct(pid)));
        const productMap = {};
        results.forEach(r => {
          if (r.status === 'fulfilled' && r.value?.data) {
            const p = r.value.data;
            const key = p.id || p._id;
            if (key) productMap[key] = p;
          } else {
            // optionally log or ignore missing product fetch
            console.warn('Product fetch failed for one id', r);
          }
        });

        if (!cancelled) setProducts(productMap);
      } catch (err) {
        console.error('Error loading order:', err);
        if (!cancelled) {
          setOrder(null);
          setProducts({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [routeId]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: 20 }}>Loading order details...</p>;
  if (!order) return <p style={{ textAlign: 'center', marginTop: 20 }}>Order not found.</p>;

  return (
    <div className="order-detail-container">
      <h2>Order #{order.id}</h2>
      <p><strong>Name:</strong> {order.customerName}</p>
      <p><strong>Email:</strong> {order.customerEmail}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Address:</strong> {order.shippingAddress}</p>
      <p><strong>Total:</strong> ₹{order.totalAmount}</p>

      <h4 style={{ marginTop: 25, marginBottom: 15 }}>Items:</h4>
      <ul className="items-list">
        {order.orderItems.map((item, idx) => {
          // Try to find product by multiple id variants
          const pidCandidates = [
            item.productId,
            item.product?.id,
            item.product?._id,
            (typeof item.product === 'string' ? item.product : null)
          ].filter(Boolean);

          let product = null;
          for (const pid of pidCandidates) {
            if (products[pid]) { product = products[pid]; break; }
            // also try alternative key if product object used _id or id
            if (products[pid?.toString()]) { product = products[pid.toString()]; break; }
          }

          const displayId = product?.id || product?._id || item.productId || item.product?.id || item.product?._id || 'N/A';
          const displayName = product?.name || item.product?.name || item.productName || 'Product';
          const displayQty = item.quantity ?? item.qty ?? 1;
          const displayPrice = item.priceAtPurchase ?? item.price ?? item.unitPrice ?? 'N/A';

          return (
            <li key={idx} className="item-card">
              {product?.imageUrl && <img src={product.imageUrl} alt={displayName} className="item-image" />}

              <div className="item-details">
                <div><strong>{displayName} (ID: {displayId})</strong></div>
                <div>Quantity: {displayQty}</div>
                <div>Price at Purchase: ₹{displayPrice}</div>
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
