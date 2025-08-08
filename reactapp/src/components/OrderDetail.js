// src/components/OrderDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrderStatus, deleteOrder } from "../utils/api";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrder(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await updateOrderStatus(id, status);
      loadOrder();
    } catch (err) {
      console.error(err);
      setError("Failed to update order status.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
        navigate("/orders");
      } catch (err) {
        console.error(err);
        setError("Failed to delete order.");
      }
    }
  };

  if (loading) return <p className="text-center mt-4">Loading order...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;
  if (!order) return <p className="text-center mt-4">Order not found</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
      <p className="mb-1">
        <strong>Customer:</strong> {order.customerName} | {order.customerEmail}
      </p>
      <p className="mb-1">
        <strong>Shipping Address:</strong> {order.shippingAddress}
      </p>
      <p className="mb-1">
        <strong>Order Date:</strong>{" "}
        {new Date(order.orderDate).toLocaleString()}
      </p>
      <p className="mb-1">
        <strong>Status:</strong>{" "}
        <span
          className={`font-semibold ${
            order.status === "DELIVERED"
              ? "text-green-600"
              : order.status === "SHIPPED"
              ? "text-blue-600"
              : "text-yellow-600"
          }`}
        >
          {order.status}
        </span>
      </p>
      <p className="mb-4">
        <strong>Total Amount:</strong> ₹{order.totalAmount}
      </p>

      {/* Items Table */}
      <h2 className="text-lg font-semibold mb-2">Items:</h2>
      <table className="w-full mb-6 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">
              Product
            </th>
            <th className="border border-gray-300 px-3 py-2">Quantity</th>
            <th className="border border-gray-300 px-3 py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 px-3 py-2">
                {item.product.name}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {item.quantity}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                ₹{item.priceAtPurchase}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleStatusChange("SHIPPED")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Mark Shipped
        </button>
        <button
          onClick={() => handleStatusChange("DELIVERED")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Mark Delivered
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Delete Order
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;
