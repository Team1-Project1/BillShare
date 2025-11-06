'use client';

import { useEffect, useState } from 'react';
import JustValidate from 'just-validate';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';

export const FormForgotPassword = () => {
  const router = useRouter();
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  // 🕐 Khi reload lại trang → khôi phục email + countdown
  useEffect(() => {
  const savedEmail = sessionStorage.getItem('resetEmail');
  const savedExpireAt = sessionStorage.getItem('otpExpireAt');

  // Nếu không có dữ liệu trong sessionStorage → ở lại form nhập email
  if (!savedEmail || !savedExpireAt) return;

  const remaining = Math.floor((parseInt(savedExpireAt) - Date.now()) / 1000);

  // Lấy email hiện đang nhập (nếu có)
  const currentEmail = email?.trim();

  // Nếu cùng email và OTP còn hạn → tiếp tục form OTP
  if (remaining > 0 && savedEmail === currentEmail) {
    setIsOTPSent(true);
    setCountdown(remaining);
  } else {
    // Email khác hoặc OTP hết hạn → xóa session
    // sessionStorage.removeItem('resetEmail');
    // sessionStorage.removeItem('otpExpireAt');
    // setEmail('');
    setIsOTPSent(false);
  }
}, [email]);

  // ⏳ Giảm thời gian đếm ngược mỗi giây
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Gửi email để nhận OTP
  useEffect(() => {
    const validator = new JustValidate("#forgotForm");

    validator
      .addField('#email', [
        { rule: 'required' as const, errorMessage: 'Vui lòng nhập email!' },
        { rule: 'email' as const, errorMessage: 'Email không đúng định dạng!' },
      ])
      .onSuccess((event: Event) => {
        const form = event.target as HTMLFormElement;
        const emailValue = form.email.value;
        setEmail(emailValue);

        const savedExpireAt = sessionStorage.getItem('otpExpireAt');
        const remaining = savedExpireAt ? Math.floor((parseInt(savedExpireAt) - Date.now()) / 1000) : 0;
        if (sessionStorage.getItem('resetEmail') === emailValue && remaining > 0) {
          toast.info("Bạn vẫn còn mã OTP hợp lệ. Vui lòng kiểm tra email!", {
            position: "top-center",
            autoClose: 3000,
          });
          setIsOTPSent(true);
          setCountdown(remaining);
          return;
        }
        setIsLoading(true);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${emailValue}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
          .then(res => res.json())
          .then(data => {
            setIsLoading(false);
            if (data.details === "email not found") {
              toast.error("Không tìm thấy tài khoản này!", { position: "top-center", autoClose: 3000 });
              return;
            }

            if (data.code === "success") {
              toast.success("OTP đã được gửi đến email của bạn!", {
                position: "top-center",
                autoClose: 3000,
              });

              // ✅ Lưu email + thời gian hết hạn OTP vào sessionStorage
              const expireAt = Date.now() + 60000; // 60s
              sessionStorage.setItem('resetEmail', emailValue);
              sessionStorage.setItem('otpExpireAt', expireAt.toString());

              setIsOTPSent(true);
              setCountdown(60);
              return;
            }

            toast.error("Đã có lỗi xảy ra!", { position: "top-center", autoClose: 3000 });

          });
      });

    return () => validator.destroy();
  }, [router]);

  // Gửi lại OTP
  const handleResendOTP = () => {
    if (countdown > 0) return;
    setIsLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data.message === "Runtime error") {
          toast.error(data.message, { position: "top-center", autoClose: 3000 });
          return;
        }

        toast.success("OTP mới đã được gửi!", {
          position: "top-center",
          autoClose: 3000,
        });

        // ✅ Cập nhật lại thời gian đếm ngược trong sessionStorage
        const expireAt = Date.now() + 60000;
        sessionStorage.setItem('otpExpireAt', expireAt.toString());
        setCountdown(60);
      });
  };

  // Xác nhận OTP
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const otpInput = (document.getElementById('otp') as HTMLInputElement)?.value;

    if (!otpInput || otpInput.length < 4) {
      toast.error("Vui lòng nhập mã OTP hợp lệ!", { position: "top-center" });
      return;
    }

    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp/${otpInput}/${email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        console.log(data)
        if (data.details === "OTP expired") {
          toast.error('OTP hết hạn', { position: "top-center", autoClose: 3000 });
          return;
        }

        if (data.details === "Invalid OTP") {
          toast.error('OTP không hợp lệ', { position: "top-center", autoClose: 3000 });
          return;
        }

        if (data.code === "success") {
          toast.success("Xác thực OTP thành công!", {
            position: "top-center",
            autoClose: 3000,
          });

          sessionStorage.setItem('resetToken', data.data);

          // ✅ Xóa sessionStorage khi xác thực thành công
          sessionStorage.removeItem('otpExpireAt');
          router.push(`/login/forgot-password/reset-password?email=${email}`);
          return;
        }

        toast.error('Đã có lỗi xảy ra', { position: "top-center", autoClose: 3000 });
      })
      .catch(() => {
        setIsLoading(false);
        toast.error("Lỗi kết nối server!", { position: "top-center" });
      });
  };

  return (
    <div className="w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2 text-center pb-8">
        <div className="mx-auto w-16 h-16 bg-[#5BC5A7] rounded-full flex items-center justify-center mb-4">
          <FiMail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu?</h2>
        <p className="text-base text-gray-600">
          Nhập địa chỉ email bạn đã liên kết để đặt lại mật khẩu
        </p>
      </div>

      {/* Form nhập email */}
      {!isOTPSent && (
        <form id="forgotForm" className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Địa chỉ email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="example@email.com"
              className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
            />
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
              'Gửi OTP'
            )}
          </button>
        </form>
      )}

      {/* Form nhập OTP */}
      {isOTPSent && (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div className="space-y-2 mb-2">
            <label htmlFor="otp" className="text-sm font-medium text-gray-700">
              Nhập mã OTP
            </label>
            <input
              type="text"
              id="otp"
              maxLength={6}
              placeholder="Nhập mã OTP gồm 6 chữ số"
              className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`h-12 w-[60%] rounded-md text-base font-semibold flex items-center justify-center transition-colors duration-300 ${isLoading
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
                'Xác nhận OTP'
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              className={`h-12 w-[35%] border rounded-md text-base font-semibold transition-colors duration-300 ${countdown > 0
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-[#5BC5A7] text-[#5BC5A7] hover:bg-[#5BC5A7]/10'
                }`}
            >
              {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại OTP'}
            </button>
          </div>
        </form>
      )}

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
        <p className="text-base text-gray-600">
          Bạn muốn đăng nhập bằng tài khoản khác
        </p>
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
