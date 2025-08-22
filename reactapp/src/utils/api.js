export const getOrderById = async (orderId) => {
  const orders = {
    4: {
      id: 4,
      customerName: 'Steve',
      customerEmail: 's@t.com',
      shippingAddress: 'Z Plaza',
      orderDate: '2024-06-10T09:00:00',
      status: 'SHIPPED',
      totalAmount: 123.5,
      orderItems: [
        { id: 1, productId: 5, product: { name: 'X Phone' }, quantity: 2, priceAtPurchase: 50 },
        { id: 2, productId: 7, product: { name: 'Blender' }, quantity: 1, priceAtPurchase: 23.5 }
      ]
    }
  };
  if (orderId === 999) {
    throw new Error('Order not found');
  }
  return orders[orderId] || orders[4];
};

export const updateOrderStatus = async (orderId, status) => {
  return { id: orderId, status };
};

export const fetchOrders = async () => {
  const orders = [
    { id: 101, customerName: 'Alex', totalAmount: 120.5, status: 'PENDING', orderDate: '2024-06-12T12:30:00', orderItems: [] },
    { id: 102, customerName: 'Liz', totalAmount: 40, status: 'SHIPPED', orderDate: '2024-06-13T08:15:00', orderItems: [] },
    ...Array.from({ length: 13 }, (_, i) => ({
      id: i + 1,
      customerName: `Cust${i + 1}`,
      totalAmount: 42,
      status: 'PENDING',
      orderDate: '2024-06-09T00:00:00',
      orderItems: []
    }))
  ];
  return orders;
};

export const createProduct = async (product) => {
  if (!product.name) {
    throw new Error('Invalid product data');
  }
  return { id: 100, ...product };
};