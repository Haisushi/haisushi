
import { useEffect, useState } from 'react';
import { Order } from '@/types/Order';
import { OrderReceiptContent } from './OrderReceiptContent';
import { useOrderItems } from './hooks/useOrderItems';

interface OrderPrintViewProps {
  order: Order;
}

const OrderPrintView = ({ order }: OrderPrintViewProps) => {
  const { orderItems } = useOrderItems(order);

  if (!order) return null;

  return (
    <div className="p-4 bg-white print-content">
      <OrderReceiptContent order={order} orderItems={orderItems} />
    </div>
  );
};

export default OrderPrintView;
