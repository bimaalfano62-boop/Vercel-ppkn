const db = require("./_db");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const b = req.body || {};
    const nama = String(b.nama || "").trim().slice(0, 60);
    const kelas = String(b.kelas || "").trim().toUpperCase().slice(0, 20);
    const j = b.jawab; // [[idPernyataan, nilai1-5], ...] : 25 item, tepat 5 per sila (id 0-124, sila = id div 25)
    const per = [0, 0, 0, 0, 0], sum = [0, 0, 0, 0, 0], seen = new Set();
    const ok = Array.isArray(j) && j.length === 25 && j.every(a => {
      if (!Array.isArray(a) || !Number.isInteger(a[0]) || a[0] < 0 || a[0] > 124 || seen.has(a[0]) || !Number.isInteger(a[1]) || a[1] < 1 || a[1] > 5) return false;
      seen.add(a[0]); const s = Math.floor(a[0] / 25); per[s]++; sum[s] += a[1] - 1; return true;
    }) && per.every(n => n === 5);
    if (nama.length < 2 || !kelas || !ok) return res.status(400).json({ error: "Data tidak valid" });
    // skor dihitung ulang di server agar tidak bisa dimanipulasi
    const skor = sum.map(v => Math.round(v / 20 * 100));
    const max = Math.max(...skor);
    const dominan = skor.map((v, i) => (v === max ? i : -1)).filter(i => i >= 0);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    await db("HSET", "hasil", id, JSON.stringify({ id, nama, kelas, skor, dominan, waktu: Date.now() }));
    res.status(200).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}; 
