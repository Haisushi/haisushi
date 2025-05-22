
export const PrintStyle = () => {
  return (
    <style>{`
      @media print {
        @page {
          margin: 10mm;
          size: auto;
        }
        
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          background-color: white;
          color: black;
        }
        
        .print-button {
          display: none !important;
        }

        .print-content {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
      
      .receipt {
        font-family: 'Courier New', monospace;
        max-width: 100%;
        margin: 0 auto;
        padding: 10px;
        box-sizing: border-box;
      }
      
      .receipt-header {
        text-align: center;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: bold;
      }
      
      .receipt-subheader {
        text-align: center;
        margin-bottom: 10px;
        font-size: 14px;
      }
      
      .receipt-info {
        margin-bottom: 15px;
        line-height: 1.5;
      }

      .receipt-info p {
        margin: 5px 0;
      }

      .receipt-info strong {
        font-weight: bold;
      }
      
      .receipt-line {
        border-top: 1px dashed #000;
        margin: 10px 0;
      }
      
      .receipt-items {
        margin: 15px 0;
        width: 100%;
        border-collapse: collapse;
      }

      .receipt-items th,
      .receipt-items td {
        text-align: left;
        padding: 5px;
      }
      
      .receipt-items th:last-child,
      .receipt-items td:last-child {
        text-align: right;
      }
      
      .receipt-total {
        margin-top: 10px;
        font-weight: bold;
      }
      
      .receipt-total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .receipt-footer {
        text-align: center;
        margin-top: 20px;
        font-size: 12px;
        padding-top: 10px;
        border-top: 1px solid #ccc;
      }

      @media screen and (max-width: 480px) {
        .receipt {
          padding: 5px;
        }
      }
    `}</style>
  );
};
