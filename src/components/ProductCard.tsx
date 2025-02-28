import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../types';
import Button from './ui/Button';
import useStore from '../store/useStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{product.name}</h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">{product.price.toFixed(2)}€</span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sin stock' : 'Añadir'}
          </Button>
        </div>

        {product.customizable && (
          <div className="mt-2">
            <Link href={`/custom-request?productId=${product.id}`}>
              <Button variant="outline" size="sm" fullWidth>
                Personalizar
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 