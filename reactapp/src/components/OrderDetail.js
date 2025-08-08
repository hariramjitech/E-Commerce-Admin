import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, getProduct } from '../utils/api';
import { ArrowLeft, Package, User, Mail, MapPin, DollarSign, ShoppingBag, AlertCircle } from 'lucide-react';

const OrderDetail = () => {
  const { id: routeId } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await getOrder(routeId);
        const fetchedOrder = res.data || {};

        // Normalize id and ensure orderItems exists
        const normalizedOrder = {
          ...fetchedOrder,
          id: fetchedOrder.id || fetchedOrder._id || routeId,
          orderItems: Array.isArray(fetchedOrder.orderItems) ? fetchedOrder.orderItems : []
        };
        if (cancelled) return;
        setOrder(normalizedOrder);

        // Collect potential product ids from different shapes
        const ids = [...new Set(
          normalizedOrder.orderItems.map(item => (
            item.productId ||
            item.product?.id ||
            item.product?._id ||
            (typeof item.product === 'string' ? item.product : null)
          ))
        )].filter(Boolean);

        if (ids.length === 0) {
          setProducts({});
          return;
        }

        // Fetch products defensively (Promise.allSettled)
        const results = await Promise.allSettled(ids.map(pid => getProduct(pid)));
        const productMap = {};
        results.forEach(r => {
          if (r.status === 'fulfilled' && r.value?.data) {
            const p = r.value.data;
            const key = p.id || p._id;
            if (key) productMap[key] = p;
          } else {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-gray-600 text-lg font-medium">Order not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Order #{order.id}</h2>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">Name:</span> {order.customerName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-500" />
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">Email:</span> {order.customerEmail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" />
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">Status:</span>{' '}
                <span className={`font-semibold ${order.status === 'SHIPPED' ? 'text-blue-600' : order.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-600'}`}>
                  {order.status}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">Address:</span> {order.shippingAddress}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">Total:</span>{' '}
                <span className="font-semibold text-green-600">₹{order.totalAmount}</span>
              </p>
            </div>
          </div>
        </div>

        <h4 className="text-xl font-semibold text-gray-900 mb-4 mt-8 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gray-500" />
          Items
        </h4>
        <div className="bg-white rounded-lg shadow-sm p-6">
          {order.orderItems.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No items in this order.</p>
            </div>
          ) : (
            <ul className="space-y-4">
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
                  if (products[pid?.toString()]) { product = products[pid.toString()]; break; }
                }

                const displayId = product?.id || product?._id || item.productId || item.product?.id || item.product?._id || 'N/A';
                const displayName = product?.name || item.product?.name || item.productName || 'Product';
                const displayQty = item.quantity ?? item.qty ?? 1;
                const displayPrice = item.priceAtPurchase ?? item.price ?? item.unitPrice ?? 'N/A';

                return (
                  <li
                    key={idx}
                    className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={displayName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {displayName} (ID: {displayId})
                      </div>
                      <div className="text-gray-600 text-sm">Quantity: {displayQty}</div>
                      <div className="text-gray-600 text-sm">
                        Price at Purchase: <span className="text-green-600">₹{displayPrice}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;