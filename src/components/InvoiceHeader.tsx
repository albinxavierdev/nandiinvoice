
import React from 'react';

interface InvoiceHeaderProps {
  companyName: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  onCompanyNameChange: (value: string) => void;
  onInvoiceNumberChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  companyName,
  invoiceNumber,
  date,
  customerName,
  onCompanyNameChange,
  onInvoiceNumberChange,
  onDateChange,
  onCustomerNameChange
}) => {
  return (
    <div className="invoice-header">
      <div className="company-details">
        <div className="input-group">
          <label htmlFor="companyName">Company Name:</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="invoice-details">
        <div className="input-group">
          <label htmlFor="invoiceNumber">Invoice Number:</label>
          <input
            type="text"
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="customerName">Customer Name:</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
