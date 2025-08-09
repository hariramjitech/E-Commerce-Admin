import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, updateOrderStatus, deleteOrder } from "../utils/api";
import { Package, Truck, CheckCircle, Trash2 } from "lucide-react";

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
      console.error("Error fetching orders:", err);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
        loadOrders();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleViewDetails = (e, id) => {
    if (e) e.stopPropagation(); // Make e optional
    if (onViewOrder) onViewOrder(id);
    navigate(`/orders/${id}`);
  };

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-gray-500" />
          Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-lg font-medium">No orders yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200"
                  data-testid={`order-card-${order.id}`}
                >
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-gray-900">
                      {order.customerName}{" "}
                      <span className="text-gray-500 font-normal">
                        | {order.customerEmail}
                      </span>
                    </p>
                    <p className="text-gray-600 mt-1">
                      Shipping Address: {order.shippingAddress}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Order Date: {new Date(order.orderDate).toLocaleString("en-GB")}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          order.status === "SHIPPED"
                            ? "text-blue-600"
                            : order.status === "DELIVERED"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                    <p className="text-gray-600 mt-1">
                      Total Amount:{" "}
                      <span className="font-semibold text-green-600">
                        ₹{order.totalAmount}
                      </span>
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-800 font-medium">Items:</p>
                    <ul className="list-disc list-inside text-gray-600 text-sm">
                      {order.orderItems?.map((item) => (
                        <li key={item.id}>
                          {item.product?.name} × {item.quantity} (
                          ₹{item.priceAtPurchase})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors duration-200"
                      data-testid={`view-button-${order.id}`}
                      onClick={(e) => handleViewDetails(e, order.id)}
                    >
                      View Details
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors duration-200"
                      onClick={(e) => handleUpdateStatus(e, order.id, "SHIPPED")}
                    >
                      <Truck className="w-4 h-4" />
                      Mark SHIPPED
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors duration-200"
                      onClick={(e) => handleUpdateStatus(e, order.id, "DELIVERED")}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark DELIVERED
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors duration-200"
                      onClick={(e) => handleDeleteOrder(e, order.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                data-testid="page-prev"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                data-testid="page-next"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;