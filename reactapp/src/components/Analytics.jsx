import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  DollarSign, Package, ShoppingCart, Users, RefreshCw, AlertCircle
} from 'lucide-react';

// Import API functions
import { fetchProducts, fetchOrders } from '../utils/api';

const CHART_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2'];

export default function AnalyticsDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetchProducts(),
        fetchOrders()
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const stats = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: products.length,
        totalCustomers: 0,
        avgOrderValue: 0,
        topProducts: [],
        topCustomers: [],
        categoryData: [],
        dailyData: [],
        statusData: [],
        recentOrders: [],
        lowStockProducts: products.filter(p => p.stockQuantity < 10).slice(0, 5)
      };
    }

    // Basic metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = new Set(orders.map(o => o.customerEmail)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Customer analysis
    const customerMap = {};
    orders.forEach(order => {
      const customerKey = order.customerEmail;
      if (!customerMap[customerKey]) {
        customerMap[customerKey] = {
          name: order.customerName,
          email: order.customerEmail,
          totalSpent: 0,
          totalOrders: 0
        };
      }
      customerMap[customerKey].totalSpent += order.totalAmount || 0;
      customerMap[customerKey].totalOrders += 1;
    });

    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);

    // Product sales analysis
    const productSales = {};
    orders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          const product = item.product;
          if (product) {
            if (!productSales[product.id]) {
              productSales[product.id] = {
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stockQuantity,
                quantity: 0,
                revenue: 0
              };
            }
            productSales[product.id].quantity += item.quantity || 1;
            productSales[product.id].revenue += (item.priceAtPurchase || 0) * (item.quantity || 1);
          }
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // Category analysis
    const categoryMap = {};
    Object.values(productSales).forEach(product => {
      const cat = product.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = 0;
      }
      categoryMap[cat] += product.revenue;
    });

    const categoryData = Object.entries(categoryMap)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    // Daily revenue (last 30 days)
    const last30Days = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      if (orderDate >= thirtyDaysAgo) {
        const dateKey = orderDate.toISOString().split('T')[0];
        last30Days[dateKey] = (last30Days[dateKey] || 0) + (order.totalAmount || 0);
      }
    });

    const dailyData = Object.entries(last30Days)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue
      }));

    // Status distribution
    const statusMap = {};
    orders.forEach(order => {
      const status = order.status || 'Unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const statusData = Object.entries(statusMap)
      .map(([name, value], index) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }));

    // Recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5)
      .map(order => ({
        ...order,
        formattedDate: new Date(order.orderDate).toLocaleDateString(),
        itemCount: order.orderItems ? order.orderItems.length : 0
      }));

    // Low stock products
    const lowStockProducts = products
      .filter(p => p.stockQuantity < 20)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      avgOrderValue,
      topProducts,
      topCustomers,
      categoryData,
      dailyData,
      statusData,
      recentOrders,
      lowStockProducts
    };
  }, [products, orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Order</p>
                <p className="text-2xl font-bold">${stats.avgOrderValue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.dailyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({name}) => name}
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Sold</th>
                    <th className="text-left py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{product.name}</td>
                      <td className="py-2 text-gray-600">{product.category}</td>
                      <td className="py-2">{product.quantity}</td>
                      <td className="py-2 font-medium">${product.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Customer</th>
                    <th className="text-left py-2">Orders</th>
                    <th className="text-left py-2">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCustomers.map((customer, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="py-2">{customer.totalOrders}</td>
                      <td className="py-2 font-medium">${customer.totalSpent.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">#{order.id}</div>
                    <div className="text-sm text-gray-600">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.formattedDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${order.totalAmount}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.category}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      product.stockQuantity < 5 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {product.stockQuantity} left
                    </div>
                    <div className="text-sm text-gray-500">${product.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Order Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.statusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}