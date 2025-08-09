import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import OrderList from './components/OrderList';
import CreateOrder from './components/CreateOrder';
import OrderDetails from './components/OrderDetails';
import Analytics from './components/Analytics';
import './style/App.css';

const App = () => {
  return (
    <div className="app-container">
      <h1>E-Commerce Admin Dashboard</h1>
      <nav className="nav-links">
        <NavLink to="/" end>Products</NavLink>
        <NavLink to="/add-product">Add Product</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/create-order">Create Order</NavLink>
        <NavLink to="/analytics">Analytics</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/add-product" element={<ProductForm />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/create-order" element={<CreateOrder />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  );
};

export default App;