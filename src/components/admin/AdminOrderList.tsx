import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import Button from '../ui/Button';

interface AdminOrderListProps {
  orders: Order[];
}

const AdminOrderList: React.FC<AdminOrderListProps> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = React.useState(initialOrders);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      pending: 'Pendiente',
      processing: 'En proceso',
      shipped: 'Enviado',
      delivered: 'Entregado',
    };
    return statusMap[status];
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.total.toFixed(2)}€
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {order.status !== 'delivered' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextStatus = {
                        pending: 'processing',
                        processing: 'shipped',
                        shipped: 'delivered',
                      }[order.status] as Order['status'];
                      
                      if (nextStatus) {
                        handleUpdateStatus(order.id, nextStatus);
                      }
                    }}
                  >
                    Actualizar Estado
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderList; 