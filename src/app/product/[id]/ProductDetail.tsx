'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
}

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionId') || generateSessionId();
    }
    return generateSessionId();
  });

  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchProduct();
    fetchCartCount();
  }, [productId]);

  async function fetchProduct() {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      const foundProduct = products.find((p: Product) => p.id === productId);
      setProduct(foundProduct || null);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCartCount() {
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const cartItems = await response.json();
      const count = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  }

  async function addToCart() {
    if (!product || quantity < 1) return;

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          quantity,
        }),
      });
      setCartCount((prev) => prev + quantity);
      alert('已添加到购物车！');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('添加失败，请重试');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={0} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={cartCount} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">商品不存在</h2>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回商品列表
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-w-1 aspect-h-1 bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-blue-600 mt-4">
                ${product.price.toFixed(2)}
              </p>

              <p className="text-gray-600 mt-6 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-6 flex items-center space-x-2">
                <Package className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  库存: {product.stock} 件
                </span>
              </div>

              {product.stock > 0 ? (
                <div className="mt-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">数量:</label>
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x min-w-[60px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className={`w-full flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>{product.stock === 0 ? '缺货' : '加入购物车'}</span>
                  </button>
                </div>
              ) : (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">该商品暂时缺货</p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t space-y-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">免费配送</p>
                    <p className="text-sm text-gray-600">订单满 $50 免运费</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">安全支付</p>
                    <p className="text-sm text-gray-600">由 Stripe 提供安全支付保障</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
