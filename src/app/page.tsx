import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';

async function getFeaturedProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, limit(4));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Figuras 3D Personalizadas
            </h1>
            <p className="mt-4 text-xl text-white">
              Crea tus propios diseños o elige entre nuestra colección de figuras únicas.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <Link href="/products">
                <Button variant="primary" size="lg">
                  Ver Productos
                </Button>
              </Link>
              <Link href="/custom-request">
                <Button variant="outline" size="lg" className="bg-white/10 text-white hover:bg-white/20">
                  Pedido Personalizado
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold">Productos Destacados</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button variant="outline" size="lg">
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">¿Por qué elegirnos?</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Personalización Total</h3>
              <p className="text-gray-600">
                Crea figuras únicas adaptadas a tus necesidades y preferencias.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Calidad Premium</h3>
              <p className="text-gray-600">
                Utilizamos materiales de alta calidad y tecnología de impresión avanzada.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Envío Rápido</h3>
              <p className="text-gray-600">
                Entrega rápida y segura a cualquier parte de España.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 