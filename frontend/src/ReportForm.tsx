import { useState } from "react";

interface ReportFormProps {
  onReportChange: () => Promise<void>;
}

function ReportForm({ onReportChange }: ReportFormProps) {
  const [jenis, setJenis] = useState("Hilang");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("Alat Tulis");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPesan("");

    try {
      const formData = new FormData();

      formData.append("jenis", jenis);
      formData.append("nama", nama);
      formData.append("kategori", kategori);
      formData.append("lokasi", lokasi);
      formData.append("deskripsi", deskripsi);

      if (foto) {
        formData.append("foto", foto);
      }

      const response = await fetch("http://localhost:3000/reports", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengirim laporan");
      }

      const hasil = await response.json();

      setPesan(hasil.message || "Laporan berhasil dikirim!");

      setJenis("Hilang");
      setNama("");
      setKategori("Alat Tulis");
      setLokasi("");
      setDeskripsi("");
      setFoto(null);
      setPreview("");

      // Perbarui statistik di halaman utama
      await onReportChange();
    } catch (error) {
      console.error(error);
      setPesan(
        error instanceof Error ? error.message : "Laporan gagal dikirim.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="form-laporan" className="mx-auto max-w-3xl px-5 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Form Laporan Barang
        </h2>

        <p className="mt-2 text-slate-600">
          Isi informasi barang dengan jelas agar mudah ditemukan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block font-medium">Jenis laporan</label>
            <select
              value={jenis}
              onChange={(event) => setJenis(event.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3"
            >
              <option>Hilang</option>
              <option>Ditemukan</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">Nama barang</label>
            <input
              required
              value={nama}
              onChange={(event) => setNama(event.target.value)}
              placeholder="Contoh: Botol minum biru"
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Kategori</label>
            <select
              value={kategori}
              onChange={(event) => setKategori(event.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3"
            >
              <option>Alat Tulis</option>
              <option>Aksesoris</option>
              <option>Pakaian</option>
              <option>Elektronik</option>
              <option>Tas</option>
              <option>Lainnya</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">Lokasi</label>
            <input
              required
              value={lokasi}
              onChange={(event) => setLokasi(event.target.value)}
              placeholder="Contoh: Lab Komputer"
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Deskripsi barang</label>
            <textarea
              required
              value={deskripsi}
              onChange={(event) => setDeskripsi(event.target.value)}
              placeholder="Jelaskan warna, merek, atau ciri-ciri barang."
              rows={4}
              className="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Foto Barang</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) return;

                setFoto(file);
                setPreview(URL.createObjectURL(file));
              }}
              className="w-full rounded-xl border border-slate-300 p-3"
            />

            {foto && (
              <p className="mt-2 text-sm text-slate-600">
                File dipilih: {foto.name}
              </p>
            )}

            {preview && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-600">Preview foto:</p>
                <img
                  src={preview}
                  alt="Preview barang"
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#9B0F06] px-5 py-3 font-semibold text-white hover:bg-[#5E0006] disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Laporan"}
          </button>

          {pesan && (
            <p role="status" className="mt-3 text-sm text-slate-700">
              {pesan}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default ReportForm;
