
import React, { useEffect, useState } from 'react';

// Mock data and API functions for demonstration
const mockOrders = [
  {
    id: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    shippingAddress: '123 Main St, Mumbai, Maharashtra 400001',
    status: 'PENDING',
    totalAmount: 25897,
    orderItems: [
      { productId: 1, quantity: 2, priceAtPurchase: 8999 },
      { productId: 2, quantity: 1, priceAtPurchase: 7899 }
    ]
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    shippingAddress: '456 Park Ave, Delhi, Delhi 110001',
    status: 'SHIPPED',
    totalAmount: 12999,
    orderItems: [
      { productId: 2, quantity: 1, priceAtPurchase: 12999 }
    ]
  },
  {
    id: 3,
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    shippingAddress: '789 Oak Rd, Bangalore, Karnataka 560001',
    status: 'DELIVERED',
    totalAmount: 1798,
    orderItems: [
      { productId: 3, quantity: 2, priceAtPurchase: 899 }
    ]
  }
];

const mockProducts = {
  1: { id: 1, name: 'Premium Wireless Headphones', imageUrl: null },
  2: { id: 2, name: 'Smart Fitness Watch', imageUrl: null },
  3: { id: 3, name: 'Organic Cotton T-Shirt', imageUrl: null }
};

// Alert Component
const Alert = ({ alert, onClose }) => {
  if (!alert.show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform scale-100 transition-all duration-300 ${
        alert.type === 'success' ? 'border-l-4 border-green-500' :
        alert.type === 'error' ? 'border-l-4 border-red-500' :
        alert.type === 'warning' ? 'border-l-4 border-yellow-500' :
        'border-l-4 border-blue-500'
      }`}>
        <div className="flex justify-between items-start">
          <span className="text-gray-800 font-medium flex-1">{alert.message}</span>
          <button 
            className="text-gray-400 text-xl font-bold hover:text-gray-600 transition-colors ml-4 p-0 leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// OrderDetail Component
const OrderDetail = ({ orderId = 1 }) => {
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const fetchedOrder = mockOrders.find(o => o.id === orderId);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        setProducts(mockProducts);
      }
      setLoading(false);
    }, 1000);
  }, [orderId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-800 border-green-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600">The requested order could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Order #{order.id}</h1>
              <p className="text-gray-600">View order details and track status</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold text-sm border ${getStatusColor(order.status)}`}>
              {order.status}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <p className="text-gray-900 font-medium">{order.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900">{order.customerEmail}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <p className="text-gray-900 leading-relaxed">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Items ({order.orderItems.length})</h2>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</div>
          </div>
          
          <div className="space-y-4">
            {order.orderItems.map((item, idx) => {
              const product = products[item.productId];
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {product?.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product?.name || 'Product'} (ID: {item.productId})
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>Quantity: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                        <span>Price: <span className="font-medium text-green-600">{formatCurrency(item.priceAtPurchase)}</span></span>
                        <span>Total: <span className="font-medium text-gray-900">{formatCurrency(item.priceAtPurchase * item.quantity)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="border-t-2 border-gray-200 pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Order Total:</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};