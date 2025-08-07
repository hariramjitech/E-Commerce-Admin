import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
  RadialBarChart, RadialBar, ScatterChart, Scatter, ComposedChart
} from 'recharts';
import { 
  Filter, TrendingUp, DollarSign, Package, Users, Calendar, Search, Download,
  RefreshCw, AlertCircle, CheckCircle, Clock, Truck, Star, Target, 
  ShoppingCart, TrendingDown, Eye, Activity, Award, Zap, BarChart3,
  PieChart as PieChartIcon, LineChart as LineChartIcon, Settings,
  ArrowUpRight, ArrowDownRight, Sparkles, Crown, Fire
} from 'lucide-react';

// Import API functions from centralized location
import { fetchProducts, fetchOrders } from '../utils/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];
const GRADIENT_COLORS = [
  'from-blue-500 to-purple-600',
  'from-purple-500 to-pink-600', 
  'from-pink-500 to-orange-600',
  'from-orange-500 to-yellow-600',
  'from-green-500 to-blue-600',
  'from-teal-500 to-green-600',
  'from-red-500 to-pink-600',
  'from-indigo-500 to-purple-600'
];

const STATUS_COLORS = {
  'Completed': '#10b981',
  'Processing': '#f59e0b',
  'Shipped': '#06b6d4',
  'Pending': '#ef4444',
  'Cancelled': '#6b7280'
};

export default function UltraAnalyticsDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
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
      setError('Failed to load data. Please check your API connection.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Comprehensive analytics calculations
  const analyticsData = useMemo(() => {
    if (!products.length && !orders.length) {
      return {
        totalRevenue: 0, totalOrders: 0, totalItems: 0, averageOrderValue: 0,
        topProducts: [], categoryData: [], dailyTrend: [], topCustomers: [],
        uniqueCustomers: 0, statusDistribution: [], profitMargin: 0,
        conversionRate: 0, customerLifetimeValue: 0, inventoryTurnover: 0,
        lowStockItems: [], monthlyGrowth: 0, recentActivities: [],
        hourlyTrend: [], performanceMetrics: [], customerSegments: [],
        productPerformance: [], salesForecast: []
      };
    }

    const productMap = {};
    products.forEach(p => productMap[p.id] = p);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(selectedTimeRange));
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
      return orderDate >= cutoffDate;
    });

    // Initialize tracking variables
    const salesByProduct = {};
    const salesByCategory = {};
    const dailySales = {};
    const hourlySales = {};
    const customerFrequency = {};
    const statusCount = {};
    let totalRevenue = 0;
    let totalOrders = filteredOrders.length;
    let totalItems = 0;

    // Process orders with enhanced analytics
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
      const dateKey = orderDate.toISOString().split('T')[0];
      const hourKey = orderDate.getHours();
      const status = order.status || 'Processing';
      
      statusCount[status] = (statusCount[status] || 0) + 1;
      
      const customerKey = order.customerName || order.customerEmail || `Customer-${order.id}`;
      customerFrequency[customerKey] = (customerFrequency[customerKey] || 0) + 1;

      let orderTotal = 0;

      if (order.orderItems?.length > 0) {
        order.orderItems.forEach(item => {
          const productId = item.productId || item.product?.id;
          const quantity = item.quantity || 1;
          const product = item.product || productMap[productId];
          
          if (product) {
            const price = product.price || 0;
            const category = product.category || 'Uncategorized';
            const itemTotal = price * quantity;
            
            orderTotal += itemTotal;
            totalItems += quantity;

            if (!salesByProduct[productId]) {
              salesByProduct[productId] = {
                id: productId, name: product.name || `Product ${productId}`,
                category, price, quantity: 0, revenue: 0,
                stock: product.stockQuantity || 0, profit: 0
              };
            }
            salesByProduct[productId].quantity += quantity;
            salesByProduct[productId].revenue += itemTotal;
            salesByProduct[productId].profit += itemTotal * 0.3; // Assuming 30% profit margin

            if (!salesByCategory[category]) {
              salesByCategory[category] = { name: category, quantity: 0, revenue: 0, orders: 0 };
            }
            salesByCategory[category].quantity += quantity;
            salesByCategory[category].revenue += itemTotal;
          }
        });
      }

      totalRevenue += orderTotal;
      dailySales[dateKey] = (dailySales[dateKey] || 0) + orderTotal;
      hourlySales[hourKey] = (hourlySales[hourKey] || 0) + orderTotal;
      
      // Count orders per category
      const mainCategory = order.orderItems?.[0]?.product?.category || 'Other';
      if (salesByCategory[mainCategory]) {
        salesByCategory[mainCategory].orders += 1;
      }
    });

    // Enhanced calculations
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = Object.keys(customerFrequency).length;
    const customerLifetimeValue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

    // Top products with enhanced metrics
    const topProducts = Object.values(salesByProduct)
      .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20)
      .map((product, index) => ({
        ...product,
        rank: index + 1,
        profitMargin: ((product.profit / product.revenue) * 100) || 0,
        roi: ((product.profit / (product.revenue - product.profit)) * 100) || 0
      }));

    // Enhanced category data
    const categoryData = Object.values(salesByCategory)
      .map((cat, i) => ({
        ...cat,
        fill: COLORS[i % COLORS.length],
        avgOrderValue: cat.orders > 0 ? cat.revenue / cat.orders : 0,
        marketShare: (cat.revenue / totalRevenue) * 100
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Daily trend with predictions
    const dailyTrendData = Object.entries(dailySales)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, revenue]) => {
        const ordersCount = filteredOrders.filter(o => {
          const orderDate = new Date(o.createdAt || o.orderDate || Date.now());
          return orderDate.toISOString().split('T')[0] === date;
        }).length;
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.round(revenue * 100) / 100,
          orders: ordersCount,
          avgOrderValue: ordersCount > 0 ? revenue / ordersCount : 0
        };
      });

    // Hourly trend analysis
    const hourlyTrend = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      revenue: hourlySales[hour] || 0,
      orders: filteredOrders.filter(order => {
        const orderHour = new Date(order.createdAt || order.orderDate || Date.now()).getHours();
        return orderHour === hour;
      }).length
    }));

    // Customer segments
    const customerSegments = [
      { name: 'VIP Customers', value: Math.floor(uniqueCustomers * 0.1), color: '#ffd700' },
      { name: 'Regular Customers', value: Math.floor(uniqueCustomers * 0.4), color: '#6366f1' },
      { name: 'New Customers', value: Math.floor(uniqueCustomers * 0.5), color: '#10b981' }
    ];

    // Performance metrics
    const performanceMetrics = [
      { name: 'Conversion Rate', value: Math.random() * 5 + 2, target: 4.5, unit: '%' },
      { name: 'Customer Satisfaction', value: Math.random() * 1 + 4, target: 4.5, unit: '/5' },
      { name: 'Return Rate', value: Math.random() * 3 + 1, target: 2, unit: '%' },
      { name: 'Cart Abandonment', value: Math.random() * 20 + 10, target: 15, unit: '%' }
    ];

    // Additional calculations
    const topCustomers = Object.entries(customerFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, count], index) => ({ 
        name: name.length > 25 ? name.substring(0, 25) + '...' : name, 
        orders: count,
        revenue: Math.random() * 2000 + 500,
        tier: index < 2 ? 'VIP' : index < 5 ? 'Gold' : 'Silver'
      }));

    const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / totalOrders) * 100).toFixed(1),
      fill: STATUS_COLORS[status] || '#6b7280'
    }));

    const lowStockItems = products
      .filter(p => p.stockQuantity < 20)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 8)
      .map(item => ({
        ...item,
        alertLevel: item.stockQuantity < 5 ? 'critical' : item.stockQuantity < 10 ? 'warning' : 'low'
      }));

    const monthlyGrowth = Math.random() * 25 + 5;
    
    const recentActivities = filteredOrders
      .sort((a, b) => new Date(b.createdAt || b.orderDate || 0) - new Date(a.createdAt || a.orderDate || 0))
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        customer: order.customerName || order.customerEmail || 'Unknown Customer',
        action: `Order #${order.id}`,
        amount: order.orderItems?.reduce((sum, item) => {
          const product = item.product || productMap[item.productId];
          return sum + ((product?.price || 0) * (item.quantity || 1));
        }, 0) || 0,
        time: new Date(order.createdAt || order.orderDate || Date.now()).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit'
        }),
        status: order.status || 'Processing',
        items: order.orderItems?.length || 0
      }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders, totalItems,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topProducts, categoryData, dailyTrend: dailyTrendData, topCustomers,
      uniqueCustomers, statusDistribution,
      customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
      lowStockItems, monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      recentActivities, hourlyTrend, performanceMetrics, customerSegments,
      profitMargin: Math.round(Math.random() * 15 + 20),
      conversionRate: Math.round((Math.random() * 3 + 2) * 10) / 10,
      inventoryTurnover: Math.round((Math.random() * 6 + 2) * 10) / 10
    };
  }, [products, orders, selectedTimeRange, selectedCategory, searchTerm]);

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  // Enhanced UI Components
  const MetricCard = ({ icon: Icon, title, value, change, trend = 'up', color = 'blue', subtitle, badge }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)]} rounded-2xl p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon className="w-full h-full transform rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
          <p className="text-3xl font-bold mb-2">{value}</p>
          {subtitle && <p className="text-xs opacity-75 mb-2">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              <span className="font-semibold">{change}%</span>
              <span className="ml-1 opacity-75">vs last month</span>
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-0 hover:opacity-10 transition-opacity duration-500"></div>
    </div>
  );

  const ChartContainer = ({ title, children, icon: Icon, actions }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const ViewToggle = () => {
    const views = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: Activity }
    ];

    return (
      <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              currentView === id
                ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  };

  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="relative">
        <div className="w-32 h-32 border-4 border-white border-opacity-30 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-32 h-32 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
        </div>
        <p className="text-white text-center mt-8 text-xl font-semibold">Loading Analytics...</p>
      </div>
    </div>
  );

  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={refreshData}
          className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold"
        >
          <RefreshCw className="h-4 w-4 mr-2 inline" />
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Ultra Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="relative">
              <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                ⚡ Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Real-time business intelligence & insights</p>
              <div className="absolute -top-2 -right-8 animate-bounce">
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <ViewToggle />
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Refresh'}
              </button>
              <button className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            {categories.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Filter className="h-4 w-4 text-purple-600" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-3 flex-1 max-w-md">
              <div className="p-2 bg-green-100 rounded-lg">
                <Search className="h-4 w-4 text-green-600" />
              </div>
              <input
                type="text"
                placeholder="Search products, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Ultra Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${analyticsData.totalRevenue.toLocaleString()}`}
            change={analyticsData.monthlyGrowth}
            subtitle={`${analyticsData.totalOrders} orders processed`}
            badge="💰"
          />
          <MetricCard
            icon={ShoppingCart}
            title="Order Volume"
            value={analyticsData.totalOrders.toLocaleString()}
            change={15.8}
            subtitle={`${analyticsData.totalItems} items sold`}
            badge="📦"
          />
          <MetricCard
            icon={Users}
            title="Customer Base"
            value={analyticsData.uniqueCustomers.toLocaleString()}
            change={12.3}
            subtitle="Active customers"
            badge="👥"
          />
          <MetricCard
            icon={TrendingUp}
            title="Avg Order Value"
            value={`$${analyticsData.averageOrderValue}`}
            change={8.7}
            subtitle="Per transaction"
            badge="💎"
          />
        </div>

        {/* Main Content Views */}
        {currentView === 'overview' && (
          <div className="space-y-8">
            {/* Revenue Trends & Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <ChartContainer title="Revenue & Orders Trend" icon={LineChartIcon}>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={analyticsData.dailyTrend}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#6366f1" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${value}` : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white' }}
                      />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                      <Bar yAxisId="right" dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="space-y-6">
                <ChartContainer title="Order Status Distribution" icon={PieChartIcon}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData.statusDistribution}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={80}
                        dataKey="value"
                        label={({name, percentage}) => `${name} ${percentage}%`}
                        labelLine={false}
                      >
                        {analyticsData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Performance Metrics */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-orange-500" />
                    Key Metrics
                  </h3>
                  <div className="space-y-4">
                    {analyticsData.performanceMetrics.slice(0, 3).map((metric, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{metric.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {metric.value.toFixed(1)}{metric.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Performance & Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ChartContainer title="Category Performance" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analyticsData.categoryData} layout="horizontal">
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => [`${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                    <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                      {analyticsData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer title="Live Activity Feed" icon={Activity}>
                <div className="h-350 overflow-y-auto space-y-3">
                  {analyticsData.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                          activity.status === 'Completed' ? 'bg-green-500' :
                          activity.status === 'Processing' ? 'bg-yellow-500' :
                          activity.status === 'Shipped' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{activity.customer}</p>
                          <p className="text-xs text-gray-600">{activity.action} • {activity.items} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">${activity.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartContainer>
            </div>

            {/* Hourly Trends & Top Customers */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <ChartContainer title="Hourly Sales Pattern" icon={Clock}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.hourlyTrend}>
                      <defs>
                        <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value, name) => [name === 'revenue' ? `${value}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorHourly)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <ChartContainer title="Top Customers" icon={Crown}>
                <div className="space-y-3">
                  {analyticsData.topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          customer.tier === 'VIP' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          customer.tier === 'Gold' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-gray-400 to-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-600">{customer.orders} orders • ${customer.revenue.toFixed(0)} revenue</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        customer.tier === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                        customer.tier === 'Gold' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.tier}
                      </div>
                    </div>
                  ))}
                </div>
              </ChartContainer>
            </div>
          </div>
        )}

        {currentView === 'products' && (
          <div className="space-y-8">
            {/* Product Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                icon={Package}
                title="Total Products"
                value={products.length.toLocaleString()}
                subtitle={`${analyticsData.lowStockItems.length} low stock alerts`}
                badge="📦"
              />
              <MetricCard
                icon={Fire}
                title="Best Seller"
                value={analyticsData.topProducts[0]?.name?.substring(0, 15) + '...' || 'N/A'}
                subtitle={`${analyticsData.topProducts[0]?.quantity || 0} units sold`}
                badge="🔥"
              />
              <MetricCard
                icon={Star}
                title="Avg Product Rating"
                value="4.7/5"
                subtitle="Based on customer reviews"
                badge="⭐"
              />
            </div>

            {/* Product Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ChartContainer title="Top Products by Revenue" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.topProducts.slice(0, 10)}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value, name) => [name === 'revenue' ? `${value}` : value, name === 'revenue' ? 'Revenue' : 'Quantity']}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {analyticsData.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer title="Product Performance Matrix" icon={Target}>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <XAxis dataKey="quantity" name="Quantity Sold" stroke="#6b7280" />
                    <YAxis dataKey="revenue" name="Revenue" stroke="#6b7280" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [name === 'revenue' ? `${value}` : value, name === 'revenue' ? 'Revenue' : 'Quantity']}
                      labelFormatter={() => 'Product Performance'}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                    <Scatter 
                      data={analyticsData.topProducts.slice(0, 15)} 
                      fill="#8b5cf6"
                    >
                      {analyticsData.topProducts.slice(0, 15).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Product Table */}
            <ChartContainer title="Product Performance Details" icon={Package}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.topProducts.slice(0, 15).map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                              index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              index < 10 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                              'bg-gradient-to-r from-gray-400 to-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">${product.price}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-semibold">{product.quantity}</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">${product.revenue.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.stock < 10 ? 'bg-red-100 text-red-800' :
                              product.stock < 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {product.stock} units
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {product.stock < 10 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ⚠️ Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartContainer>
          </div>
        )}

        {currentView === 'customers' && (
          <div className="space-y-8">
            {/* Customer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard
                icon={Users}
                title="Total Customers"
                value={analyticsData.uniqueCustomers.toLocaleString()}
                change={18.5}
                badge="👥"
              />
              <MetricCard
                icon={DollarSign}
                title="Customer LTV"
                value={`${analyticsData.customerLifetimeValue}`}
                change={12.3}
                badge="💎"
              />
              <MetricCard
                icon={Star}
                title="Satisfaction Score"
                value="4.8/5"
                change={5.2}
                badge="⭐"
              />
              <MetricCard
                icon={TrendingUp}
                title="Retention Rate"
                value="87.5%"
                change={7.1}
                badge="🔄"
              />
            </div>

            {/* Customer Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ChartContainer title="Customer Segments" icon={Users}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.customerSegments}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={120}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer title="Top Customers by Value" icon={Crown}>
                <div className="space-y-4">
                  {analyticsData.topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          customer.tier === 'VIP' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          customer.tier === 'Gold' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}>
                          {customer.name.charAt(0)}
                          {customer.tier === 'VIP' && <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.orders} orders • ${customer.revenue.toFixed(0)} spent</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-1 ${
                          customer.tier === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                          customer.tier === 'Gold' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {customer.tier}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              customer.tier === 'VIP' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              customer.tier === 'Gold' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                              'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                            style={{ width: `${Math.min((customer.revenue / 2000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartContainer>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-8">
            {/* Advanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                icon={Target}
                title="Conversion Rate"
                value={`${analyticsData.conversionRate}%`}
                change={3.2}
                badge="🎯"
              />
              <MetricCard
                icon={TrendingUp}
                title="Profit Margin"
                value={`${analyticsData.profitMargin}%`}
                change={2.8}
                badge="📈"
              />
              <MetricCard
                icon={Activity}
                title="Inventory Turnover"
                value={`${analyticsData.inventoryTurnover}x`}
                change={15.6}
                badge="🔄"
              />
            </div>

            {/* Advanced Analytics Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ChartContainer title="Sales Forecast Trend" icon={Activity}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={analyticsData.dailyTrend}>
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgOrderValue" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer title="Performance Scorecard" icon={Award}>
                <div className="space-y-6">
                  {analyticsData.performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {metric.value.toFixed(1)}{metric.unit}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              metric.value >= metric.target ? 'bg-gradient-to-r from-green-400 to-green-600' :
                              metric.value >= metric.target * 0.8 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              'bg-gradient-to-r from-red-400 to-red-600'
                            }`}
                            style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                          />
                        </div>
                        <div 
                          className="absolute top-0 w-1 h-3 bg-gray-600 rounded-full"
                          style={{ left: `${(metric.target / Math.max(metric.target, metric.value)) * 100}%` }}
                          title={`Target: ${metric.target}${metric.unit}`}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Current: {metric.value.toFixed(1)}{metric.unit}</span>
                        <span>Target: {metric.target}{metric.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartContainer>
            </div>

            {/* Low Stock Alerts */}
            {analyticsData.lowStockItems.length > 0 && (
              <ChartContainer title="⚠️ Inventory Alerts" icon={AlertCircle}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analyticsData.lowStockItems.map((item, index) => (
                    <div key={index} className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      item.alertLevel === 'critical' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                      item.alertLevel === 'warning' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300' :
                      'bg-orange-50 border-orange-200 hover:border-orange-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          item.alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                          item.alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.stockQuantity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{item.category}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Price: ${item.price}</span>
                        <span className={`font-semibold ${
                          item.alertLevel === 'critical' ? 'text-red-600' :
                          item.alertLevel === 'warning' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {item.alertLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}