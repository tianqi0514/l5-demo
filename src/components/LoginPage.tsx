import React, { useState } from 'react';
import { Cpu, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginPageProps {
  onLogin: (industry: 'battery' | 'retail') => void;
}

function detectIndustry(username: string): 'battery' | 'retail' | null {
  const lower = username.trim();
  if (lower === '零售') return 'retail';
  if (lower === '锂电') return 'battery';
  return null;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    const industry = detectIndustry(username.trim());
    if (!industry) {
      setError('用户名错误，请输入"零售"或"锂电"');
      return;
    }

    if (password !== '123456') {
      setError('密码错误，请重新输入');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin(industry);
      setIsLoading(false);
    }, 600);
  };

  const detected = detectIndustry(username);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 mb-4">
            <Cpu size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI 决策中台</h1>
          <p className="text-sm text-gray-500 mt-1">Agent Data OS</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">欢迎登录</h2>
            <p className="text-sm text-gray-500 mb-6">请输入您的账户信息</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="零售 或 锂电"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition-all"
                  autoFocus
                />
                {detected && (
                  <div className="mt-1.5 text-xs text-gray-400">
                    账户类型已识别
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="请输入密码"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all",
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950"
                )}
              >
                <LogIn size={16} />
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
