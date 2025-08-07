import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, DollarSign, Package, Users, Calendar, Search,
  RefreshCw, AlertCircle, Filter, Activity, ShoppingCart, Eye
} from 'lucide-react';

// Import API functions
import { fetchProducts, fetchOrders } from '../utils/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

export default function CleanAnalyticsDashboard() {
  // State management
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetchProducts(),
        fetchOrders()
      ]);
      
      setProducts(productsResponse.data || []);
      setOrders(ordersResponse.data || []);
    } catch (err) {
      setError('Failed to load data. Please check your connection.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: products.length,
        avgOrderValue: 0,
        topProducts: [],
        categoryData: [],
        dailyRevenue: [],
        recentOrders: [],
        statusData: [],
        lowStockProducts: products.filter(p => p.stockQuantity < 10).slice(0, 5)
      };
    }

    // Filter orders by time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= cutoffDate;
    });

    // Calculate basic metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate product sales
    const productSales = {};
    const categorySales = {};
    const statusCount = {};
    const dailySales = {};

    filteredOrders.forEach(order => {
      // Count status distribution
      const status = order.status || 'UNKNOWN';
      statusCount[status] = (statusCount[status] || 0) + 1;

      // Daily revenue tracking
      const orderDate = new Date(order.orderDate);
      const dateKey = orderDate.toISOString().split('T')[0];
      dailySales[dateKey] = (dailySales[dateKey] || 0) + (order.totalAmount || 0);

      // Process order items for product analysis
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          const product = item.product;
          if (product) {
            const quantity = item.quantity || 1;
            const revenue = (item.priceAtPurchase || product.price || 0) * quantity;

            // Track product sales
            if (!productSales[product.id]) {
              productSales[product.id] = {
                ...product,
                totalQuantity: 0,
                totalRevenue: 0
              };
            }
            productSales[product.id].totalQuantity += quantity;
            productSales[product.id].totalRevenue += revenue;

            // Track category sales
            const category = product.category || 'Uncategorized';
            if (!categorySales[category]) {
              categorySales[category] = { name: category, value: 0, count: 0 };
            }
            categorySales[category].value += revenue;
            categorySales[category].count += quantity;
          }
        });
      }
    });

    // Process top products
    const topProducts = Object.values(productSales)
      .filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Process category data for pie chart
    const categoryData = Object.values(categorySales)
      .map((cat, index) => ({
        ...cat,
        fill: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    // Process daily revenue data
    const dailyRevenue = Object.entries(dailySales)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(revenue * 100) / 100
      }));

    // Process status data
    const statusData = Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count,
      percentage: ((count / totalOrders) * 100).toFixed(1)
    }));

    // Recent orders (last 10)
    const recentOrders = [...filteredOrders]
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 10)
      .map(order => ({
        ...order,
        formattedDate: new Date(order.orderDate).toLocaleDateString(),
        formattedTime: new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }));

    // Low stock products
    const lowStockProducts = products
      .filter(p => p.stockQuantity < 20)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 8);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts: products.length,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      topProducts,
      categoryData,
      dailyRevenue,
      recentOrders,
      statusData,
      lowStockProducts
    };
  }, [products, orders, timeRange, selectedCategory, searchTerm]);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  // Component for metric cards
  const MetricCard = ({ icon: Icon, title, value, subtitle, color = "bg-blue-500" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`${color} rounded-lg p-3 mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // Component for chart containers
  const ChartContainer = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your business performance and insights</p>
            </div>
            <button
              onClick={loadData}
              className="mt-4 sm:mt-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            {categories.length > 0 && (
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center flex-1 max-w-xs">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            subtitle="Current period"
            color="bg-green-500"
          />
          <MetricCard
            icon={ShoppingCart}
            title="Total Orders"
            value={analytics.totalOrders.toLocaleString()}
            subtitle={`Avg: $${analytics.avgOrderValue}`}
            color="bg-blue-500"
          />
          <MetricCard
            icon={Package}
            title="Products"
            value={analytics.totalProducts.toLocaleString()}
            subtitle={`${analytics.lowStockProducts.length} low stock`}
            color="bg-purple-500"
          />
          <MetricCard
            icon={Users}
            title="Customers"
            value={new Set(orders.map(o => o.customerEmail)).size.toLocaleString()}
            subtitle="Unique customers"
            color="bg-orange-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <ChartContainer title="Revenue Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyRevenue}>
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px' 
                  }}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Category Distribution */}
          <ChartContainer title="Sales by Category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, percentage}) => `${name}: ${((percentage || 0) * 100).toFixed(1)}%`}
                  fontSize={12}
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <ChartContainer title="Top Selling Products">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.topProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">${product.price}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{product.totalQuantity}</td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600">
                        ${product.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartContainer>

          {/* Recent Orders */}
          <ChartContainer title="Recent Orders">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analytics.recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Order #{order.id} - {order.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.formattedDate} at {order.formattedTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.totalAmount}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <ChartContainer title="Order Status Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.statusData}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [value, 'Orders']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px' 
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Low Stock Alert */}
          {analytics.lowStockProducts.length > 0 && (
            <ChartContainer title="Low Stock Alert">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {analytics.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-2 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        product.stockQuantity < 5 ? 'text-red-600' :
                        product.stockQuantity < 10 ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {product.stockQuantity} left
                      </div>
                      <div className="text-xs text-gray-500">${product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}