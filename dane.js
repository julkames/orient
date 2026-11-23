/* =====================================================================
   ORIENT! – PLIK Z TREŚCIAMI
   ---------------------------------------------------------------------
   To jedyny plik, który musisz zmieniać, żeby dodać punkty, trasy,
   ciekawostki i pytania. Kodu aplikacji (app.js) nie trzeba ruszać.

   Zasady:
   - Tekst zawsze w cudzysłowie: "tak jak tutaj".
   - Po każdym elemencie przecinek (oprócz ostatniego w nawiasie
     — ale nadmiarowy przecinek też nie szkodzi).
   - Współrzędne (lat, lng) sprawdzisz w terenie w "trybie twórcy"
     (instrukcja w README).
   ===================================================================== */

const USTAWIENIA = {
  nazwaAplikacji: "ORIENT!",
  haslo: "Zamień spacer w przygodę",
  // Jak blisko słupka (w metrach) trzeba stać, żeby punkt się zaliczył:
  promienMetry: 60,
};

/* ---------------------------------------------------------------------
   PUNKTY – fizyczne tabliczki w terenie.
   Kod punktu (np. "A1") to to, co zapiszesz w tagu NFC i kodzie QR.
   Ciekawostka jest przypisana do miejsca, więc pokazuje się
   na każdej trasie, która przez ten punkt przechodzi.
   --------------------------------------------------------------------- */
const PUNKTY = {
  A1: {
    nazwa: "Stara sosna",
    lat: 51.1480, lng: 15.0310,      // ⚠️ PRZYKŁADOWE – podmień na prawdziwe
    ikona: "🌲",
    ciekawostka:
      "Szyszka sosny dojrzewa aż dwa lata! Kiedy jest gotowa, w suchy i ciepły dzień sama otwiera łuski i wypuszcza nasiona ze skrzydełkami.",
  },
  A2: {
    nazwa: "Kładka nad rzeką",
    lat: 51.1488, lng: 15.0332,      // ⚠️ PRZYKŁADOWE
    ikona: "🦫",
    ciekawostka:
      "Bóbr ma pomarańczowe zęby. To nie brud – w ich szkliwie jest żelazo, dzięki któremu są twarde jak dłuto i dają radę nawet grubym pniom.",
  },
  A3: {
    nazwa: "Brzeg zalewu",
    lat: 51.1495, lng: 15.0360,      // ⚠️ PRZYKŁADOWE
    ikona: "🪰",
    ciekawostka:
      "Ważka ma cztery skrzydła i każdym porusza osobno. Dzięki temu potrafi zawisnąć w powietrzu, a nawet lecieć do tyłu. Widzi też prawie wszystko dookoła siebie!",
  },
  A4: {
    nazwa: "Dziupla",
    lat: 51.1478, lng: 15.0375,      // ⚠️ PRZYKŁADOWE
    ikona: "🪶",
    ciekawostka:
      "Dzięcioł stuka w drzewo nawet 20 razy na sekundę. Jego bardzo długi język, kiedy jest schowany, owija się dookoła czaszki jak szalik.",
  },
  A5: {
    nazwa: "Ruiny (przykład)",
    lat: 51.1470, lng: 15.0345,      // ⚠️ PRZYKŁADOWE
    ikona: "🏰",
    // ⚠️ To tylko wzór, jak może wyglądać punkt historyczny.
    //    Wpisz tu prawdziwą, sprawdzoną historię miejsca.
    ciekawostka:
      "[WPISZ PRAWDZIWĄ HISTORIĘ] Kiedyś stał tu… Zobacz, czy znajdziesz ślady dawnych murów – kamienie ułożone w prostą linię to wskazówka!",
  },
};

/* ---------------------------------------------------------------------
   TRASY – ułożone z punktów powyżej. Jeden punkt może być na wielu
   trasach (każda trasa może mieć własne pytanie i trofeum).
   - kolejnosc: true  → punkty trzeba zaliczać po kolei
                false → w dowolnej kolejności
   - wskazowka → podpowiedź, jak dojść do TEGO punktu
   - pytanie   → opcjonalne; "poprawna" to numer odpowiedzi liczony od 0
   --------------------------------------------------------------------- */
const TRASY = [
  {
    id: "tajemnice-zalewu",
    nazwa: "Tajemnice Zalewu",
    opis: "Rodzinna wyprawa dookoła zalewu. Odkryjcie, kto mieszka nad wodą i w lesie!",
    dlugosc: "2 km",
    czas: "ok. 1 h",
    wiek: "6–10 lat",
    kolor: "#C2185B",
    kolejnosc: true,
    etapy: [
      {
        punkt: "A1",
        wskazowka: "Start! Szukajcie najwyższego drzewa przy wejściu na ścieżkę.",
        pytanie: {
          tresc: "Ile lat dojrzewa szyszka sosny?",
          odpowiedzi: ["Pół roku", "Dwa lata", "Dziesięć lat"],
          poprawna: 1,
        },
        trofeum: { ikona: "🌰", nazwa: "Strażnik Szyszek" },
      },
      {
        punkt: "A2",
        wskazowka: "Idźcie w stronę wody, aż usłyszycie szum rzeki pod drewnianą kładką.",
        pytanie: {
          tresc: "Dlaczego bóbr ma pomarańczowe zęby?",
          odpowiedzi: ["Je dużo marchewek", "Ma w nich żelazo", "Nie myje zębów"],
          poprawna: 1,
        },
        trofeum: { ikona: "🦫", nazwa: "Przyjaciel Bobra" },
      },
      {
        punkt: "A3",
        wskazowka: "Przejdźcie kładką i skręćcie wzdłuż brzegu. Wypatrujcie ważek nad wodą!",
        pytanie: {
          tresc: "Co potrafi ważka?",
          odpowiedzi: ["Lecieć do tyłu", "Pływać pod wodą", "Śpiewać"],
          poprawna: 0,
        },
        trofeum: { ikona: "✨", nazwa: "Łowca Ważek" },
      },
      {
        punkt: "A4",
        wskazowka: "Wsłuchajcie się – może usłyszycie stukanie? Szukajcie drzewa z dziurą.",
        trofeum: { ikona: "🪵", nazwa: "Tropiciel Dzięciołów" },
      },
      {
        punkt: "A5",
        wskazowka: "Ostatni punkt! Wracajcie ścieżką w stronę starych kamieni.",
        trofeum: { ikona: "🗝️", nazwa: "Odkrywca Ruin" },
      },
    ],
  },
  {
    id: "mala-petla",
    nazwa: "Mała pętla dla maluchów",
    opis: "Krótka trasa na 20 minut – idealna dla najmłodszych odkrywców.",
    dlugosc: "700 m",
    czas: "ok. 20 min",
    wiek: "3–6 lat",
    kolor: "#2E7D32",
    kolejnosc: false,
    etapy: [
      {
        punkt: "A1",
        wskazowka: "Znajdź wielkie drzewo przy wejściu.",
        pytanie: {
          tresc: "Z czego wyrastają nowe sosny?",
          odpowiedzi: ["Z nasion z szyszek", "Z kamieni", "Z liści dębu"],
          poprawna: 0,
        },
        trofeum: { ikona: "🌱", nazwa: "Mały Leśnik" },
      },
      {
        punkt: "A2",
        wskazowka: "Idź do drewnianej kładki nad rzeką.",
        trofeum: { ikona: "🌊", nazwa: "Mistrz Kładki" },
      },
      {
        punkt: "A5",
        wskazowka: "Poszukaj starych kamieni.",
        trofeum: { ikona: "👑", nazwa: "Mały Rycerz" },
      },
    ],
  },
];
