import { useEffect } from "react";

export function useAuthRefresh() {
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    const refresh = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "refresh-token": refreshToken, // ✅ chỉ gửi header
          },
        });

        if (res.ok) {
          const data = await res.json();
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;

          if (newAccessToken && newRefreshToken) {
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Refresh token error:", err);
      }
    };

    // refresh trước khi hết hạn 1 phút
    const interval = setInterval(refresh, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
