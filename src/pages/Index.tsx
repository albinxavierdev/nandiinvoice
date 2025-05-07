import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrintButton from '../components/PrintButton';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';

// Custom font size module for Quill
const CustomFontSizes = {
  whitelist: ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px'],
  register: function() {
    // Register formats with Quill
    const Size = ReactQuill.Quill.import('attributors/style/size');
    Size.whitelist = this.whitelist;
    ReactQuill.Quill.register(Size, true);
  }
};

// Register the custom sizes
CustomFontSizes.register();

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  sqft: number;
  rate: number;
  amount: number;
}

const getTemplateStyles = (templateId: string) => {
  const templates = {
    classic: {
      containerClass: "bg-white p-8",
      headerClass: "border-b pb-4",
      titleClass: "text-2xl font-bold",
    },
    modern: {
      containerClass: "bg-gradient-to-r from-blue-50 to-indigo-50 p-8",
      headerClass: "border-b-2 border-blue-500 pb-4",
      titleClass: "text-3xl font-bold text-blue-600",
    },
    minimal: {
      containerClass: "bg-gray-50 p-6",
      headerClass: "pb-4",
      titleClass: "text-xl font-medium",
    },
    corporate: {
      containerClass: "bg-white p-8 border-t-4 border-blue-600",
      headerClass: "border-b pb-4 border-gray-200",
      titleClass: "text-2xl font-bold text-gray-800",
    },
    creative: {
      containerClass: "bg-gradient-to-br from-purple-50 to-pink-50 p-8",
      headerClass: "border-b-2 border-purple-400 pb-4",
      titleClass: "text-3xl font-bold text-purple-600",
    },
  };

  return templates[templateId as keyof typeof templates] || templates.classic;
};

// Define bank account interface
interface BankAccount {
  title: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  phoneNumber?: string;
}

const InvoiceGenerator: React.FC = () => {
  const { templateId = 'classic' } = useParams();
  const navigate = useNavigate();
  const styles = getTemplateStyles(templateId);

  // Today's date in DD Month YYYY format
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  // State for invoice header information
  const [companyName, setCompanyName] = useState('NANDI ENTERPRISES');
  const [companyAddress, setCompanyAddress] = useState('163-A TULSI NAGAR INDORE');
  const [companyPhone, setCompanyPhone] = useState('+91 7805941179');
  const [companyGST, setCompanyGST] = useState('23CFEPJ6164B1ZV');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceType, setInvoiceType] = useState('Tax Invoice');
  const [date, setDate] = useState(today);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGSTN, setCustomerGSTN] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  
  // State for invoice items
  const [items, setItems] = useState<InvoiceItem[]>([
    { 
      id: 1, 
      description: '',
      quantity: 0,
      sqft: 0, 
      rate: 0, 
      amount: 0 
    }
  ]);
  
  // Add state for bank selection
  const [selectedBank, setSelectedBank] = useState('bank1');
  
  // Tax information
  const [taxRate, setTaxRate] = useState(0);
  
  // Additional financial fields
  const [advancePayment, setAdvancePayment] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isManualDiscount, setIsManualDiscount] = useState(true);
  
  // Handle discount changes
  const handleDiscountChange = (value: number, isPercentage: boolean) => {
    if (isPercentage) {
      setDiscountPercentage(value);
      setDiscount(parseFloat(((totalAfterTax - advancePayment) * value / 100).toFixed(2)));
      setIsManualDiscount(false);
    } else {
      setDiscount(value);
      const newPercentage = totalAfterAdvance > 0 
        ? parseFloat(((value / totalAfterAdvance) * 100).toFixed(2)) 
        : 0;
      setDiscountPercentage(newPercentage);
      setIsManualDiscount(true);
    }
  };
  
  // Calculate subtotal, tax, and total
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAfterTax = subtotal + taxAmount;
  const totalAfterAdvance = totalAfterTax - advancePayment;
  
  // Update discount based on percentage when totalAfterAdvance changes
  useEffect(() => {
    if (!isManualDiscount) {
      setDiscount(parseFloat(((totalAfterTax - advancePayment) * discountPercentage / 100).toFixed(2)));
    }
  }, [totalAfterTax, advancePayment, discountPercentage, isManualDiscount]);
  
  const total = totalAfterAdvance - discount;
  
  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'size': CustomFontSizes.whitelist }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }]
    ]
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'size', 'align',
    'list', 'bullet'
  ];
  
  // Add state to track which items have manual amounts
  const [manualAmounts, setManualAmounts] = useState<{[key: number]: boolean}>({});
  
  // Helper function to display input value or empty string if zero
  const displayValue = (value: number) => value === 0 ? '' : value;
  
  // Update item in the items array
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    const updatedManualAmounts = {...manualAmounts};
    
    if (field === 'description') {
      updatedItems[index][field] = value as string;
    } else if (field === 'quantity' || field === 'sqft' || field === 'rate' || field === 'amount') {
      updatedItems[index][field] = value as number;
      
      // Auto-calculate amount if quantity, sqft, or rate is changed
      if (field === 'quantity' || field === 'sqft' || field === 'rate') {
        const { quantity, sqft, rate } = updatedItems[index];
        if (quantity && sqft && rate) {
          // Calculate amount as quantity * sqft * rate
          updatedItems[index].amount = parseFloat((quantity * sqft * rate).toFixed(2));
          updatedManualAmounts[updatedItems[index].id] = false;
        } else if (quantity && rate) {
          // Fall back to quantity * rate if sqft is zero or not provided
          updatedItems[index].amount = parseFloat((quantity * rate).toFixed(2));
          updatedManualAmounts[updatedItems[index].id] = false;
        }
      } else if (field === 'amount') {
        // Mark as manual amount
        updatedManualAmounts[updatedItems[index].id] = true;
      }
    }
    
    setItems(updatedItems);
    setManualAmounts(updatedManualAmounts);
  };
  
  // Add a new item to the invoice
  const handleAddItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId, description: '', quantity: 0, sqft: 0, rate: 0, amount: 0 }]);
  };
  
  // Remove an item from the invoice
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };
  
  // Generate formatted description that preserves line breaks
  const formatDescription = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  // Handle settings changes from sidebar
  const handleSettingsChange = (newSettings: any) => {
    setCompanyName(newSettings.companyName);
    setCompanyAddress(newSettings.companyAddress);
    setCompanyPhone(newSettings.companyEmail);
    setTaxRate(newSettings.taxRate);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  // Define bank account details
  const bankAccounts: Record<string, BankAccount> = {
    bank1: {
      title: "HDFC Bank (Business)",
      bankName: "HDFC Bank",
      accountName: "Nandi Enterprises",
      accountNumber: "50200101094615",
      ifscCode: "HDFC0003812",
      branch: "Mahalakshmi Nagar, Indore"
    },
    bank2: {
      title: "ICICI Bank (Personal)",
      bankName: "ICICI Bank",
      accountName: "Yash Jangid",
      accountNumber: "004101056725",
      ifscCode: "ICIC0000041",
      phoneNumber: "+917805941179",
      branch: "Malav Parisar Indore"
    },
    bank3: {
      title: "Kotak Mahindra Bank",
      bankName: "Kotak Mahindra Bank",
      accountName: "Yash Jangid",
      accountNumber: "4850939077",
      ifscCode: "KKBK0005952",
      phoneNumber: "+917805941179",
      branch: "LIG, Indore"
    }
  };

  // Get current bank details
  const currentBank = bankAccounts[selectedBank];

  // Get QR code path based on selected bank
  const getQRCodePath = (bankId: string) => {
    const qrCodeMap: Record<string, string> = {
      'bank1': "./qr/with gst.JPG",
      'bank2': "./qr/without gst.PNG",
      'bank3': "./qr/yash-kotak.jpg"
    };
    
    return qrCodeMap[bankId] || "./qr/default.png";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4 no-print">
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
        <PrintButton />
      </div>
      <div className={`invoice-container max-w-4xl mx-auto ${styles.containerClass}`}>
        <div className={`invoice ${styles.headerClass}`}>
          <div className="invoice-header">
            <div className="company-details">
              <div className="company-name editable">
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="company-name-input"
                />
              </div>
              <div className="company-address editable">
                <input 
                  type="text" 
                  value={companyAddress} 
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="company-address-input"
                />
              </div>
              <div className="company-phone editable">
                <span className="label">PH: </span>
                <input 
                  type="text" 
                  value={companyPhone} 
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="company-phone-input"
                  placeholder="Enter phone number(s)"
                />
              </div>
            </div>
            
            <div className="invoice-details">
              <div className="invoice-type editable">
                <input 
                  type="text" 
                  value={invoiceType} 
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="invoice-type-input"
                />
              </div>
              <div className="invoice-number editable">
                <input 
                  type="text" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="invoice-number-input"
                />
              </div>
              <div className="company-gst editable">
                <div className="company-gst-label">GST Number:</div>
                <input 
                  type="text" 
                  value={companyGST} 
                  onChange={(e) => setCompanyGST(e.target.value)}
                  className="company-gst-input"
                />
              </div>
            </div>
          </div>
          
          <div className="customer-section">
            <div className="bill-to-section">
              <div className="bill-to-label">Bill To:</div>
              <div className="customer-details-container">
                <div className="customer-name-container">
                  <i className="customer-icon fas fa-user"></i>
                  <input 
                    type="text" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="customer-name-input"
                    placeholder="Customer Name"
                  />
                </div>
                <div className="customer-phone-container">
                  <i className="customer-icon fas fa-phone"></i>
                  <input 
                    type="text" 
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="customer-phone-input"
                    placeholder="+91 7805941179"
                  />
                </div>
              </div>
            </div>
            
            <div className="invoice-info">
              <div className="invoice-date-section">
                <div className="invoice-date-label">Invoice Date</div>
                <div className="invoice-date editable">
                  <input 
                    type="text" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>
              <div className="gstn-section">
                <div className="gstn-label">Customer GSTN</div>
                <div className="gstn editable">
                  <input 
                    type="text" 
                    value={customerGSTN} 
                    onChange={(e) => setCustomerGSTN(e.target.value)}
                    className="gstn-input"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Sq. Ft</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td className="description-cell">
                      <div className="rich-text-editor">
                        <ReactQuill
                          value={item.description}
                          onChange={(content) => handleItemChange(index, 'description', content)}
                          modules={modules}
                          formats={formats}
                          theme="snow"
                          placeholder="Enter description..."
                        />
                      </div>
                    </td>
                    <td className="editable">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={displayValue(item.quantity)}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="quantity-input"
                        placeholder="0"
                      />
                    </td>
                    <td className="editable">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={displayValue(item.sqft)}
                        onChange={(e) => handleItemChange(index, 'sqft', parseFloat(e.target.value) || 0)}
                        className="sqft-input"
                        placeholder="0"
                      />
                    </td>
                    <td className="editable">
                      <span className="currency">₹ </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={displayValue(item.rate)}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="rate-input"
                        placeholder="0"
                      />
                    </td>
                    <td className="amount editable">
                      <span className="currency">₹ </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={displayValue(item.amount)}
                        onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="amount-input"
                        placeholder="0"
                      />
                      {!manualAmounts[item.id] && (
                        <span title="Auto-calculated: quantity × sq.ft × rate" className="auto-calc-indicator">*</span>
                      )}
                    </td>
                    <td className="no-print">
                      <button className="remove-btn" onClick={() => handleRemoveItem(index)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-actions no-print">
              <button className="add-item-btn" onClick={handleAddItem}>Add Item</button>
            </div>
          </div>

          {/* Invoice summary, notes, thank you, and payment options block */}
          <div className="invoice-summary-block">
            <table className="summary-table">
              <tbody>
                <tr className="subtotal-row">
                  <td className="subtotal-label">Subtotal:</td>
                  <td className="subtotal-amount"><span className="currency">₹</span> {subtotal.toFixed(2)}</td>
                </tr>
                <tr className="tax-rate-row">
                  <td className="tax-rate-label">Tax Rate:</td>
                  <td className="tax-rate-value editable">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={displayValue(taxRate)}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="tax-rate-input"
                      placeholder="0"
                    />%
                  </td>
                </tr>
                <tr className="tax-row">
                  <td className="tax-label">Tax:</td>
                  <td className="tax-amount"><span className="currency">₹</span> {taxAmount.toFixed(2)}</td>
                </tr>
                <tr className="subtotal-with-tax-row">
                  <td className="subtotal-with-tax-label">Total (Incl. Tax):</td>
                  <td className="subtotal-with-tax-amount"><span className="currency">₹</span> {totalAfterTax.toFixed(2)}</td>
                </tr>
                <tr className="advance-row">
                  <td className="advance-label">Advance Payment Received:</td>
                  <td className="advance-value editable">
                    <span className="currency">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={displayValue(advancePayment)}
                      onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                      className="advance-input"
                      placeholder="0"
                    />
                  </td>
                </tr>
                <tr className="discount-row">
                  <td className="discount-label">Discount:</td>
                  <td className="discount-value editable">
                    <div className="discount-inputs">
                      <div className="amount-input-container">
                        <span className="currency">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={displayValue(discount)}
                          onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0, false)}
                          className="discount-input"
                          placeholder="0"
                        />
                      </div>
                      <div className="percentage-input-container">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={displayValue(discountPercentage)}
                          onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0, true)}
                          className="discount-percentage-input"
                          placeholder="0"
                        />
                        <span className="percentage-symbol">%</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="total-row">
                  <td className="total-label">Balance Due:</td>
                  <td className="total-amount"><span className="currency">₹</span> {total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="note-section">
              <div className="note-input-container no-print">
                <label htmlFor="note-input" className="note-label">Note: </label>
                <ReactQuill
                  value={noteMessage}
                  onChange={(content) => setNoteMessage(content)}
                  modules={modules}
                  formats={formats}
                  theme="snow"
                  placeholder="Add a note here (will only show in print if filled)"
                  className="note-editor"
                />
              </div>
              {noteMessage && (
                <div className="note-container editable">
                  <div className="note-label">Note:</div>
                  <div className="note-content" dangerouslySetInnerHTML={{ __html: noteMessage }} />
                </div>
              )}
            </div>

            <div className="thank-you-message editable">
              <input
                type="text"
                value={thankYouMessage}
                placeholder="Thank you for your business!"
                onChange={(e) => setThankYouMessage(e.target.value)}
                className="thank-you-input"
              />
            </div>

            <div className="payment-options">
              <div className="payment-content">
                <div className="bank-selection-container no-print">
                  <label htmlFor="bank-select" className="bank-select-label">Select Bank Account: </label>
                  <select 
                    id="bank-select" 
                    value={selectedBank} 
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="bank-select"
                  >
                    <option value="bank1">Bank 1 - {bankAccounts.bank1.title}</option>
                    <option value="bank2">Bank 2 - {bankAccounts.bank2.title}</option>
                    <option value="bank3">Bank 3 - {bankAccounts.bank3.title}</option>
                  </select>
                </div>
                <div className="payment-title">Payment Options</div>
                <div className="bank-subtitle no-print hidden">{currentBank.title}</div>
                <div className="bank-details">
                  <div className="bank-detail-row">
                    <span className="label">Name : </span>
                    <input
                      type="text"
                      value={currentBank.accountName}
                      onChange={(e) => {
                        const updatedBankAccounts = {...bankAccounts};
                        updatedBankAccounts[selectedBank as keyof typeof bankAccounts].accountName = e.target.value;
                        // This won't persist changes - would need more complex state management to fully implement editing
                      }}
                      className="account-name-input bold-input"
                    />
                  </div>
                  <div className="bank-detail-row">
                    <span className="label">Account Number : </span>
                    <input
                      type="text"
                      value={currentBank.accountNumber}
                      className="account-number-input bold-input"
                      readOnly
                    />
                  </div>
                  <div className="bank-detail-row no-print hidden">
                    <span className="label">Bank name : </span>
                    <input
                      type="text"
                      value={currentBank.bankName}
                      className="bank-name-input bold-input"
                      readOnly
                    />
                  </div>
                  <div className="bank-detail-row">
                    <span className="label">IFSC Code : </span>
                    <input
                      type="text"
                      value={currentBank.ifscCode}
                      className="ifsc-input bold-input"
                      readOnly
                    />
                  </div>
                  <div className="bank-detail-row">
                    <span className="label">Branch : </span>
                    <input
                      type="text"
                      value={currentBank.branch}
                      className="branch-input bold-input"
                      readOnly
                    />
                  </div>
                  {currentBank.phoneNumber && (
                    <div className="bank-detail-row">
                      <span className="label">Phone Number : </span>
                      <input
                        type="text"
                        value={currentBank.phoneNumber}
                        className="phone-input bold-input"
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="qr-code">
                <img 
                  src={getQRCodePath(selectedBank)}
                  alt="Payment QR Code" 
                  className="qr-image"
                  onError={(e) => {
                    e.currentTarget.src = "./qr/default.png";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="print-section no-print">
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
