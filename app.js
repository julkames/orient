/* =====================================================================
   ORIENT! – KOD APLIKACJI (wersja 1)
   Treści (punkty, trasy, pytania) są w pliku dane.js.
   ===================================================================== */

/* ---------- 1. Zapamiętywanie postępów w telefonie ---------- */

const KLUCZ = "orient_v1";

function wczytajStan() {
  try {
    const s = JSON.parse(localStorage.getItem(KLUCZ));
    if (s && typeof s === "object") return Object.assign({ trasy: {} }, s);
  } catch (e) { /* brak zapisu lub prywatny tryb przeglądarki */ }
  return { trasy: {}, aktywnaTrasa: null, test: false, tworca: false };
}
let stan = wczytajStan();

function zapisz() {
  try { localStorage.setItem(KLUCZ, JSON.stringify(stan)); } catch (e) {}
}

function postepTrasy(id) {
  if (!stan.trasy[id]) stan.trasy[id] = { zdobyte: [], start: null, koniec: null };
  return stan.trasy[id];
}

/* ---------- 2. Pomocnicze ---------- */

const app = document.getElementById("app");

function esc(t) {
  return String(t ?? "").replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));
}

function trasaPoId(id) { return TRASY.find((t) => t.id === id); }

function trasyZPunktem(kod) { return TRASY.filter((t) => t.etapy.some((e) => e.punkt === kod)); }

// Odległość między dwoma punktami na Ziemi w metrach (wzór haversine)
function odleglosc(lat1, lng1, lat2, lng2) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function ladnyDystans(m) { return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`; }

function ladnyCzas(ms) {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

function wyczyscAdres() { history.replaceState(null, "", location.pathname); }

function gora({ wstecz = null, tytul = "", prawa = "" } = {}) {
  const lewa = wstecz
    ? `<button class="wstecz" aria-label="Wstecz" onclick="${wstecz}">←</button><div class="tytul">${esc(tytul)}</div>`
    : `<div class="logo"><span class="kolko"></span>${esc(USTAWIENIA.nazwaAplikacji)}</div>`;
  const baner = stan.test ? `<div class="tryb-baner">🧪 Tryb testowy – GPS nie jest sprawdzany</div>` : "";
  return `<header class="gora">${lewa}<div class="odstep"></div>${prawa}</header>${baner}`;
}

function pobierzPozycje() {
  return new Promise((ok, blad) => {
    if (!navigator.geolocation) return blad({ code: 0 });
    navigator.geolocation.getCurrentPosition(ok, blad, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
  });
}

/* ---------- 3. Ekran główny ---------- */

function ekranGlowny() {
  wyczyscAdres();
  const karty = TRASY.map((t) => {
    const p = postepTrasy(t.id);
    const ile = p.zdobyte.length, wszystkie = t.etapy.length;
    const status = p.koniec ? "✅ Ukończona" : ile ? `${ile} z ${wszystkie} punktów` : `${wszystkie} punktów`;
    return `
      <button class="karta trasa-karta" style="--kolor:${esc(t.kolor)}" onclick="ekranTrasy('${esc(t.id)}')">
        <h2>${esc(t.nazwa)}</h2>
        <p class="maly">${esc(t.opis)}</p>
        <div class="meta">
          <span class="chip">📏 ${esc(t.dlugosc)}</span>
          <span class="chip">⏱ ${esc(t.czas)}</span>
          <span class="chip">👧 ${esc(t.wiek)}</span>
        </div>
        <div class="pasek"><i style="width:${(ile / wszystkie) * 100}%"></i></div>
        <p class="maly" style="margin-top:6px">${status}</p>
      </button>`;
  }).join("");

  app.innerHTML = `
    ${gora({ prawa: `<button class="ikonka-btn" onclick="ekranTrofeow()">🏅 Trofea</button>` })}
    <section class="hero">
      <h1>Zamień spacer<br>w <span>przygodę</span></h1>
      <p>Wybierzcie trasę, szukajcie tabliczek z kółkiem i przyłóżcie do nich telefon.</p>
    </section>
    <div class="stos">${karty}</div>
    <div style="margin-top:28px;text-align:center">
      <button class="ikonka-btn" onclick="ekranUstawien()">⚙️ Ustawienia</button>
    </div>`;
  window.scrollTo(0, 0);
}

/* ---------- 4. Ekran trasy (mapa + lista punktów) ---------- */

let mapa = null;

function ekranTrasy(id) {
  wyczyscAdres();
  const t = trasaPoId(id);
  if (!t) return ekranGlowny();
  stan.aktywnaTrasa = id; zapisz();
  const p = postepTrasy(id);
  const nastepnyIdx = t.etapy.findIndex((e) => !p.zdobyte.includes(e.punkt));

  const lista = t.etapy.map((e, i) => {
    const pk = PUNKTY[e.punkt] || {};
    const zdobyty = p.zdobyte.includes(e.punkt);
    const ukryty = t.kolejnosc && !zdobyty && i > nastepnyIdx;
    const nastepny = i === nastepnyIdx;
    let opis;
    if (zdobyty) opis = `<h3>${esc(e.trofeum?.ikona || "")} ${esc(e.trofeum?.nazwa || pk.nazwa)}</h3><p class="wsk">${esc(pk.nazwa)}</p>`;
    else if (ukryty) opis = `<h3>Punkt ${i + 1}</h3><p class="wsk">Odkryje się po zdobyciu poprzedniego</p>`;
    else opis = `<h3>Punkt ${i + 1}${nastepny ? " · szukacie teraz" : ""}</h3><p class="wsk">${esc(e.wskazowka)}</p>`;
    const test = stan.test && !zdobyty && !ukryty
      ? `<button class="test-btn" onclick="ekranPunktu('${esc(e.punkt)}')">🧪 Udawaj skan punktu ${esc(e.punkt)}</button>` : "";
    return `<div class="etap ${zdobyty ? "zdobyty" : ""} ${ukryty ? "ukryty" : ""}">
        <div class="nr">${zdobyty ? "✓" : i + 1}</div>
        <div class="tresc">${opis}${test}</div>
      </div>`;
  }).join("");

  const ukonczona = p.koniec
    ? `<div class="karta srodek" style="background:var(--zielen-jasna)"><h3>🎉 Ukończyliście tę trasę!</h3><p class="maly" style="margin-top:4px">Czas: ${ladnyCzas(p.koniec - p.start)}</p></div>` : "";

  app.innerHTML = `
    ${gora({ wstecz: "ekranGlowny()", tytul: t.nazwa })}
    <div class="stos">
      <div id="mapa"></div>
      ${ukonczona}
      <div class="karta">
        <div class="etykieta" style="margin-bottom:10px">Punkty kontrolne · ${p.zdobyte.length}/${t.etapy.length}</div>
        ${lista}
      </div>
      <button class="btn jasny" onclick="pokazMnieNaMapie()">📍 Pokaż, gdzie jestem</button>
    </div>`;
  window.scrollTo(0, 0);
  narysujMape(t, p, nastepnyIdx);
}

function narysujMape(t, p, nastepnyIdx) {
  if (typeof L === "undefined") { document.getElementById("mapa").innerHTML = `<p class="maly" style="padding:20px">Nie udało się wczytać mapy.</p>`; return; }
  if (mapa) { mapa.remove(); mapa = null; }
  mapa = L.map("mapa", { zoomControl: false, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© OpenStreetMap",
  }).addTo(mapa);

  const granice = [];
  const linia = [];
  t.etapy.forEach((e, i) => {
    const pk = PUNKTY[e.punkt];
    if (!pk) return;
    const zdobyty = p.zdobyte.includes(e.punkt);
    const ukryty = t.kolejnosc && !zdobyty && i > nastepnyIdx;
    linia.push([pk.lat, pk.lng]);
    granice.push([pk.lat, pk.lng]);
    if (ukryty) return;
    const klasa = `pk-ikona ${zdobyty ? "zdobyty" : ""} ${i === nastepnyIdx ? "nastepny" : ""}`;
    L.marker([pk.lat, pk.lng], {
      icon: L.divIcon({ className: "", html: `<div class="${klasa}">${zdobyty ? "✓" : i + 1}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] }),
    }).addTo(mapa).bindPopup(`<b>${i + 1}. ${esc(zdobyty ? pk.nazwa : "Punkt " + (i + 1))}</b>`);
  });
  if (t.kolejnosc && linia.length > 1) {
    L.polyline(linia, { color: "#C2185B", weight: 2, opacity: .45, dashArray: "6 6" }).addTo(mapa);
  }
  if (granice.length) mapa.fitBounds(granice, { padding: [36, 36], maxZoom: 17 });
}

let znacznikJa = null;
async function pokazMnieNaMapie() {
  try {
    const poz = await pobierzPozycje();
    const ll = [poz.coords.latitude, poz.coords.longitude];
    if (!mapa) return;
    if (znacznikJa) znacznikJa.remove();
    znacznikJa = L.marker(ll, { icon: L.divIcon({ className: "", html: `<div class="ja-ikona"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(mapa);
    mapa.setView(ll, 17);
    document.getElementById("mapa").scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    alertLokalizacji(e);
  }
}

function alertLokalizacji(e) {
  const box = document.createElement("div");
  box.className = "karta";
  box.style.marginTop = "14px";
  box.innerHTML = tekstBleduLokalizacji(e);
  app.querySelector(".stos")?.appendChild(box);
}

function tekstBleduLokalizacji(e) {
  if (e && e.code === 1) {
    return `<h3>📍 Potrzebujemy lokalizacji</h3>
      <p class="maly" style="margin-top:6px">Lokalizacja jest wyłączona dla tej strony. Na iPhonie: <b>Ustawienia → Prywatność i ochrona → Usługi lokalizacji → Witryny Safari</b> → „Podczas używania”. Potem odśwież stronę.</p>`;
  }
  return `<h3>📍 Nie udało się ustalić pozycji</h3>
    <p class="maly" style="margin-top:6px">Wyjdźcie spod drzew na otwartą przestrzeń i spróbujcie ponownie.</p>`;
}

/* ---------- 5. Ekran punktu (to otwiera się po przyłożeniu telefonu) ---------- */

function ekranPunktu(kod) {
  kod = String(kod || "").toUpperCase();
  const pk = PUNKTY[kod];
  if (!pk) {
    app.innerHTML = `${gora({ wstecz: "ekranGlowny()", tytul: "Nieznany punkt" })}
      <div class="karta srodek stos"><div class="duza-ikona">🤔</div><h2>Nie znamy takiego punktu</h2>
      <p class="maly">Kod „${esc(kod)}” nie pasuje do żadnej tabliczki.</p>
      <button class="btn" onclick="ekranGlowny()">Zobacz trasy</button></div>`;
    return;
  }

  // Która trasa? Najpierw aktywna, potem jedyna pasująca, w ostateczności wybór.
  const pasujace = trasyZPunktem(kod);
  let trasa = pasujace.find((t) => t.id === stan.aktywnaTrasa);
  if (!trasa && pasujace.length === 1) trasa = pasujace[0];
  if (!trasa && pasujace.length > 1) return ekranWyboruTrasy(kod, pasujace);
  if (!trasa) return pokazTresc(kod, null);

  stan.aktywnaTrasa = trasa.id; zapisz();
  const p = postepTrasy(trasa.id);
  const idx = trasa.etapy.findIndex((e) => e.punkt === kod);

  if (p.zdobyte.includes(kod)) return pokazTresc(kod, trasa, { juzByl: true });

  // Kolejność punktów
  if (trasa.kolejnosc) {
    const nastepnyIdx = trasa.etapy.findIndex((e) => !p.zdobyte.includes(e.punkt));
    if (idx !== nastepnyIdx) {
      const nast = trasa.etapy[nastepnyIdx];
      app.innerHTML = `${gora({ wstecz: `ekranTrasy('${trasa.id}')`, tytul: trasa.nazwa })}
        <div class="karta srodek stos"><div class="duza-ikona">🧭</div>
        <h2>To punkt nr ${idx + 1}</h2>
        <p>Na tej trasie idziecie po kolei. Najpierw znajdźcie <b>punkt nr ${nastepnyIdx + 1}</b>.</p>
        <p class="maly">Wskazówka: ${esc(nast.wskazowka)}</p>
        <button class="btn" onclick="ekranTrasy('${trasa.id}')">Pokaż mapę trasy</button></div>`;
      return;
    }
  }

  sprawdzLokalizacje(kod, trasa);
}

function ekranWyboruTrasy(kod, trasy) {
  const pk = PUNKTY[kod];
  app.innerHTML = `${gora({ wstecz: "ekranGlowny()", tytul: pk.nazwa })}
    <div class="stos">
      <div class="karta srodek"><div class="duza-ikona">${esc(pk.ikona)}</div><h2>Którą trasą idziecie?</h2>
      <p class="maly" style="margin-top:6px">Ten punkt należy do kilku tras.</p></div>
      ${trasy.map((t) => `<button class="btn jasny" onclick="stan.aktywnaTrasa='${t.id}';zapisz();ekranPunktu('${kod}')">${esc(t.nazwa)}</button>`).join("")}
    </div>`;
}

async function sprawdzLokalizacje(kod, trasa) {
  const pk = PUNKTY[kod];
  if (stan.test) return pokazTresc(kod, trasa);

  app.innerHTML = `${gora({ wstecz: `ekranTrasy('${trasa.id}')`, tytul: trasa.nazwa })}
    <div class="karta srodek"><div class="spinner"></div><h2>Sprawdzamy, czy jesteście przy punkcie…</h2>
    <p class="maly" style="margin:8px 0 10px">Jeśli telefon zapyta o lokalizację, wybierzcie „Zezwól”.</p></div>`;

  try {
    const poz = await pobierzPozycje();
    const d = odleglosc(poz.coords.latitude, poz.coords.longitude, pk.lat, pk.lng);
    const tolerancja = Math.min(poz.coords.accuracy || 0, 50); // wybaczamy niedokładny GPS pod drzewami
    if (d - tolerancja <= USTAWIENIA.promienMetry) return pokazTresc(kod, trasa);

    app.innerHTML = `${gora({ wstecz: `ekranTrasy('${trasa.id}')`, tytul: trasa.nazwa })}
      <div class="karta srodek stos"><div class="duza-ikona">🔭</div>
      <h2>Jesteście jeszcze daleko</h2>
      <p>Do punktu zostało ok. <b>${ladnyDystans(d)}</b>. Podejdźcie do tabliczki i przyłóżcie telefon jeszcze raz.</p>
      <button class="btn magenta" onclick="ekranPunktu('${kod}')">Sprawdź ponownie</button>
      <button class="btn jasny" onclick="ekranTrasy('${trasa.id}')">Pokaż mapę</button></div>`;
  } catch (e) {
    app.innerHTML = `${gora({ wstecz: `ekranTrasy('${trasa.id}')`, tytul: trasa.nazwa })}
      <div class="karta stos">${tekstBleduLokalizacji(e)}
      <button class="btn magenta" onclick="ekranPunktu('${kod}')">Spróbuj ponownie</button></div>`;
  }
}

function pokazTresc(kod, trasa, { juzByl = false } = {}) {
  const pk = PUNKTY[kod];
  const etap = trasa ? trasa.etapy.find((e) => e.punkt === kod) : null;
  const nr = trasa ? trasa.etapy.indexOf(etap) + 1 : null;

  const pytanie = etap?.pytanie && !juzByl ? `
    <div class="karta" id="quiz">
      <div class="etykieta">Zagadka</div>
      <h3 style="margin-top:6px;font-size:19px">${esc(etap.pytanie.tresc)}</h3>
      ${etap.pytanie.odpowiedzi.map((o, i) => `<button class="odp" onclick="odpowiedz(this, ${i}, '${kod}')">${esc(o)}</button>`).join("")}
    </div>` : "";

  const dalej = juzByl
    ? `<div class="karta srodek" style="background:var(--zielen-jasna)"><p><b>${esc(etap?.trofeum?.ikona || "🏅")} To trofeum już macie!</b></p></div>
       <button class="btn" onclick="ekranTrasy('${trasa.id}')">Wróć do trasy</button>`
    : trasa && !etap?.pytanie ? `<button class="btn magenta" onclick="zdobadz('${kod}')">Odbierz trofeum 🏅</button>` : "";

  app.innerHTML = `
    ${gora({ wstecz: trasa ? `ekranTrasy('${trasa.id}')` : "ekranGlowny()", tytul: trasa ? trasa.nazwa : pk.nazwa })}
    <div class="stos">
      <div class="karta">
        <div class="srodek">
          <div class="duza-ikona">${esc(pk.ikona)}</div>
          ${nr ? `<span class="kod-pk">Punkt ${nr}</span>` : ""}
          <h2 style="margin-top:10px;font-size:26px">${esc(pk.nazwa)}</h2>
        </div>
        <div style="margin-top:18px">
          <div class="ciekawostka-naglowek"><span class="etykieta">💡 Czy wiecie, że…</span></div>
          <p class="ciekawostka">${esc(pk.ciekawostka)}</p>
        </div>
      </div>
      ${pytanie}
      ${dalej}
      ${stan.tworca ? panelTworcy(kod) : ""}
    </div>`;
  window.scrollTo(0, 0);
}

function odpowiedz(btn, i, kod) {
  const trasa = trasaPoId(stan.aktywnaTrasa);
  const etap = trasa.etapy.find((e) => e.punkt === kod);
  if (i === etap.pytanie.poprawna) {
    btn.classList.add("dobrze");
    btn.textContent = "✅ " + btn.textContent;
    document.querySelectorAll("#quiz .odp").forEach((b) => (b.disabled = true));
    setTimeout(() => zdobadz(kod), 700);
  } else {
    btn.classList.remove("zle"); void btn.offsetWidth; btn.classList.add("zle");
    btn.disabled = true;
  }
}

/* ---------- 6. Zdobycie trofeum i koniec trasy ---------- */

function zdobadz(kod) {
  const trasa = trasaPoId(stan.aktywnaTrasa);
  const etap = trasa.etapy.find((e) => e.punkt === kod);
  const p = postepTrasy(trasa.id);
  if (!p.start) p.start = Date.now();
  if (!p.zdobyte.includes(kod)) p.zdobyte.push(kod);
  const koniec = trasa.etapy.every((e) => p.zdobyte.includes(e.punkt));
  if (koniec && !p.koniec) p.koniec = Date.now();
  zapisz();

  const nastepny = trasa.etapy.find((e) => !p.zdobyte.includes(e.punkt));
  const nastNr = nastepny ? trasa.etapy.indexOf(nastepny) + 1 : null;

  app.innerHTML = `
    ${gora({ wstecz: `ekranTrasy('${trasa.id}')`, tytul: trasa.nazwa })}
    <div class="stos">
      <div class="karta srodek">
        <div class="etykieta">Nowe trofeum!</div>
        <div class="medal trofeum-pokaz">${esc(etap.trofeum?.ikona || "🏅")}</div>
        <h2 style="font-size:26px">${esc(etap.trofeum?.nazwa || "Odkrywca")}</h2>
        <p class="maly" style="margin-top:6px">${p.zdobyte.length} z ${trasa.etapy.length} punktów</p>
      </div>
      ${koniec
        ? `<button class="btn magenta" onclick="ekranKonca('${trasa.id}')">Zobacz podsumowanie 🎉</button>`
        : `<div class="karta"><div class="etykieta">Następny: punkt ${nastNr}</div>
             <p style="margin-top:6px">${esc(trasa.kolejnosc ? nastepny.wskazowka : "Szukajcie pozostałych punktów w dowolnej kolejności!")}</p></div>
           <button class="btn" onclick="ekranTrasy('${trasa.id}')">Pokaż mapę</button>`}
    </div>`;
  konfetti(koniec ? 120 : 40);
  if (navigator.vibrate) navigator.vibrate(120);
}

function ekranKonca(id) {
  const t = trasaPoId(id), p = postepTrasy(id);
  const trofea = t.etapy.map((e) => `<div class="trofeum"><div class="m">${esc(e.trofeum?.ikona || "🏅")}</div><div class="n">${esc(e.trofeum?.nazwa || "")}</div></div>`).join("");
  app.innerHTML = `
    ${gora({ wstecz: "ekranGlowny()", tytul: t.nazwa })}
    <div class="stos">
      <div class="karta srodek">
        <div class="duza-ikona">🏆</div>
        <h2 style="font-size:28px">Brawo, odkrywcy!</h2>
        <p style="margin-top:8px">Ukończyliście trasę <b>${esc(t.nazwa)}</b>.</p>
        ${p.start && p.koniec ? `<p class="maly" style="margin-top:4px">Czas wyprawy: ${ladnyCzas(p.koniec - p.start)}</p>` : ""}
      </div>
      <div class="karta"><div class="etykieta" style="margin-bottom:12px">Wasze trofea</div><div class="siatka">${trofea}</div></div>
      <button class="btn magenta" onclick="ekranGlowny()">Wybierz kolejną trasę</button>
    </div>`;
  konfetti(150);
  window.scrollTo(0, 0);
}

function konfetti(ile) {
  const kolory = ["#C2185B", "#F57C00", "#2E7D32", "#F5B700", "#1E88E5"];
  const box = document.createElement("div");
  box.className = "konfetti";
  for (let i = 0; i < ile; i++) {
    const k = document.createElement("i");
    k.style.left = Math.random() * 100 + "vw";
    k.style.background = kolory[i % kolory.length];
    k.style.animationDuration = 1.6 + Math.random() * 1.8 + "s";
    k.style.animationDelay = Math.random() * 0.5 + "s";
    box.appendChild(k);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4500);
}

/* ---------- 7. Trofea ---------- */

function ekranTrofeow() {
  wyczyscAdres();
  const sekcje = TRASY.map((t) => {
    const p = postepTrasy(t.id);
    const kafelki = t.etapy.map((e) => {
      const ma = p.zdobyte.includes(e.punkt);
      return `<div class="trofeum ${ma ? "" : "brak"}"><div class="m">${ma ? esc(e.trofeum?.ikona || "🏅") : "?"}</div>
        <div class="n">${ma ? esc(e.trofeum?.nazwa || "") : "Do odkrycia"}</div></div>`;
    }).join("");
    return `<div class="karta"><div class="etykieta" style="margin-bottom:12px">${esc(t.nazwa)} · ${p.zdobyte.length}/${t.etapy.length}</div><div class="siatka">${kafelki}</div></div>`;
  }).join("");
  app.innerHTML = `${gora({ wstecz: "ekranGlowny()", tytul: "Moje trofea" })}<div class="stos">${sekcje}</div>`;
  window.scrollTo(0, 0);
}

/* ---------- 8. Ustawienia, tryb testowy i tryb twórcy ---------- */

function ekranUstawien() {
  wyczyscAdres();
  app.innerHTML = `${gora({ wstecz: "ekranGlowny()", tytul: "Ustawienia" })}
    <div class="stos">
      <div class="karta">
        <label class="przelacznik"><div class="opis"><b>🧪 Tryb testowy</b><p class="maly">Punkty zaliczają się bez sprawdzania GPS. Na liście punktów pojawiają się przyciski „Udawaj skan”.</p></div>
          <input type="checkbox" ${stan.test ? "checked" : ""} onchange="stan.test=this.checked;zapisz();ekranUstawien()"></label>
        <label class="przelacznik"><div class="opis"><b>🛠 Tryb twórcy</b><p class="maly">Pokazuje Twoje współrzędne GPS, żeby wpisać je do pliku dane.js.</p></div>
          <input type="checkbox" ${stan.tworca ? "checked" : ""} onchange="stan.tworca=this.checked;zapisz();ekranUstawien()"></label>
      </div>
      ${stan.tworca ? panelTworcy(null) : ""}
      <button class="btn jasny" onclick="if(confirmReset(event))ekranGlowny()">🗑 Wyczyść wszystkie postępy</button>
      <p class="maly srodek">ORIENT! · wersja 1</p>
    </div>`;
}

function confirmReset(event) {
  // Bez okienek systemowych: drugi klik w ciągu 3 s potwierdza.
  if (confirmReset.uzbrojony) { stan.trasy = {}; stan.aktywnaTrasa = null; zapisz(); confirmReset.uzbrojony = false; return true; }
  confirmReset.uzbrojony = true;
  const b = event.target; b.textContent = "Kliknij jeszcze raz, żeby potwierdzić";
  setTimeout(() => { confirmReset.uzbrojony = false; if (b.isConnected) b.textContent = "🗑 Wyczyść wszystkie postępy"; }, 3000);
  return false;
}

function panelTworcy(kod) {
  return `<div class="karta tworca stos">
    <div class="etykieta">🛠 Tryb twórcy${kod ? " · punkt " + esc(kod) : ""}</div>
    <p class="maly">Stań dokładnie przy słupku i naciśnij przycisk. Skopiuj wynik do pliku dane.js.</p>
    <div class="wspolrzedne" id="wsp">—</div>
    <button class="btn" onclick="zmierzWspolrzedne('${esc(kod || "")}')">📍 Zmierz moją pozycję</button>
  </div>`;
}

async function zmierzWspolrzedne(kod) {
  const pole = document.getElementById("wsp");
  pole.textContent = "Mierzę…";
  try {
    const poz = await pobierzPozycje();
    const lat = poz.coords.latitude.toFixed(6), lng = poz.coords.longitude.toFixed(6);
    let tekst = `lat: ${lat}, lng: ${lng},`;
    let extra = `\n(dokładność ±${Math.round(poz.coords.accuracy)} m)`;
    if (kod && PUNKTY[kod]) extra += `\nOdległość od zapisanego punktu: ${ladnyDystans(odleglosc(lat, lng, PUNKTY[kod].lat, PUNKTY[kod].lng))}`;
    pole.innerText = tekst + extra;
    try { await navigator.clipboard.writeText(tekst); pole.innerText += "\n✓ Skopiowano do schowka"; } catch (e) {}
  } catch (e) {
    pole.innerHTML = tekstBleduLokalizacji(e);
  }
}

/* ---------- 9. Start: co otworzyć? ---------- */

(function start() {
  const q = new URLSearchParams(location.search);
  if (q.has("test")) { stan.test = q.get("test") !== "0"; zapisz(); }
  if (q.has("tworca")) { stan.tworca = q.get("tworca") !== "0"; zapisz(); }
  if (q.get("p")) return ekranPunktu(q.get("p"));
  if (q.get("trasa")) return ekranTrasy(q.get("trasa"));
  ekranGlowny();
})();
