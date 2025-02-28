import React from 'react';
import { redirect } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product, Order } from '../../../types';
import AdminProductList from '../../../components/admin/AdminProductList';
import AdminOrderList from '../../../components/admin/AdminOrderList';

async function getProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

async function getOrders(): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const snapshot = await getDocs(ordersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export default async function AdminPage() {
  // TODO: Add authentication check
  // if (!user || !user.isAdmin) {
  //   redirect('/login');
  // }

  const [products, orders] = await Promise.all([getProducts(), getOrders()]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Panel de Administración</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Productos</h2>
          <AdminProductList products={products} />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Pedidos</h2>
          <AdminOrderList orders={orders} />
        </section>
      </div>
    </div>
  );
} 