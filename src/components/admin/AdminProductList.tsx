import React, { useState } from 'react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AdminProductListProps {
  products: Product[];
}

const AdminProductList: React.FC<AdminProductListProps> = ({ products: initialProducts }) => {
  const [products, setProducts] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDelete = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      await updateDoc(doc(db, 'products', editingProduct.id), editingProduct);
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alert('Error al actualizar el producto');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct) return;

    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              {editingProduct?.id === product.id ? (
                <>
                  <td className="px-6 py-4">
                    <Input
                      name="name"
                      value={editingProduct.name}
                      onChange={handleChange}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Input
                      name="price"
                      type="number"
                      value={editingProduct.price}
                      onChange={handleChange}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Input
                      name="stock"
                      type="number"
                      value={editingProduct.stock}
                      onChange={handleChange}
                    />
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <Button variant="primary" size="sm" onClick={handleSave}>
                      Guardar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingProduct(null)}>
                      Cancelar
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.price.toFixed(2)}€</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>
                      Eliminar
                    </Button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductList; 