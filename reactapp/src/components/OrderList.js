import { useState, useEffect } from 'react';
import * as api from '../utils/api';

const OrderList = ({ onViewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.fetchOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Order API Error');
      }
    };
    fetchOrders();
  }, []);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (error) {
    return <div data-testid="error-message" className="text-red-500 text-center">Order API Error</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <table className="w-full mb-4 border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map(order => (
            <tr key={order.id} className="border">
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.customerName}</td>
              <td className="border p-2">${order.totalAmount.toFixed(2)}</td>
              <td className="border p-2">{order.status}</td>
              <td className="border p-2">{new Date(order.orderDate).toLocaleString()}</td>
              <td className="border p-2">
                <button
                  data-testid={`view-button-${order.id}`}
                  onClick={() => onViewOrder(order.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <span data-testid="page-info">Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button
              data-testid="page-prev"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300 hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              data-testid="page-next"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300 hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;