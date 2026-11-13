/* Yalnızca web sayfası: uygulama kurulumu/PWA yok, dış servis yok, veriler tarayıcıda kalıcı, telefon ekranında taşma yok.
   Varsayılan yerel sunucu; canlı site için: node web-sayfa.mjs https://asawet05.github.io/vitatakipp/ */
import puppeteer from 'puppeteer-core';
const base = (process.argv[2] || 'http://localhost:8080/').replace(/\/?$/, '/');
const origin = new URL(base).origin;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const results = []; const log = (n, ok, d) => { results.push(ok); console.log((ok ? 'OK   ' : 'FAIL ') + n + (d ? ' -> ' + d : '')); };
const errs = []; const external = new Set();

const p = await b.newPage();
p.on('pageerror', e => errs.push(e.message));
p.on('request', r => { const u = r.url(); if (/^https?:/.test(u) && !u.startsWith(origin)) external.add(new URL(u).host); });
p.on('dialog', d => (d.type() === 'prompt' ? d.accept('SİL') : d.accept()));
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('vitatakip_legal_accepted', 'true'); } catch (_) {} });
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await p.goto(base + 'index.html', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));

/* 1) Uygulama/kurulum izi yok */
const app = await p.evaluate(async () => ({
  manifest: Boolean(document.querySelector('link[rel="manifest"]')),
  sw: 'serviceWorker' in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
  installUi: Boolean(document.querySelector('#vitaInstallSection, [data-vita-download-entry], .vta-download, [data-install]')),
  installFns: ['openVitaDownloadModal', 'triggerVitaInstallToastOnce', 'renderPwaNotificationSmartChecklist'].filter(f => typeof window[f] === 'function')
}));
log('Manifest (uygulama olarak yükleme) yok', !app.manifest);
log('Servis çalışanı kaydedilmiyor', app.sw === 0, String(app.sw));
log('"Uygulamayı indir" düğmeleri ve kurulum kartı yok', !app.installUi && app.installFns.length === 0, app.installFns.join(','));

/* 2) Hesap aç; tüm görünümleri gez: yasak ifade ve yatay taşma */
await p.evaluate(() => document.getElementById('authTabRegisterBtn').click());
await p.type('#authInputFullName', 'Ayşe Örnek'); // eski kural adında "Örnek" geçen hesabı her açılışta siliyordu
await p.type('#authInputPassword', 'websifre123');
await p.evaluate(() => { document.getElementById('authInputPasswordConfirm').value = 'websifre123'; document.getElementById('authSubmitBtn').click(); });
await new Promise(r => setTimeout(r, 3000));
await p.evaluate(() => { try { closeProfileModal(); } catch (e) {} try { finishVitaSpotlightTour(true); } catch (e) {} });
const scan = await p.evaluate(async () => {
  const banned = /gemini|ai ?studio|firebase|\bapk\b|android|uygulamay[ıi] (indir|yükle|kur)|ana ekrana ekle|api anahtar/i;
  const views = [...document.querySelectorAll('[id^="view-"]')].map(v => v.id).filter(id => /^view-[a-z-]+$/.test(id));
  const hits = [], wide = [];
  for (const v of views) {
    try { navigateToView(v); } catch (e) { continue; }
    await new Promise(r => setTimeout(r, 300));
    document.querySelectorAll('details').forEach(d => { d.open = true; });
    const text = document.body.innerText;
    const m = text.match(banned); if (m) hits.push(`${v}: "${text.slice(Math.max(0, m.index - 30), m.index + 40).replace(/\s+/g, ' ')}"`);
    const o = document.documentElement.scrollWidth - window.innerWidth; if (o > 1) wide.push(`${v}: ${o}px`);
  }
  return { views: views.length, hits: [...new Set(hits)], wide };
});
log(`Ekranda Gemini/AI Studio/Firebase/APK/Android ifadesi yok (${scan.views} görünüm)`, scan.hits.length === 0, scan.hits.slice(0, 3).join(' | '));
log('390px telefon genişliğinde yatay taşma yok', scan.wide.length === 0, scan.wide.join(' | '));

/* 3) Veriler tarayıcıda kalıcı: sayfa yenilense de durur */
await p.evaluate(() => { navigateToView('view-home'); state.hydration = state.hydration || {}; state.hydration.current = 1250; saveState(); });
await p.reload({ waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000));
const persisted = await p.evaluate(() => ({ users: JSON.parse(localStorage.getItem('vitatakip_users_db') || '[]').length, water: (() => { try { return state.hydration.current; } catch (e) { return null; } })(), uid: activeUserId }));
log('Hesap ve veriler yenilemeden sonra tarayıcıda kalır ("Ayşe Örnek" silinmez)', persisted.users >= 1 && persisted.uid && persisted.water === 1250, JSON.stringify(persisted));

/* 4) Dış istek yok */
log('Hiçbir dış sunucuya istek gitmez', external.size === 0, [...external].join(', '));

/* temizlik */
await p.evaluate(async () => { if (!activeUserId) return; try { await deleteMyAccountData(); } catch (e) {} });
log('Sayfa hatası yok', errs.length === 0, errs.slice(0, 3).join(' | '));
console.log('ÖZET', results.filter(Boolean).length + '/' + results.length);
await b.close(); process.exit(0);
