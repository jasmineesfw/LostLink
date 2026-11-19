import { useEffect, useState } from "react";

interface Report {
  id: number;
  jenis: string;
  nama: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  foto?: string | null;
  status: string;
  createdAt: string;
}

interface ReportsListProps {
  onReportChange: () => Promise<void>;
}

function ReportsList({ onReportChange }: ReportsListProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editForm, setEditForm] = useState({
    jenis: "",
    nama: "",
    kategori: "",
    lokasi: "",
    deskripsi: "",
  });
  const [editFoto, setEditFoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const API_URL = "http://localhost:3000";

  // Mengambil laporan dari backend
  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/reports`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data laporan");
      }

      const data: Report[] = await response.json();
      setReports(data);
    } catch (error) {
      console.error(error);
      setError("Tidak dapat mengambil laporan. Periksa backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Membuka form edit
  const openEditForm = (report: Report) => {
    setEditingReport(report);
    setEditForm({
      jenis: report.jenis,
      nama: report.nama,
      kategori: report.kategori,
      lokasi: report.lokasi,
      deskripsi: report.deskripsi,
    });
    setEditFoto(null);
    setEditError("");
    setSelectedReport(null);
  };

  
  // Menyimpan perubahan laporan
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingReport) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      const formData = new FormData();

      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (editFoto) {
        formData.append("foto", editFoto);
      }

      const response = await fetch(`${API_URL}/reports/${editingReport.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui laporan");
      }

      const result = await response.json();
      const updatedReport: Report = result.data;

      setReports((previousReports) =>
        previousReports.map((report) =>
          report.id === updatedReport.id ? updatedReport : report
        )
      );

      await fetchReports();
      await onReportChange();

      setEditingReport(null);
      setEditFoto(null);
      alert("Laporan berhasil diperbarui!");
    } catch (error) {
      console.error(error);
      setEditError("Gagal menyimpan perubahan. Periksa koneksi backend.");
    } finally {
      setSaving(false);
    }
  };

  // Menandai barang berhasil dikembalikan
  const handleReturn = async () => {
    if (!selectedReport) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    const confirmed = window.confirm(
      `Tandai "${selectedReport.nama}" sebagai berhasil dikembalikan?`
    );

    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append("status", "Berhasil Dikembalikan");

      const response = await fetch(`${API_URL}/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status");
      }

      const result = await response.json();
      const updatedReport: Report = result.data;

      setReports((previousReports) =>
        previousReports.map((report) =>
          report.id === updatedReport.id ? updatedReport : report
        )
      );

      setSelectedReport(updatedReport);

      await fetchReports();
      await onReportChange();

      alert("Barang berhasil ditandai sudah dikembalikan!");
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui status pengembalian.");
    }
  };

  // Menghapus laporan
  const handleDelete = async () => {
    if (!selectedReport) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus laporan "${selectedReport.nama}"?`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`${API_URL}/reports/${selectedReport.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus laporan");
      }

      setReports((previousReports) =>
        previousReports.filter((report) => report.id !== selectedReport.id)
      );

      await fetchReports();
      await onReportChange();

      setSelectedReport(null);

      alert("Laporan berhasil dihapus!");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus laporan. Periksa koneksi backend.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter pencarian dan jenis laporan
  const filteredReports = reports.filter((report) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      report.nama.toLowerCase().includes(keyword) ||
      report.kategori.toLowerCase().includes(keyword) ||
      report.lokasi.toLowerCase().includes(keyword) ||
      report.deskripsi.toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "Semua" || report.jenis.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <p className="text-sm font-semibold text-[#9B0F06]">
          BARANG DI SEKITAR KITA
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Laporan terbaru
        </h2>

        <p className="mt-2 text-slate-600">
          Cari barang berdasarkan nama, kategori, atau lokasi.
        </p>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={fetchReports}
          disabled={loading}
          className="rounded-xl border border-[#EED9B9] bg-white px-4 py-2.5 text-sm font-semibold text-[#5E0006] transition hover:bg-[#EED9B9]/40 disabled:opacity-50"
        >
          {loading ? "Memuat..." : "↻ Refresh Laporan"}
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama barang, kategori, atau lokasi..."
        className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {/* Filter */}
      <div className="mb-7 flex flex-wrap gap-3">
        {["Semua", "Hilang", "Ditemukan"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              filter === item
                ? "bg-[#9B0F06] text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Report List */}
      {loading ? (
        <p className="py-8 text-center text-slate-500">Memuat laporan...</p>
      ) : error ? (
        <p className="py-8 text-center text-red-500">{error}</p>
      ) : filteredReports.length === 0 ? (
        <p className="rounded-xl bg-white py-10 text-center text-slate-500">
          Tidak ada laporan yang cocok.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Foto Barang */}
              {report.foto ? (
                <img
                  src={`${API_URL}${report.foto}`}
                  alt={report.nama}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="flex h-52 w-full items-center justify-center bg-slate-100">
                  <div className="text-center text-slate-400">
                    <span className="text-5xl">📷</span>
                    <p className="mt-2 text-sm">Tidak ada foto</p>
                  </div>
                </div>
              )}

              {/* Informasi Barang */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {report.nama}
                  </h3>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      report.jenis.toLowerCase() === "hilang"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {report.jenis}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-500">{report.kategori}</p>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>📍 {report.lokasi}</p>
                  <p>
                    📅 {new Date(report.createdAt).toLocaleDateString("id-ID")}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#9B0F06]">
                    Status: {report.status || "Menunggu"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="mt-5 w-full rounded-xl border border-[#EED9B9] py-2.5 font-semibold text-[#5E0006] transition hover:bg-[#EED9B9]/40"
                >
                  Lihat Detail
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Jumlah Laporan */}
      <p className="mt-5 text-sm text-slate-500">
        Menampilkan {filteredReports.length} dari {reports.length} laporan.
      </p>

      {/* Modal Detail */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Detail Laporan
              </h2>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-2xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              {selectedReport.nama}
            </h3>

            {selectedReport.foto ? (
              <img
                src={`${API_URL}${selectedReport.foto}`}
                alt={selectedReport.nama}
                className="mt-4 max-h-80 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                Tidak ada foto barang
              </div>
            )}

            <p className="mt-4 text-sm text-slate-500">
              Jenis: {selectedReport.jenis}
            </p>

            <p className="mt-2 text-sm font-semibold text-[#9B0F06]">
              Status Pengembalian: {selectedReport.status || "Menunggu"}
            </p>

            <div className="mt-5 space-y-3 text-slate-700">
              <p>
                <strong>Kategori:</strong> {selectedReport.kategori}
              </p>
              <p>
                <strong>Lokasi:</strong> {selectedReport.lokasi}
              </p>
              <p>
                <strong>Deskripsi:</strong> {selectedReport.deskripsi}
              </p>
              <p>
                <strong>Tanggal:</strong>{" "}
                {new Date(selectedReport.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {selectedReport.jenis.toLowerCase() === "ditemukan" &&
                selectedReport.status !== "Berhasil Dikembalikan" && (
                  <button
                    type="button"
                    onClick={handleReturn}
                    className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Tandai Berhasil Dikembalikan
                  </button>
                )}

              <button
                type="button"
                onClick={() => openEditForm(selectedReport)}
                className="flex-1 rounded-xl bg-amber-500 py-3 font-semibold text-white hover:bg-amber-600"
              >
                Edit Laporan
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Hapus Laporan"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editingReport && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-5"
          onClick={() => setEditingReport(null)}
        >
          <form
            onSubmit={handleUpdate}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Laporan</h2>

              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="text-2xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Jenis Laporan
              </label>
              <select
                value={editForm.jenis}
                onChange={(e) =>
                  setEditForm({ ...editForm, jenis: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-3"
                required
              >
                <option value="Hilang">Hilang</option>
                <option value="Ditemukan">Ditemukan</option>
              </select>
            </div>

            {[
              { name: "nama", label: "Nama Barang" },
              { name: "kategori", label: "Kategori" },
              { name: "lokasi", label: "Lokasi" },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-semibold">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={editForm[field.name as keyof typeof editForm]}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      [field.name]: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 p-3"
                  required
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Deskripsi
              </label>
              <textarea
                value={editForm.deskripsi}
                onChange={(e) =>
                  setEditForm({ ...editForm, deskripsi: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 p-3"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Ganti Foto (opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditFoto(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-slate-300 p-3"
              />
              <p className="mt-1 text-xs text-slate-500">
                Kosongkan jika ingin tetap menggunakan foto lama.
              </p>
            </div>

            {editError && <p className="text-sm text-red-600">{editError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-[#9B0F06] py-3 font-semibold text-white hover:bg-[#5E0006] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReportsList;
