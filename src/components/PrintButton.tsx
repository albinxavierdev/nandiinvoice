import React, { useState } from 'react';

const PrintButton: React.FC = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    // Set printing state to show message
    setIsPrinting(true);
    
    // Make sure all Quill editor content is properly rendered for printing
    document.querySelectorAll('.ql-editor').forEach(editor => {
      // Ensure any dynamic content is properly rendered
      const content = editor.innerHTML;
      editor.innerHTML = content;
    });
    
    // Add a slight delay to ensure all formatting is applied
    setTimeout(() => {
      window.print();
      // Reset printing state after print dialog closes
      setTimeout(() => {
        setIsPrinting(false);
      }, 1000);
    }, 300);
  };
  
  return (
    <div className="print-section no-print">
      <button className="print-btn" onClick={handlePrint}>
        {isPrinting ? 'Preparing PDF...' : 'Print / Save as PDF'}
      </button>
      {isPrinting && (
        <div className="print-message">
          Opening print dialog. Please select "Save as PDF" option to save the invoice.
        </div>
      )}
    </div>
  );
};

export default PrintButton;
