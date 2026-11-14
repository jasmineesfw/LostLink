import { useCallback, useEffect, useState } from "react";
import ReportsList from "./ReportsList";
import ReportForm from "./ReportForm";
import AuthPage from "./AuthPage";

interface Report {
  id: number;
  jenis: string;
  nama: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  foto?: string | null;
  status: string;
}

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [showAuth, setShowAuth] = useState(false);

  const [totalHilang, setTotalHilang] = useState(0);
  const [totalDitemukan, setTotalDitemukan] = useState(0);
  const [totalKembali, setTotalKembali] = useState(0);

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/reports");

      if (!response.ok) {
        throw new Error("Gagal mengambil laporan");
      }

      const data: Report[] = await response.json();

      setTotalHilang(
        data.filter((report) => report.jenis === "Hilang").length
      );

      setTotalDitemukan(
        data.filter((report) => report.jenis === "Ditemukan").length
      );

      setTotalKembali(
        data.filter(
          (report) => report.status === "Berhasil Dikembalikan"
        ).length
      );
    } catch (error) {
      console.error("Gagal mengambil statistik:", error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (showAuth) {
    return (
      <AuthPage
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setShowAuth(false);
        }}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800">

      {/* Navbar */}
      <header className="border-b border-[#EED9B9] bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          <a href="#beranda" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B0F06] text-xl text-white">
              🔗
            </span>
            <span className="text-lg font-bold text-[#5E0006]">
              LostLink
            </span>
          </a>

          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#beranda" className="text-[#9B0F06]">Beranda</a>
            <a href="#barang" className="hover:text-[#9B0F06]">Cari Barang</a>
            <a href="#cara-kerja" className="hover:text-[#9B0F06]">Cara Kerja</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm font-semibold sm:inline">
                  Halo, {user.nama}
                </span>

                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#EED9B9]/40"
                >
                  Keluar
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#EED9B9]/40"
              >
                Masuk
              </button>
            )}

            <a
              href="#lapor"
              className="rounded-lg bg-[#9B0F06] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5E0006]"
            >
              Laporkan Barang
            </a>
          </div>
        </nav>
      </header>

      <main>

        {/* Hero */}
        <section id="beranda" className="overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24 lg:px-8">

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EED9B9]/40 px-4 py-2 text-sm font-semibold text-[#5E0006]">
                <span className="h-2 w-2 rounded-full bg-[#D53E0F]" />
                Solusi barang hilang di sekolah
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Barang hilang?
                <span className="mt-2 block text-[#9B0F06]">
                  Temukan kembali!
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Jangan panik! Cari barang yang hilang atau bantu teman menemukan
                barangnya melalui satu platform yang mudah digunakan.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#barang"
                  className="rounded-xl bg-[#9B0F06] px-6 py-3.5 font-semibold text-white hover:bg-[#5E0006]"
                >
                  Cari Barang →
                </a>

                <a
                  href="#lapor"
                  className="rounded-xl border border-[#EED9B9] px-6 py-3.5 font-semibold text-[#5E0006] hover:bg-[#EED9B9]/30"
                >
                  + Laporkan Barang
                </a>
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                <span className="text-2xl">🎒 📚 🔑</span>
                <span>Membantu warga sekolah saling menemukan</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#EED9B9] blur-3xl" />

              <div className="relative rounded-3xl border border-[#EED9B9] bg-[#FAF7F2] p-5 shadow-xl sm:p-8">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Pencarian barang</p>
                    <h2 className="mt-1 text-xl font-bold text-[#5E0006]">
                      Ada yang bisa dibantu?
                    </h2>
                  </div>
                  <span className="text-3xl">🔎</span>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-4">
                  <p className="font-semibold">🎒 Barang pribadi</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Tas, botol minum, alat tulis, dan lainnya
                  </p>
                </div>

                <div className="mt-3 rounded-2xl bg-white p-4">
                  <p className="font-semibold">📍 Lokasi terakhir</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Cari berdasarkan lokasi barang terlihat
                  </p>
                </div>

                <div className="mt-5 rounded-2xl bg-[#EED9B9]/60 p-4">
                  <p className="text-sm leading-6 text-[#5E0006]">
                    <strong>Saling membantu.</strong> Barang yang ditemukan bisa
                    kembali kepada pemiliknya.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Statistics */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-10 sm:grid-cols-3 lg:px-8">

          {[
            {
              label: "Barang Hilang",
              value: totalHilang,
              icon: "🔎",
              note: "Total laporan barang hilang",
            },
            {
              label: "Barang Ditemukan",
              value: totalDitemukan,
              icon: "🎒",
              note: "Total laporan barang ditemukan",
            },
            {
              label: "Berhasil Dikembalikan",
              value: totalKembali,
              icon: "✅",
              note: "Total barang berhasil dikembalikan",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#EED9B9] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {stat.label}
                </span>
                <span className="text-2xl">{stat.icon}</span>
              </div>

              <p className="mt-4 text-3xl font-bold text-[#5E0006]">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {stat.note}
              </p>
            </div>
          ))}

        </section>

        {/* Reports */}
        <section id="barang" className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <ReportsList onReportChange={fetchReports} />
        </section>

        {/* How it works */}
        <section id="cara-kerja" className="bg-[#EED9B9]/40 py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-[#D53E0F]">
                MUDAH DAN PRAKTIS
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#5E0006]">
                Cara kerja LostLink
              </h2>

              <p className="mt-3 text-slate-600">
                Tiga langkah sederhana untuk membantu barang kembali kepada
                pemiliknya.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">

              {[
                {
                  number: "01",
                  icon: "📝",
                  title: "Laporkan",
                  description: "Masukkan nama barang, ciri-ciri, foto, dan lokasi.",
                },
                {
                  number: "02",
                  icon: "🔍",
                  title: "Cari kecocokan",
                  description: "Cari laporan yang sesuai dengan barang yang hilang.",
                },
                {
                  number: "03",
                  icon: "🤝",
                  title: "Verifikasi dan ambil",
                  description: "Petugas membantu memastikan barang kembali kepada pemilik.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-[#EED9B9] bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#D53E0F]">
                      {step.number}
                    </span>
                    <span className="text-3xl">{step.icon}</span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#5E0006]">
                    {step.title}
                  </h3>

                  <p className="mt-2 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="lapor" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#9B0F06] p-8 text-white sm:p-10 md:flex-row md:items-center">

            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Menemukan atau kehilangan barang?
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-[#EED9B9]">
                Bantu warga sekolah dengan membuat laporan yang jelas agar
                barang lebih mudah ditemukan.
              </p>
            </div>

            <a
              href="#form-laporan"
              className="shrink-0 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#5E0006] hover:bg-[#EED9B9]"
            >
              Mulai lapor →
            </a>

          </div>
        </section>

      </main>

      <ReportForm onReportChange={fetchReports} />

      {/* Footer */}
      <footer className="border-t border-[#EED9B9] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="font-bold text-[#5E0006]">LostLink</p>
          <p>Membantu barang hilang menemukan jalan pulang.</p>
          <p>© 2026 LostLink</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
