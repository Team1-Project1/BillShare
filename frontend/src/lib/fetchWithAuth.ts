export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const doFetch = async (token: string | null) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });
  };

  let response = await doFetch(accessToken);

  if (response.status === 401 || response.status === 403) {
    // refresh token bằng header
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "refresh-token": refreshToken ?? "", // ✅ đúng cách
      },
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      if (newAccessToken && newRefreshToken) {
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        response = await doFetch(newAccessToken);
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    } else {
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
}
