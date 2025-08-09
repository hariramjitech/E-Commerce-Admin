import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import * as api from '../utils/api';
import OrderDetails from '../components/OrderDetails';
import OrderList from '../components/OrderList';
import ProductForm from '../components/ProductForm';

// Mock the API module
jest.mock('../utils/api');

describe('Combined Tests for OrderDetails, OrderList, and ProductForm', () => {

  // OrderDetails Component Tests
  describe('OrderDetails Component Tests', () => {
    const orderObj = {
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
    };

    beforeEach(() => {
      api.getOrderById.mockResolvedValue(orderObj);
      api.updateOrderStatus.mockResolvedValue({ ...orderObj, status: 'DELIVERED' });
    });

    test('State_renders details, items table, and Edit controls', async () => {
      await act(async () => {
        render(<OrderDetails orderId={4} onBack={() => {}} />);
      });

      await screen.findByText('Order Details');
      expect(screen.getByText('Steve')).toBeInTheDocument();
      expect(screen.getByText('s@t.com')).toBeInTheDocument();
      expect(screen.getByText('Blender')).toBeInTheDocument();
      expect(screen.getByText('X Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Order Status:')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('$123.50')).toBeInTheDocument();
    });

    test('State_status dropdown triggers update', async () => {
      await act(async () => {
        render(<OrderDetails orderId={4} onBack={() => {}} />);
      });

      fireEvent.change(screen.getByLabelText('Order Status:'), { target: { value: 'DELIVERED' } });
      fireEvent.click(screen.getByText('Save'));

      await screen.findByText('Status updated');
      expect(api.updateOrderStatus).toHaveBeenCalledWith(4, 'DELIVERED');
    });

    test('State_calls onBack', async () => {
      const onBack = jest.fn();
      await act(async () => {
        render(<OrderDetails orderId={4} onBack={onBack} />);
      });

      fireEvent.click(screen.getByText('Back to Orders'));
      expect(onBack).toHaveBeenCalled();
    });

    test('ErrorHandling_shows error if not found', async () => {
      api.getOrderById.mockRejectedValue({ message: 'Order not found' });
      await act(async () => {
        render(<OrderDetails orderId={999} onBack={() => {}} />);
      });

      await screen.findByText('Order not found');
      expect(screen.getByText('Order not found')).toBeInTheDocument();
    });
  });

  // OrderList Component Tests
  describe('OrderList Component Tests', () => {
    const ordersMock = [
      { id: 101, customerName: 'Alex', totalAmount: 120.5, status: 'PENDING', orderDate: '2024-06-12T12:30:00', orderItems: [] },
      { id: 102, customerName: 'Liz', totalAmount: 40, status: 'SHIPPED', orderDate: '2024-06-13T08:15:00', orderItems: [] }
    ];

    beforeEach(() => {
      api.fetchOrders.mockResolvedValue(ordersMock);
    });

    test('State_renders orders and View Details button', async () => {
      await act(async () => {
        render(<OrderList onViewOrder={() => {}} />);
      });

      await screen.findByText('Alex');
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Alex')).toBeInTheDocument();
      expect(screen.getByText('Liz')).toBeInTheDocument();
      expect(screen.getByTestId('view-button-101')).toBeInTheDocument();
    });

    test('State_pagination shows Page X of Y and buttons work', async () => {
      const many = Array.from({ length: 13 }, (_, i) => ({ id: i + 1, customerName: 'Cust' + (i + 1), totalAmount: 42, status: 'PENDING', orderDate: '2024-06-09T00:00:00', orderItems: [] }));
      api.fetchOrders.mockResolvedValue(many);
      await act(async () => {
        render(<OrderList onViewOrder={() => {}} />);
      });

      await screen.findByText('Cust1');
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('page-next'));
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      expect(screen.getByText('Cust11')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('page-prev'));
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    test('Axios_error case if API fails', async () => {
      api.fetchOrders.mockRejectedValue({ message: 'Order API Error' });
      await act(async () => {
        render(<OrderList onViewOrder={() => {}} />);
      });

      await screen.findByText('Order API Error');
      expect(screen.getByText('Order API Error')).toBeInTheDocument();
    });
  });

  // ProductForm Component Tests
  describe('ProductForm Component Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear any previous mocks before each test
    });

    const valid = {
      name: 'Car',
      description: 'A fancy car',
      price: 42.5,
      category: 'Vehicles',
      stockQuantity: 6,
      imageUrl: 'http://test.img',
    };

    // Test Case 1: Ensure all fields and buttons are rendered
    test('State_renders all fields, save/cancel buttons', async () => {
      await act(async () => {
        render(<ProductForm onSave={() => {}} onCancel={() => {}} />);
      });

      ['Name', 'Description', 'Price', 'Category', 'Stock Quantity', 'Image URL'].forEach(label => {
        expect(screen.getByLabelText(new RegExp(label, 'i'))).toBeInTheDocument();
      });

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    // Test Case 2: Ensure validation messages appear and Save button is disabled
    

    // Test Case 3: Ensure API call with valid data and onSave callback is fired
    test('Axios_calls API with valid data and calls onSave', async () => {
      api.createProduct.mockResolvedValue({ id: 100, ...valid });
      const onSave = jest.fn();

      await act(async () => {
        render(<ProductForm onSave={onSave} onCancel={() => {}} />);
      });

      Object.entries(valid).forEach(([k, v]) => {
        fireEvent.change(screen.getByTestId(`${k}-input`), { target: { value: v } });
      });

      fireEvent.click(screen.getByTestId('form-save'));

      await waitFor(() => {
        expect(api.createProduct).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 100, name: 'Car' }));
      });
    });

    // Test Case 4: Handle server error on save failure
    test('State_shows server error on save failure', async () => {
      api.createProduct.mockRejectedValue({ message: 'Invalid product data' });

      await act(async () => {
        render(<ProductForm onSave={() => {}} onCancel={() => {}} />);
      });

      Object.entries(valid).forEach(([k, v]) => {
        fireEvent.change(screen.getByTestId(`${k}-input`), { target: { value: v } });
      });

      fireEvent.click(screen.getByTestId('form-save'));

      await waitFor(() => {
        expect(screen.getByText('Invalid product data')).toBeInTheDocument();
      });
    });
  });

});
