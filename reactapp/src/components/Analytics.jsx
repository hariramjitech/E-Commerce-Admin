import { useEffect, useState, useMemo } from "react";
import { fetchOrders, fetchProducts } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useTable } from "react-table";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6666", "#66FFB3"];

export default function Analytics() {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const products = (await fetchProducts()).data;
      const orders = (await fetchOrders()).data;

      const productMap = {};
      products.forEach(p => productMap[p.id] = p);

      const salesMap = {};
      const categoryMap = {};

      orders.forEach(order => {
        order.orderItems.forEach(item => {
          const pid = item.product.id;
          const qty = item.quantity;
          const product = productMap[pid];

          salesMap[pid] = (salesMap[pid] || 0) + qty;

          const cat = product.category || "Unknown";
          categoryMap[cat] = (categoryMap[cat] || 0) + qty;
        });
      });

      const formattedSales = Object.entries(salesMap).map(([id, qty]) => ({
        name: productMap[id].name,
        quantity: qty,
        category: productMap[id].category,
      })).sort((a, b) => b.quantity - a.quantity);

      const formattedCategories = Object.entries(categoryMap).map(([cat, qty], i) => ({
        name: cat,
        value: qty,
        color: COLORS[i % COLORS.length],
      }));

      setSalesData(formattedSales);
      setCategoryData(formattedCategories);
    }

    loadData();
  }, []);

  const columns = useMemo(() => [
    { Header: "Product Name", accessor: "name" },
    { Header: "Category", accessor: "category" },
    { Header: "Quantity Sold", accessor: "quantity" },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: salesData });

  const bestSeller = salesData[0];

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center">📊 Sales Dashboard</h1>

      {bestSeller && (
        <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-800 shadow-sm rounded-md">
          🏆 <strong>Best Seller:</strong> <span className="font-semibold">{bestSeller.name}</span> – {bestSeller.quantity} sold
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <h2 className="text-xl font-semibold px-4 pt-4">📈 Product Sales Table</h2>
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 mt-2">
          <thead className="bg-gray-100">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps()}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-600"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className={row.original.name === bestSeller.name ? "bg-yellow-100" : ""}
                >
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-6 py-4 text-sm text-gray-800">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[300px] bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">📊 Top Selling Products</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="w-full h-[300px] bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-2">📂 Sales by Category</h2>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
