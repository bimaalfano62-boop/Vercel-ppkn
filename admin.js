// ===== ADMIN — Tes Pancasila (tanpa database, data dari localStorage browser ini) =====
// Buka /admin → LANGSUNG nampilin data kuisioner, tanpa login.
const LS_KEY = "hasil_ppkn";

const app = document.getElementById("app");
let rows = [], flt = "", q = "", open_ = "";

function loadRows(){
 try{ return JSON.parse(localStorage.getItem(LS_KEY) || "[]").sort((a,b)=>b.waktu-a.waktu) }catch(e){ return [] }
}
function saveRows(r){ try{ localStorage.setItem(LS_KEY, JSON.stringify(r)) }catch(e){ alert("Gagal menyimpan: penyimpanan browser penuh.") } }

function dash(){
 const ks=[...new Set(rows.map(r=>r.kelas))].sort(),R=rows.filter(r=>(!flt||r.kelas===flt)&&r.nama.toLowerCase().includes(q.toLowerCase()));
 const KL=ks.map(k=>{const g=rows.filter(r=>r.kelas===k);return `<tr><td>${esc(k)}</td><td>${g.length}</td>${[0,1,2,3,4].map(i=>`<td>${Math.round(g.reduce((a,r)=>a+r.skor[i],0)/g.length)}</td>`).join("")}</tr>`}).join("");
 const avg=[0,1,2,3,4].map(i=>R.length?Math.round(R.reduce((a,r)=>a+r.skor[i],0)/R.length):0);
 const cnt=[0,0,0,0,0];R.forEach(r=>r.dominan.forEach(i=>cnt[i]++));const top=R.length?cnt.indexOf(Math.max(...cnt)):-1;
 const cb=cnt.map(v=>R.length?Math.round(v/R.length*100):0);
 app.innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:14px"><h2 style="margin:0">Dashboard admin</h2><button id="rf2">Muat ulang</button></div>
 <div class="card row"><input id="s" placeholder="Cari nama peserta" value="${esc(q)}" aria-label="Cari nama"><select id="f" aria-label="Filter kelas"><option value="">Semua kelas</option>${ks.map(k=>`<option ${k===flt?"selected":""}>${esc(k)}</option>`).join("")}</select><button id="rf">Muat ulang</button><button class="p" id="csv">Unduh CSV</button></div>
 <div class="card row"><div class="st"><b>${R.length}</b>Responden</div><div class="st"><b>${top>=0?SILA[top].n:"-"}</b>Paling dominan</div></div>
 <p class="mu" style="margin:0 0 14px">ℹ️ Data tersimpan di browser perangkat ini saja. Hasil yang dikerjakan siswa di HP/PC lain nggak bakal muncul di sini — dari perangkat itu, buka halaman ini untuk lihat datanya.</p>
 <div class="card"><h2>Rata-rata skor per sila</h2>${bars(avg)}</div>
 <div class="card"><h2>Persentase responden per sila dominan</h2>${bars(cb)}</div>
 <div class="card sc"><h2>Ringkasan per kelas (rata-rata skor)</h2><table style="min-width:0"><tr><th>Kelas</th><th>Peserta</th><th>S1</th><th>S2</th><th>S3</th><th>S4</th><th>S5</th></tr>${KL||'<tr><td colspan="7" class="mu">Belum ada data.</td></tr>'}</table></div>
 <div class="card sc"><h2>Data peserta (klik baris untuk detail)</h2><table><tr><th>Nama</th><th>Kelas</th><th>Tipe</th><th>S1</th><th>S2</th><th>S3</th><th>S4</th><th>S5</th><th>Waktu</th><th></th></tr>
 ${R.map(r=>`<tr data-r="${r.id}" style="cursor:pointer"><td>${esc(r.nama)}</td><td>${esc(r.kelas)}</td><td>${tipe(r.dominan,r.skor).kode}</td>${r.skor.map(x=>`<td>${x}</td>`).join("")}<td>${new Date(r.waktu).toLocaleString("id-ID",{dateStyle:"short",timeStyle:"short"})}</td><td><button data-d="${r.id}" aria-label="Hapus ${esc(r.nama)}">Hapus</button></td></tr>${open_===r.id?`<tr><td colspan="10"><b>${esc(tipe(r.dominan,r.skor).nama)}</b> (${tipe(r.dominan,r.skor).kode})<br>Sila dominan: ${r.dominan.map(i=>SILA[i].n+" – "+SILA[i].t).join("; ")}<br>Urutan skor: ${r.skor.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).map(([v,i])=>SILA[i].n+" "+v+"%").join(" > ")}<br>Diisi: ${new Date(r.waktu).toLocaleString("id-ID",{dateStyle:"full",timeStyle:"short"})}</td></tr>`:""}`).join("")||'<tr><td colspan="10" class="mu">Belum ada data.</td></tr>'}</table></div>`;
 const f=document.getElementById("f"),s=document.getElementById("s"),rf=document.getElementById("rf"),rf2=document.getElementById("rf2"),csv=document.getElementById("csv");
 f.onchange=()=>{flt=f.value;dash()};
 s.oninput=()=>{q=s.value;dash();const e=document.getElementById("s");e.focus();e.setSelectionRange(q.length,q.length)};
 app.querySelectorAll("[data-r]").forEach(t=>t.onclick=e=>{if(e.target.closest("button"))return;open_=open_===t.dataset.r?"":t.dataset.r;dash()});
 rf.onclick=()=>{rows=loadRows();dash()};
 rf2.onclick=()=>{rows=loadRows();dash()};
 csv.onclick=()=>{const c=["Nama,Kelas,Tipe,Nama Tipe,S1,S2,S3,S4,S5,Waktu",...R.map(r=>{const t=tipe(r.dominan,r.skor);return[r.nama,r.kelas,t.kode,t.nama,...r.skor,new Date(r.waktu).toLocaleString("id-ID")].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")})].join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+c],{type:"text/csv"}));a.download="hasil-tes-pancasila.csv";a.click()};
 app.querySelectorAll("[data-d]").forEach(x=>x.onclick=()=>{if(confirm("Hapus data ini?")){rows=rows.filter(r=>r.id!==x.dataset.d);saveRows(rows);dash()}});
}
rows=loadRows();dash(); 
