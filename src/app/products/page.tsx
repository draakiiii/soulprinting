import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product } from '../../../types';
import ProductCard from '../../../components/ProductCard';

async function getProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Nuestros Productos</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
} 