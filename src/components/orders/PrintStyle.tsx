
export const PrintStyle = () => {
  return (
    <style>{`
      @media print {
        @page {
          margin: 0;
          size: 80mm auto;
        }
        
        body {
          margin: 0;
          padding: 0;
          width: 80mm;
        }
        
        .print-button {
          display: none;
        }
      }
      
      .receipt {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        width: 76mm;
        margin: 0 auto;
        padding: 3mm 2mm;
      }
      
      .receipt-header {
        text-align: center;
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: bold;
      }
      
      .receipt-subheader {
        text-align: center;
        margin-bottom: 10px;
        font-size: 12px;
      }
      
      .receipt-info {
        margin-bottom: 10px;
      }
      
      .receipt-line {
        border-top: 1px dashed #000;
        margin: 5px 0;
      }
      
      .receipt-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .receipt-total {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-weight: bold;
      }
      
      .receipt-footer {
        text-align: center;
        margin-top: 10px;
        font-size: 11px;
      }
    `}</style>
  );
};
