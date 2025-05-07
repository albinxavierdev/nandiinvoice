
import React from 'react';

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onItemChange: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  subtotal: number;
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
  subtotal
}) => {
  return (
    <div className="invoice-items">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Quantity (sq.ft)</th>
            <th>Rate (₹/sq.ft)</th>
            <th>Amount (₹)</th>
            <th className="no-print">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                <textarea
                  value={item.description}
                  onChange={(e) => onItemChange(index, 'description', e.target.value)}
                  rows={2}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => onItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => onItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                />
              </td>
              <td className="amount">₹ {item.amount.toFixed(2)}</td>
              <td className="no-print">
                <button className="remove-btn" onClick={() => onRemoveItem(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="subtotal-label">Subtotal:</td>
            <td className="subtotal-amount">₹ {subtotal.toFixed(2)}</td>
            <td className="no-print"></td>
          </tr>
        </tfoot>
      </table>
      
      <div className="table-actions no-print">
        <button className="add-item-btn" onClick={onAddItem}>Add Item</button>
      </div>
    </div>
  );
};

export default InvoiceItemsTable;
