'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';

export const FormResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [token, setToken] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);

  // state password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // toggle show/hide
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Không tìm thấy email, vui lòng quay lại bước xác thực!', {
        position: 'top-center',
      });
      router.push('/login/forgot-password');
      return;
    }
  }, [email, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      toast.error('Đã hết phiên hoạt động vui lòng thực hiện lại bước OTP!', {
        position: 'top-center',
      });
      router.push('/login/forgot-password');
      return;
    }

    setToken(sessionStorage.getItem('resetToken'));

    if (!token) {
      toast.error('Đã hết phiên hoạt động vui lòng thực hiện lại bước OTP!', {
        position: 'top-center',
      });
      router.push('/login/forgot-password');
      return;
    }
  }, [])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validate thủ công
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu!', { position: 'top-center' });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!', {
        position: 'top-center',
      });
      return;
    }

    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự!', { position: 'top-center' });
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      toast.error(
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!',
        { position: 'top-center' }
      );
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password/${email}/${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password,
            repeatPassword: confirmPassword,
          }),
        }
      );

      const data = await res.json();

      if (data.code === 'error' || !res.ok) {
        toast.error(data.message || 'Đặt lại mật khẩu thất bại!', {
          position: 'top-center',
        });
        return;
      }

      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.', {
        position: 'top-center',
        autoClose: 3000,
      });

      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('otpExpireAt');

      router.push('/login');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi kết nối server!', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2 text-center pb-8">
        <div className="mx-auto w-16 h-16 bg-[#5BC5A7] rounded-full flex items-center justify-center mb-4">
          <FiLock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
        <p className="text-base text-gray-600">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mật khẩu mới */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Mật khẩu mới
          </label>
          <div className="flex items-center border border-gray-200 rounded-md px-3 py-2">
            <FiLock className="text-[#5BC5A7] mr-2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Xác nhận mật khẩu mới
          </label>
          <div className="flex items-center border border-gray-200 rounded-md px-3 py-2">
            <FiLock className="text-[#5BC5A7] mr-2" />
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`h-12 w-full rounded-md text-base font-semibold flex items-center justify-center transition-colors duration-300 ${isLoading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-[#5BC5A7] text-white hover:bg-[#4AA88C]'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
              Đang xử lý...
            </span>
          ) : (
            'Xác nhận'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="flex flex-col space-y-4 pt-6 text-center">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/90 px-2 text-gray-600">Hoặc</span>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full h-12 text-base font-semibold text-[#5BC5A7] border border-[#5BC5A7] rounded-md hover:bg-[#5BC5A7]/10 hover:text-[#4AA88C] transition-colors duration-300"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};
