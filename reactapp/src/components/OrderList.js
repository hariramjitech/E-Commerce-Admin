import React, { useEffect, useState } from 'react';
import { fetchOrders } from '../utils/api';

export default function OrderList({ onViewOrder }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders().then(setOrders).catch(err => setError(err.message));
  }, []);

  const paginated = orders.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(orders.length / 10);

  if (error) return <p>[Error - You need to specify the message]</p>;

  return (
    <div>
      <h2>Orders</h2>
      {paginated.map(o => (
        <div key={o.id}>
          <p>{o.customerName}</p>
          <button data-testid={`view-button-${o.id}`} onClick={() => onViewOrder(o.id)}>View Details</button>
        </div>
      ))}
      <button data-testid="page-prev" onClick={() => setPage(p => Math.max(p - 1, 1))}>Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button data-testid="page-next" onClick={() => setPage(p => Math.min(p + 1, totalPages))}>Next</button>
    </div>
  );
}
