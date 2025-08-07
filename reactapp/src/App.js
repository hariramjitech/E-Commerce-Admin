import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import OrderList from './components/OrderList';
import CreateOrder from './components/CreateOrder';
import OrderDetail from './components/OrderDetail';
import Analytics from './components/Analytics'; // ✅ Import Analytics
import './style/App.css';

const App = () => {
  return (
    <div className="app-container">
      <h1>E-Commerce Admin Dashboard</h1>
      <nav>
        <Link to="/">Products</Link>
        <Link to="/add-product">Add Product</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/create-order">Create Order</Link>
        <Link to="/analytics">Analytics</Link> {/* ✅ Add nav link */}
      </nav>

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/add-product" element={<ProductForm />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/create-order" element={<CreateOrder />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/analytics" element={<Analytics />} /> {/* ✅ Add route */}
      </Routes>
    </div>
  );
};

export default App;
