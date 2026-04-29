'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: string;
  sessionId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionId') || generateSessionId();
    }
    return 'session_' + Math.random().toString(36).substr(2, 9);
  });

  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      fetchCartItems();
    }
  }, [sessionId]);

  async function fetchCartItems() {
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCartItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      setError('无法加载购物车，请稍后重试');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(productId: string, change: number) {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId,
          quantity: change,
        }),
      });
      setCartItems(
        cartItems.map((i) =>
          i.productId === productId ? { ...i, quantity: newQuantity } : i
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }

  async function removeFromCart(productId: string) {
    try {
      await fetch(`/api/cart?sessionId=${sessionId}&productId=${productId}`, {
        method: 'DELETE',
      });
      setCartItems(cartItems.filter((i) => i.productId !== productId));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  }

  async function handleCheckout() {
    if (cartItems.length === 0) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          items: cartItems.map((item) => ({
            ...item.product,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to checkout:', error);
      alert('结账失败，请重试');
    } finally {
      setProcessing(false);
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={0} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">出错了</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCartItems}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Session ID: {sessionId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2">返回商品列表</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">购物车</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">购物车是空的</h2>
            <p className="text-gray-600 mb-6">快去选购心仪的商品吧</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              开始购物
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-6 flex items-center space-x-4"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium mt-1"
                    >
                      <Trash2 className="h-4 w-4 inline" /> 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">订单摘要</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>商品数量</span>
                    <span>{cartCount} 件</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>小计</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>总计</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? '处理中...' : '去结账'}
                </button>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  安全结账，由 Stripe 提供支持
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}