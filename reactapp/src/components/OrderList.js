import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../utils/api';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">No orders yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200"
                onClick={() => navigate(`/orders/${order.id}`)}
                data-testid={`order-card-${order.id}`}
              >
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {order.customerName} <span className="text-gray-500 font-normal">| {order.customerEmail}</span>
                  </p>
                  <p className="text-gray-600 mt-2">Shipping Address: {order.shippingAddress}</p>
                  <p className="text-gray-600 mt-2">
                    Status: <span className={`font-semibold ${order.status === 'SHIPPED' ? 'text-blue-600' : order.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-600'}`}>
                      {order.status}
                    </span>
                  </p>
                  <p className="text-gray-600 mt-2">Total Amount: <span className="font-semibold text-green-600">₹{order.totalAmount}</span></p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onClick={(e) => updateStatus(e, order.id, 'SHIPPED')}
                  >
                    Mark SHIPPED
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-100"
                    onClick={(e) => updateStatus(e, order.id, 'DELIVERED')}
                  >
                    Mark DELIVERED
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-100"
                    onClick={(e) => deleteOrderById(e, order.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;