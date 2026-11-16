// Pembungkus REST Upstash Redis (integrasi Vercel Marketplace)
module.exports = async (...cmd) => {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const tok = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !tok) throw new Error("Database belum terhubung");
  const r = await fetch(url, { method: "POST", headers: { Authorization: "Bearer " + tok }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
};
