'use client';

import { useEffect, useState } from 'react';
import JustValidate from 'just-validate';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Định nghĩa interface cho fields trong validator
interface ValidatorFields {
  '#password': {
    elem: HTMLInputElement;
  };
}

export const FormRegister = () => {
  const router = useRouter(); // chuyển hướng trang mà không cần reload
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const validator = new JustValidate("#registerForm");

    validator
      .addField('#fullName', [
        {
          rule: 'required' as const,
          errorMessage: 'Vui lòng nhập tên người dùng!'
        },
        {
          rule: 'maxLength' as const,
          value: 200,
          errorMessage: 'Tên người dùng không được vượt quá 200 ký tự!',
        },
      ])
      .addField('#email', [
        {
          rule: 'required' as const,
          errorMessage: 'Vui lòng nhập email!',
        },
        {
          rule: 'email' as const,
          errorMessage: 'Email không đúng định dạng!',
        },
      ])
      .addField('#password', [
        {
          rule: 'required' as const,
          errorMessage: 'Vui lòng nhập mật khẩu!',
        },
        {
          validator: (value: string) => value.length >= 8,
          errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
        },
        {
          validator: (value: string) => /[A-Z]/.test(value),
          errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
        },
        {
          validator: (value: string) => /[a-z]/.test(value),
          errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
        },
        {
          validator: (value: string) => /\d/.test(value),
          errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!',
        },
        // {
        //   validator: (value: string) => /[@$!%*?&]/.test(value),
        //   errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
        // },
      ])
      .addField('#confirmPassword', [
        {
          rule: 'required' as const,
          errorMessage: 'Vui lòng nhập lại mật khẩu!',
        },
        {
          validator: (value: string, fields: ValidatorFields) => value === fields['#password'].elem.value,
          errorMessage: 'Mật khẩu nhập lại không khớp!',
        },
      ])
      .onSuccess((event: Event) => {
        const form = event.target as HTMLFormElement;
        const fullName = form.fullName.value;
        const phone = form.phone.value;
        const email = form.email.value;
        const password = form.password.value;

        const dataFinal = {
          fullName,
          phone,
          email,
          password,
        };
  
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataFinal),
        })
          .then(async (res) => {
            if (res.status === 409) {
              // Email trùng
              toast.error("Email đã tồn tại trong hệ thống!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
              });
              return null; // Dừng ở đây
            }

            // Với các status khác thì parse JSON
            return res.json();
          })
          .then(data => {
            if (!data) return; // Nếu data là null (do lỗi 409), dừng ở đây
            if (data.code === "error") {
              toast.error(data.message, {
                position: "top-center",
                autoClose: 3000, // Tự đóng sau 3 giây
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
              });
            }
  
            if (data.code === "success") {
              toast.success("Đăng ký thành công, vui lòng đăng nhập!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
              });
              router.push("/login");
            }
          });
      });
    // Cleanup: Hủy instance của JustValidate khi component unmount
    return () => {
      validator.destroy();
    };
  }, [router]); // Thêm router vào mảng phụ thuộc

  return (
    <div className="w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2 text-center pb-8">
        <div className="mx-auto w-16 h-16 bg-[#5BC5A7] rounded-full flex items-center justify-center mb-4">
          <FiUser className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản mới</h2>
        <p className="text-base text-gray-600">Tham gia BillShare để quản lý chi tiêu dễ dàng</p>
      </div>

      {/* Form */}
      <form id="registerForm" className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Tên người dùng
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            placeholder="Nhập tên người dùng"
            className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            placeholder="Nhập số điện thoại"
            className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
          />
        </div>
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

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              placeholder="Nhập mật khẩu của bạn"
              className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#4AA88C] transition-colors"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Nhập lại mật khẩu
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#4AA88C] transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300"
        >
          Đăng ký
        </button>
      </form>

      {/* Footer */}
      <div className="flex flex-col space-y-4 pt-6">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/90 px-2 text-gray-600">Hoặc</span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">Đã có tài khoản?</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full h-12 text-base font-semibold text-[#5BC5A7] border border-[#5BC5A7] rounded-md hover:bg-[#5BC5A7]/10 hover:text-[#4AA88C] transition-colors duration-300"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};