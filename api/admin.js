const crypto = require("crypto");
const db = require("./_db");
const h = s => crypto.createHash("sha256").update(String(s)).digest();
module.exports = async (req, res) => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !crypto.timingSafeEqual(h(req.headers["x-admin-password"] || ""), h(pw)))
    return res.status(401).json({ error: "Password salah" });
  try {
    if (req.method === "DELETE") {
      await db("HDEL", "hasil", String(req.query.id || ""));
      return res.status(200).json({ ok: true });
    }
    const flat = (await db("HGETALL", "hasil")) || [];
    const rows = [];
    for (let i = 1; i < flat.length; i += 2) rows.push(JSON.parse(flat[i]));
    rows.sort((a, b) => b.waktu - a.waktu);
    res.status(200).json({ rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
