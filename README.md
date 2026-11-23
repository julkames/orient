# ORIENT! – wersja 1

Aplikacja działa w przeglądarce telefonu. Nic nie trzeba instalować.
Tag NFC (albo kod QR) na tabliczce zawiera link, np. `.../orient/?p=A1`.
Po przyłożeniu telefonu otwiera się strona punktu. Aplikacja sprawdza GPS,
pokazuje ciekawostkę i zagadkę, a potem przyznaje trofeum.

## Pliki

| Plik | Co to jest | Czy zmieniasz? |
|---|---|---|
| `dane.js` | punkty, trasy, ciekawostki, pytania, trofea | **TAK**, tu jest cała treść |
| `app.js` | kod aplikacji | nie |
| `index.html` | wygląd (kolory, układ) | rzadko |
| `lib/leaflet/` | biblioteka do mapy | nie |

---

## 1. Publikacja w internecie (GitHub Pages, za darmo)

1. Rozpakuj plik `orient.zip` na komputerze.
2. Wejdź na github.com → zielony przycisk **New** (nowe repozytorium).
   - Nazwa: `orient`
   - Zaznacz **Public**
   - Kliknij **Create repository**.
3. Na stronie nowego repozytorium kliknij link **uploading an existing file**.
4. Przeciągnij do okna **całą zawartość** rozpakowanego folderu:
   `index.html`, `app.js`, `dane.js`, `README.md` i folder `lib`.
5. Na dole kliknij **Commit changes**.
6. Wejdź w **Settings** → po lewej **Pages**.
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)** → **Save**
7. Po 1–2 minutach aplikacja będzie pod adresem:
   **`https://TWÓJ-LOGIN.github.io/orient/`**

Otwórz ten adres w Safari na iPhonie. Możesz go dodać do ekranu głównego:
przycisk Udostępnij → „Do ekranu początkowego”.

## 2. Testowanie w domu (bez chodzenia do słupków)

Otwórz: `https://TWÓJ-LOGIN.github.io/orient/?test=1`

Włącza się **tryb testowy**: GPS nie jest sprawdzany, a przy punktach
pojawiają się przyciski „Udawaj skan”. Ten tryb wyłączysz w **Ustawieniach**.

## 3. Zmiana treści (ciekawostki, pytania, trasy)

1. Na GitHubie otwórz plik `dane.js` → ikonka ołówka (Edit).
2. Zmień tekst w cudzysłowach.
3. **Commit changes** → po ok. minucie odśwież stronę na telefonie.

Wskazówki:
- Ciekawostka należy do **miejsca** (sekcja `PUNKTY`), więc pokazuje się na każdej trasie przez ten punkt.
- Pytanie i trofeum należą do **trasy** (sekcja `TRASY`), więc ten sam punkt może mieć na różnych trasach inne zagadki.
- W pytaniu `poprawna: 0` oznacza pierwszą odpowiedź, `1` drugą, `2` trzecią.
- Jeśli po zmianie zobaczysz pusty ekran, prawdopodobnie brakuje cudzysłowu lub przecinka. Porównaj z innym punktem.

## 4. Prawdziwe współrzędne punktów (tryb twórcy)

Obecne współrzędne w `dane.js` są **przykładowe** (oznaczone ⚠️).

1. Otwórz `https://TWÓJ-LOGIN.github.io/orient/?tworca=1`.
2. Stań przy miejscu, gdzie będzie słupek → **Ustawienia** → **Zmierz moją pozycję**.
3. Wynik (np. `lat: 51.148012, lng: 15.031077,`) kopiuje się do schowka.
   Wklej go do `dane.js` w miejsce przykładowych liczb.
4. Mierz w kilku miejscach i patrz na „dokładność”. Pod drzewami GPS bywa słabszy.

## 5. Zapis tagów NFC na iPhonie

1. Kup naklejki NFC typu **NTAG213** lub **NTAG215**. Na metalowe słupki potrzebna jest wersja **on-metal**.
2. Zainstaluj na iPhonie darmową aplikację **NFC Tools**.
3. **Write** → **Add a record** → **URL / URI** → wpisz:
   `https://TWÓJ-LOGIN.github.io/orient/?p=A1`
   (A1 = kod punktu z pliku `dane.js`)
4. **Write** → przyłóż górną krawędź iPhone'a do naklejki.
5. Sprawdź: zablokuj i odblokuj telefon, przyłóż go do tagu. Powinno pojawić się powiadomienie z linkiem.

Opcja „Lock tag” w NFC Tools chroni tag przed nadpisaniem przez obcą osobę,
ale jest **nieodwracalna**. Używaj jej dopiero, gdy link jest ostateczny.

**Kod QR (zapasowy):** wygeneruj go w dowolnym darmowym generatorze QR
z tym samym linkiem i wydrukuj na tabliczce.

---

## Co już działa (wersja 1)

- lista tras z paskiem postępu
- mapa trasy z punktami w stylu mapy do orientacji (kółka)
- trasy „po kolei” i „w dowolnej kolejności”
- sprawdzanie, czy telefon jest przy słupku (GPS, promień w `USTAWIENIA`)
- ciekawostka, zagadka z odpowiedziami, trofeum z konfetti
- ekran ukończenia trasy z czasem, kolekcja trofeów
- jeden punkt na wielu trasach
- tryb testowy i tryb twórcy
- postępy zapisują się w telefonie, bez kont i bez zbierania danych osobowych

## Pomysły na kolejne wersje

- wyłączenie trybu testowego w wersji publicznej, żeby dzieci go nie włączały
- zdjęcia przy ciekawostkach
- wersja niemiecka (Görlitz!)
- anonimowe statystyki dla miasta (ile osób przeszło trasę)
- baza danych (Supabase) zamiast pliku `dane.js`
