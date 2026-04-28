'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session_id');
    setSessionId(session || '');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            支付成功！
          </h1>
          
          <p className="text-gray-600 mb-6">
            感谢您的购买，订单已成功处理。
          </p>
          
          {sessionId && (
            <p className="text-sm text-gray-500 mb-6">
              订单编号: {sessionId}
            </p>
          )}
          
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              返回首页
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            我们将向您的邮箱发送订单确认邮件
          </p>
        </div>
      </div>
    </div>
  );
}