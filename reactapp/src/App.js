import { useState } from "react";
import OrderDetails from "./components/OrderDetails";
import ProductForm from "./components/ProductForm";
import OrderList from "./components/OrderList";
const App = () => {
      const [currentOrderId, setCurrentOrderId] = useState(null);
      const [showProductForm, setShowProductForm] = useState(false);

      const handleViewOrder = (orderId) => setCurrentOrderId(orderId);
      const handleBack = () => setCurrentOrderId(null);
      const handleAddProduct = () => setShowProductForm(true);
      const handleCancelProduct = () => setShowProductForm(false);
      const handleSaveProduct = () => setShowProductForm(false);

      return (
        <div className="container mx-auto">
          {currentOrderId ? (
            <OrderDetails orderId={currentOrderId} onBack={handleBack} />
          ) : showProductForm ? (
            <ProductForm onSave={handleSaveProduct} onCancel={handleCancelProduct} />
          ) : (
            <>
              <button
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
              <OrderList onViewOrder={handleViewOrder} />
            </>
          )}
        </div>
      );
    };

    export default App;