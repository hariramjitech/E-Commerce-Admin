
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showMessage = (text, type) => {
    setAlert({ show: true, message: text, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  const load = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  };

  useEffect(load, []);

  const updateStatus = (id, status) => {
    // Simulate API call
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status } : order
      ));
      showMessage(`✅ Order #${id} status updated to ${status}`, 'success');
    }, 500);
  };

  const deleteOrderById = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      // Simulate API call
      setTimeout(() => {
        setOrders(prev => prev.filter(order => order.id !== id));
        showMessage(`🗑️ Order #${id} deleted successfully`, 'info');
      }, 500);
    }
  };

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
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert 
        alert={alert} 
        onClose={() => setAlert({ show: false, message: '', type: '' })} 
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
              <p className="text-gray-600">Manage and track all customer orders</p>
            </div>
            <div className="px-4 py-2 bg-blue-50 text-blue-800 rounded-full font-semibold text-sm">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Orders will appear here once customers start placing them</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full font-medium text-sm border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                      <p className="text-gray-900">{order.shippingAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'SHIPPED')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm cursor-pointer transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-px"
                      >
                        Mark SHIPPED
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm cursor-pointer transition-all hover:bg-green-700 hover:shadow-md hover:-translate-y-px"
                      >
                        Mark DELIVERED
                      </button>
                    )}
                    <button 
                      onClick={() => deleteOrderById(order.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm cursor-pointer transition-all hover:bg-red-600 hover:shadow-md hover:-translate-y-px"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
