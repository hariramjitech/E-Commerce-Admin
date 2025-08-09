import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, updateOrderStatus, deleteOrder } from "../utils/api";

const OrderList = ({ onViewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  const normalizeOrders = (raw) =>
    raw.map((o) => ({
      ...o,
      id: o.id || o._id || o.orderId,
    }));

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchOrders();
      const data = Array.isArray(res) ? res : res.data || [];
      setOrders(normalizeOrders(data));
    } catch (err) {
      setError('Order API Error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (e, id, status) => {
    e.stopPropagation();
    try {
      await updateOrderStatus(id, status);
      loadOrders();
    } catch (err) {}
  };

  const handleDeleteOrder = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
        loadOrders();
      } catch (err) {}
    }
  };

  const handleViewDetails = (e, id) => {
    if (e) e.stopPropagation();
    if (onViewOrder) onViewOrder(id);
    navigate(`/orders/${id}`);
  };

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <>
          <div>
            {paginatedOrders.map((order) => (
              <div key={order.id} data-testid={`order-card-${order.id}`}>
                <p>{order.customerName}</p>
                <p>{order.customerEmail}</p>
                <p>Status: {order.status}</p>
                <p>Total Amount: ₹{order.totalAmount}</p>
                <button
                  data-testid={`view-button-${order.id}`}
                  onClick={(e) => handleViewDetails(e, order.id)}
                >
                  View Details
                </button>
                <button onClick={(e) => handleUpdateStatus(e, order.id, "SHIPPED")}>
                  Mark SHIPPED
                </button>
                <button onClick={(e) => handleUpdateStatus(e, order.id, "DELIVERED")}>
                  Mark DELIVERED
                </button>
                <button onClick={(e) => handleDeleteOrder(e, order.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div>
            <button
              data-testid="page-prev"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              data-testid="page-next"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;