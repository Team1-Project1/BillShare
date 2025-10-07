import { useEffect, useState } from "react";

export function useAuthRefresh() {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(Number(storedUserId));
    }

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
          const newUserId = data.userId || null;

          if (newAccessToken && newRefreshToken) {
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            if (newUserId) {
              localStorage.setItem("userId", String(newUserId));
              setUserId(newUserId);
            }
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
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

  return { userId };
}
