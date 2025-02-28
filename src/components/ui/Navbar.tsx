import React from 'react';
import Link from 'next/link';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import useStore from '../../store/useStore';
import Button from './Button';

const Navbar = () => {
  const { cart, user } = useStore();
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              SoulPrinting
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/products" className="text-gray-700 hover:text-blue-600">
              Productos
            </Link>
            <Link href="/custom-request" className="text-gray-700 hover:text-blue-600">
              Pedido Personalizado
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-blue-600">
              FAQ
            </Link>
            
            <Link href="/cart" className="relative">
              <ShoppingCartIcon className="h-6 w-6 text-gray-700 hover:text-blue-600" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              user.isAdmin ? (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </Link>
              ) : (
                <Link href="/profile">
                  <UserIcon className="h-6 w-6 text-gray-700 hover:text-blue-600" />
                </Link>
              )
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 