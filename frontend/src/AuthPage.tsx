import { useState } from "react";
import type { FormEvent } from "react";

interface AuthPageProps {
  onLoginSuccess: (user: {
    id: number;
    nama: string;
    email: string;
    role: string;
  }) => void;

  onBack: () => void;
}

function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:3000/auth";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!email.toLowerCase().trim().endsWith("@smktelkom-mlg.sch.id")) {
      setMessage("Gunakan email dengan domain @smktelkom-mlg.sch.id");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";

      const body = isLogin
        ? { email: email.trim(), password }
        : { nama: nama.trim(), email: email.trim(), password };

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "Terjadi kesalahan"
        );
      }

      if (isLogin) {
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("user", JSON.stringify(result.user));

        onLoginSuccess(result.user);
      } else {
        setMessage("Registrasi berhasil! Silakan login.");
        setIsLogin(true);
        setPassword("");
      }

    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EED9B9]/40 px-5 py-12">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-[#9B0F06] hover:underline"
        >
          ← Kembali ke Beranda
        </button>

        <div className="mb-7 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9B0F06] text-2xl text-white">
            🔗
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#5E0006]">
            {isLogin ? "Selamat Datang!" : "Buat Akun LostLink"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {isLogin
              ? "Masuk menggunakan akun kamu."
              : "Daftar menggunakan email kamu."}
          </p>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Nama Lengkap
              </label>

              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#9B0F06]"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@smktelkom-mlg.sch.id"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#9B0F06]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#9B0F06]"
            />
          </div>

          {message && (
            <p className="rounded-lg bg-[#EED9B9]/60 p-3 text-sm text-[#5E0006]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#9B0F06] py-3 font-semibold text-white transition hover:bg-[#5E0006] disabled:opacity-50"
          >
            {loading
              ? "Memproses..."
              : isLogin
                ? "Masuk"
                : "Daftar"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600">

          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            className="ml-1 font-bold text-[#9B0F06] hover:underline"
          >
            {isLogin ? "Daftar sekarang" : "Login"}
          </button>

        </p>

      </div>
    </div>
  );
}

export default AuthPage;
