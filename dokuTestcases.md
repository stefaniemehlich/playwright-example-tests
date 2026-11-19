# Testfälle

Automatisch erzeugt am 19.11.2026 mit `npm run writeDokuTestcases` – nicht von Hand bearbeiten.

299 Testfälle, davon 0 ohne erwartetes Ergebnis.

<a id="uebersicht"></a>

## Übersicht

- [Tests der CTA-Buttons (cta-float.spec.ts)](#cta-float-spec-ts) (10)
  - [CTA-Buttons - Desktop (821 px)](#cta-float-spec-ts--cta-buttons-desktop-821-px) (5)
  - [CTA-Buttons - Smartphone (320 px)](#cta-float-spec-ts--cta-buttons-smartphone-320-px) (5)
- [Tests des Schaden-Formulars (damage-form.spec.ts)](#damage-form-spec-ts) (223)
  - [Schaden-Formular: Werte validieren](#damage-form-spec-ts--schaden-formular-werte-validieren) (156)
  - [Schaden-Formular: Anzeigen im Formular](#damage-form-spec-ts--schaden-formular-anzeigen-im-formular) (22)
  - [Schaden-Formular: Absenden](#damage-form-spec-ts--schaden-formular-absenden) (18)
  - [Schaden-Formular: Werte ändern](#damage-form-spec-ts--schaden-formular-werte-aendern) (13)
  - [Schaden-Formular: Danke-Ansicht schließen](#damage-form-spec-ts--schaden-formular-danke-ansicht-schliessen) (7)
  - [Schaden-Formular: Overlay schließen](#damage-form-spec-ts--schaden-formular-overlay-schliessen) (7)
- [Tests der FAQ (faq.spec.ts)](#faq-spec-ts) (14)
  - [FAQ - allgemein](#faq-spec-ts--faq-allgemein) (2)
  - [FAQ - Desktop (821 px)](#faq-spec-ts--faq-desktop-821-px) (7)
  - [FAQ - Smartphone (320 px)](#faq-spec-ts--faq-smartphone-320-px) (5)
- [Tests des Footers (footer.spec.ts)](#footer-spec-ts) (4)
- [Tests der Galerie (gallery.spec.ts)](#gallery-spec-ts) (4)
  - [Galerie: Inhalt](#gallery-spec-ts--galerie-inhalt) (1)
- [Tests der Startseite (homepage.spec.ts)](#homepage-spec-ts) (6)
- [Tests der Bilder (images.spec.ts)](#images-spec-ts) (5)
- [Tests der Social-Icons in der Navbar (navbar-socialicons.spec.ts)](#navbar-socialicons-spec-ts) (3)
- [Tests der Navbar (navbar.spec.ts)](#navbar-spec-ts) (5)
- [Tests der Bewertungen (reviews.spec.ts)](#reviews-spec-ts) (13)
  - [Bewertungen: Inhalt](#reviews-spec-ts--bewertungen-inhalt) (2)
- [SEO-Tests (seo.spec.ts)](#seo-spec-ts) (7)
- [Tests der Leistungen (services.spec.ts)](#services-spec-ts) (5)

<a id="cta-float-spec-ts"></a>

## Tests der CTA-Buttons (cta-float.spec.ts) (10)

[↑ Übersicht](#uebersicht)

<details id="cta-float-spec-ts--cta-buttons-desktop-821-px" open>
<summary><b>CTA-Buttons - Desktop (821 px)</b> (5)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Buttons sichtbar &amp; klickbar</td><td>Beide Buttons vollständig im Bild und nicht verdeckt – am Seitenanfang, in jeder Section und am Seitenende</td></tr>
<tr><td>Buttons bleiben beim Scrollen am selben Platz</td><td>Abstand zum unteren Bildrand ist gleich, solange der Footer nicht sichtbar ist</td></tr>
<tr><td>Buttons verdecken am Seitenende den Footer nicht</td><td>Buttons rutschen nach oben und liegen vollständig oberhalb des Footers</td></tr>
<tr><td>WhatsApp-Button öffnet WhatsApp in neuem Tab</td><td>Neuer Tab öffnet https://wa.me/4917612345678 (Link mit target="_blank" und rel="noopener")</td></tr>
<tr><td>Schaden-checken-Button öffnet das Overlay</td><td>Overlay ist geöffnet, Überschrift „Schaden checken“ sichtbar</td></tr>
</table>

</details>

<details id="cta-float-spec-ts--cta-buttons-smartphone-320-px" open>
<summary><b>CTA-Buttons - Smartphone (320 px)</b> (5)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Buttons sichtbar &amp; klickbar</td><td>Beide Buttons vollständig im Bild und nicht verdeckt – am Seitenanfang, in jeder Section und am Seitenende</td></tr>
<tr><td>Buttons bleiben beim Scrollen am selben Platz</td><td>Abstand zum unteren Bildrand ist gleich, solange der Footer nicht sichtbar ist</td></tr>
<tr><td>Buttons verdecken am Seitenende den Footer nicht</td><td>Buttons rutschen nach oben und liegen vollständig oberhalb des Footers</td></tr>
<tr><td>WhatsApp-Button öffnet WhatsApp in neuem Tab</td><td>Neuer Tab öffnet https://wa.me/4917612345678 (Link mit target="_blank" und rel="noopener")</td></tr>
<tr><td>Schaden-checken-Button öffnet das Overlay</td><td>Overlay ist geöffnet, Überschrift „Schaden checken“ sichtbar</td></tr>
</table>

</details>

<a id="damage-form-spec-ts"></a>

## Tests des Schaden-Formulars (damage-form.spec.ts) (223)

[↑ Übersicht](#uebersicht)

<details id="damage-form-spec-ts--schaden-formular-werte-validieren" open>
<summary><b>Schaden-Formular: Werte validieren</b> (156)</summary>

<dl><dd>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--vorname" open>
<summary><b>Vorname</b> (24)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Vorname: genau 2 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: genau 50 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Umlaute</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Akzente</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Akzent aus zwei Zeichen wird zu einem (e + Trema, z. B. beim Einfügen)</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „Zoë“</td></tr>
<tr><td>Vorname: andere Schrift</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Bindestrich zwischen Buchstaben</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Leerzeichen zwischen Buchstaben</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: mehrere Bindestriche</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Bindestrich und Leerzeichen gemischt</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Apostroph</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: typografischer Apostroph</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Vorname: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „Anna“</td></tr>
<tr><td>Vorname: 51 Zeichen werden abgeschnitten</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach 50 Zeichen</td></tr>
<tr><td>Vorname: leer (Pflichtfeld)</td><td>Meldung „Bitte geben Sie Ihren Vornamen ein.“, Feld rot markiert</td></tr>
<tr><td>Vorname: nur Leerzeichen</td><td>Meldung „Bitte geben Sie Ihren Vornamen ein.“, Feld rot markiert</td></tr>
<tr><td>Vorname: 1 Zeichen</td><td>Meldung „Bitte mindestens 2 Zeichen eingeben.“, Feld rot markiert</td></tr>
<tr><td>Vorname: Ziffer</td><td>Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Vorname: Sonderzeichen</td><td>Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Vorname: Bindestrich am Anfang</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Vorname: Bindestrich am Ende</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Vorname: doppelter Bindestrich</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Vorname: doppeltes Leerzeichen innen</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Vorname: Bindestrich direkt neben Leerzeichen</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--nachname" open>
<summary><b>Nachname</b> (24)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Nachname: genau 2 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: genau 50 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Umlaute</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Akzente</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Akzent aus zwei Zeichen wird zu einem (e + Trema, z. B. beim Einfügen)</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „Brontë“</td></tr>
<tr><td>Nachname: andere Schrift</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Bindestrich zwischen Buchstaben</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Leerzeichen zwischen Buchstaben</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: mehrere Leerzeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Bindestrich und Leerzeichen gemischt</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Apostroph</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: typografischer Apostroph</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Nachname: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „Kunde“</td></tr>
<tr><td>Nachname: 51 Zeichen werden abgeschnitten</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach 50 Zeichen</td></tr>
<tr><td>Nachname: leer (Pflichtfeld)</td><td>Meldung „Bitte geben Sie Ihren Nachnamen ein.“, Feld rot markiert</td></tr>
<tr><td>Nachname: nur Leerzeichen</td><td>Meldung „Bitte geben Sie Ihren Nachnamen ein.“, Feld rot markiert</td></tr>
<tr><td>Nachname: 1 Zeichen</td><td>Meldung „Bitte mindestens 2 Zeichen eingeben.“, Feld rot markiert</td></tr>
<tr><td>Nachname: Ziffer</td><td>Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Nachname: Sonderzeichen</td><td>Meldung „Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Nachname: Bindestrich am Anfang</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Nachname: Bindestrich am Ende</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Nachname: doppelter Bindestrich</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Nachname: doppeltes Leerzeichen innen</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
<tr><td>Nachname: Leerzeichen direkt neben Bindestrich</td><td>Meldung „Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.“, Feld rot markiert</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--telefon" open>
<summary><b>Telefon</b> (20)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Telefon: beginnend mit +49</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: beginnend mit 0</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: Schrägstrich</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: Bindestrich</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: Vorwahl in Klammern</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: +49 mit (0)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: genau 6 Ziffern</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: genau 15 Ziffern</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: genau 15 Ziffern mit allen erlaubten Trennzeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Telefon: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „0176 123456“</td></tr>
<tr><td>Telefon: leer (Pflichtfeld)</td><td>Meldung „Bitte geben Sie Ihre Telefonnummer ein.“, Feld rot markiert</td></tr>
<tr><td>Telefon: nur Leerzeichen</td><td>Meldung „Bitte geben Sie Ihre Telefonnummer ein.“, Feld rot markiert</td></tr>
<tr><td>Telefon: Buchstaben</td><td>Meldung „Nur Ziffern, Leerzeichen und + - / ( ) sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Telefon: Punkt</td><td>Meldung „Nur Ziffern, Leerzeichen und + - / ( ) sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Telefon: + in der Mitte</td><td>Meldung „Ein +-Zeichen ist nur führend erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Telefon: doppeltes +</td><td>Meldung „Ein +-Zeichen ist nur führend erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Telefon: ohne Vorwahl</td><td>Meldung „Bitte mit Vorwahl eingeben (beginnend mit 0 oder +).“, Feld rot markiert</td></tr>
<tr><td>Telefon: 5 Ziffern</td><td>Meldung „Die Nummer ist zu kurz (mind. 6 Ziffern).“, Feld rot markiert</td></tr>
<tr><td>Telefon: 16 Ziffern</td><td>Meldung „Die Nummer ist zu lang (höchstens 15 Ziffern).“, Feld rot markiert</td></tr>
<tr><td>Telefon: 16 Ziffern mit allen erlaubten Trennzeichen</td><td>Meldung „Die Nummer ist zu lang (höchstens 15 Ziffern).“, Feld rot markiert</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--mail" open>
<summary><b>Mail</b> (26)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Mail: leer (optionales Feld)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: nur Leerzeichen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld ist danach leer</td></tr>
<tr><td>Mail: einfache Adresse</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: Punkt, Plus und Subdomain</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: kürzeste Endung (2 Zeichen)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: Großbuchstaben</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: Bindestrich und Ziffern in der Domain</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: Umlaut in der Domain (Chromium)</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „name@xn--mller-kva.de“</td></tr>
<tr><td>Mail: genau 254 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: Teil der Domain mit genau 63 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mail: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „name@beispiel.de“</td></tr>
<tr><td>Mail: ohne @</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: ohne Endung</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Endung nur 1 Zeichen</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: ohne Namen vor @</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: doppeltes @</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Leerzeichen innen</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: doppelter Punkt in der Domain</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Domain beginnt mit Bindestrich</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Domain endet mit Bindestrich</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Umlaut vor @</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Umlaut in der Domain (Firefox, WebKit)</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Endung aus Ziffern</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Teil der Domain mit 64 Zeichen</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: Endung mit 64 Buchstaben</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert</td></tr>
<tr><td>Mail: 255 Zeichen werden abgeschnitten</td><td>Meldung „Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.“, Feld rot markiert; Feld enthält danach 254 Zeichen</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--strasse" open>
<summary><b>Straße</b> (13)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Straße: leer (optionales Feld)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Straße: nur Leerzeichen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld ist danach leer</td></tr>
<tr><td>Straße: Straße mit Hausnummer</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Straße: Abkürzung mit Punkt und Buchstabe an Hausnummer</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Straße: Schrägstrich</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Straße: Bindestriche</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Straße: genau 100 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Straße: 101 Zeichen werden abgeschnitten</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach 100 Zeichen</td></tr>
<tr><td>Straße: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „Musterstraße 1“</td></tr>
<tr><td>Straße: Komma</td><td>Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Straße: Raute</td><td>Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Straße: Klammern</td><td>Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Straße: Apostroph</td><td>Meldung „Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.“, Feld rot markiert</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--plz" open>
<summary><b>PLZ</b> (11)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>PLZ: leer (optionales Feld)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>PLZ: nur Leerzeichen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld ist danach leer</td></tr>
<tr><td>PLZ: 5 Ziffern (Deutschland)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>PLZ: 4 Ziffern (Österreich, Schweiz)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>PLZ: führende Null</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>PLZ: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „04109“</td></tr>
<tr><td>PLZ: 3 Ziffern</td><td>Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert</td></tr>
<tr><td>PLZ: 6 Ziffern</td><td>Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert</td></tr>
<tr><td>PLZ: Buchstabe</td><td>Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert</td></tr>
<tr><td>PLZ: Leerzeichen dazwischen</td><td>Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert</td></tr>
<tr><td>PLZ: Minuszeichen</td><td>Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--ort" open>
<summary><b>Ort</b> (17)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Ort: leer (optionales Feld)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: nur Leerzeichen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld ist danach leer</td></tr>
<tr><td>Ort: genau 2 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: Umlaute</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: Bindestrich</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: Klammern</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: Punkt</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: Apostroph</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: typografischer Apostroph</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: genau 50 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Ort: 51 Zeichen werden abgeschnitten</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach 50 Zeichen</td></tr>
<tr><td>Ort: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „Graz“</td></tr>
<tr><td>Ort: 1 Zeichen</td><td>Meldung „Bitte mindestens 2 Zeichen eingeben.“, Feld rot markiert</td></tr>
<tr><td>Ort: Ziffer</td><td>Meldung „Nur Buchstaben, Leerzeichen und . - ' ( ) sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Ort: Schrägstrich</td><td>Meldung „Nur Buchstaben, Leerzeichen und . - ' ( ) sind erlaubt.“, Feld rot markiert</td></tr>
<tr><td>Ort: Bindestrich am Anfang</td><td>Meldung „Der Ort muss mit einem Buchstaben beginnen.“, Feld rot markiert</td></tr>
<tr><td>Ort: Klammer am Anfang</td><td>Meldung „Der Ort muss mit einem Buchstaben beginnen.“, Feld rot markiert</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--mitteilung" open>
<summary><b>Mitteilung</b> (9)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Mitteilung: leer (optionales Feld)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mitteilung: nur Leerzeichen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld ist danach leer</td></tr>
<tr><td>Mitteilung: kurzer Text</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mitteilung: mehrere Zeilen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mitteilung: Sonderzeichen und Emoji</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mitteilung: Link (z. B. zu weiteren Fotos)</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mitteilung: genau 1000 Zeichen</td><td>keine Meldung, Feld nicht rot markiert</td></tr>
<tr><td>Mitteilung: 1001 Zeichen werden abgeschnitten</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach 1000 Zeichen</td></tr>
<tr><td>Mitteilung: Leerzeichen außen werden entfernt</td><td>keine Meldung, Feld nicht rot markiert; Feld enthält danach „Delle“</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-validieren--upload" open>
<summary><b>Upload</b> (12)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Upload: ein JPG</td><td>keine Meldung, Upload-Bereich nicht rot markiert</td></tr>
<tr><td>Upload: ein PNG</td><td>keine Meldung, Upload-Bereich nicht rot markiert</td></tr>
<tr><td>Upload: ein Video</td><td>keine Meldung, Upload-Bereich nicht rot markiert</td></tr>
<tr><td>Upload: Bild und Video</td><td>keine Meldung, Upload-Bereich nicht rot markiert</td></tr>
<tr><td>Upload: genau 10 Dateien</td><td>keine Meldung, Upload-Bereich nicht rot markiert</td></tr>
<tr><td>Upload: Datei genau 20 MB</td><td>keine Meldung, Upload-Bereich nicht rot markiert</td></tr>
<tr><td>Upload: zusammen genau 50 MB</td><td>keine Meldung, Upload-Bereich nicht rot markiert</td></tr>
<tr><td>Upload: 11 Dateien</td><td>Meldung „Bitte höchstens 10 Dateien auswählen.“, Upload-Bereich rot markiert</td></tr>
<tr><td>Upload: PDF</td><td>Meldung „„dokument.pdf“ ist kein Bild oder Video.“, Upload-Bereich rot markiert</td></tr>
<tr><td>Upload: Bild und PDF</td><td>Meldung „„dokument.pdf“ ist kein Bild oder Video.“, Upload-Bereich rot markiert</td></tr>
<tr><td>Upload: Datei 20 MB + 1 Byte</td><td>Meldung „„zu-gross.jpg“ ist größer als 20 MB.“, Upload-Bereich rot markiert</td></tr>
<tr><td>Upload: Dateien zusammen 50 MB + 1 Byte</td><td>Meldung „Alle Dateien zusammen dürfen höchstens 50 MB groß sein.“, Upload-Bereich rot markiert</td></tr>
</table>

</details>

</dd></dl>

</details>

<details id="damage-form-spec-ts--schaden-formular-anzeigen-im-formular" open>
<summary><b>Schaden-Formular: Anzeigen im Formular</b> (22)</summary>

<dl><dd>

<details id="damage-form-spec-ts--schaden-formular-anzeigen-im-formular--hinweismeldungen-bei-falscheingaben" open>
<summary><b>Hinweismeldungen bei Falscheingaben</b> (3)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Beim ersten Tippen keine Meldung, erst nach dem Verlassen des Feldes (PLZ)</td><td>Während der Eingabe von „123“ keine Meldung und keine rote Markierung; nach dem Verlassen des Feldes Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert</td></tr>
<tr><td>Nach dem ersten Verlassen des Feldes wird die Meldung bei jedem Tastendruck neu geprüft (PLZ)</td><td>Nach dem Verlassen des Feldes mit „123“ steht die Meldung da; beim Weitertippen verschwindet sie bei „1234“, bei „12345“ wird weiter nichts angezeigt, erscheint bei „123456“ sofort wieder und verschwindet nach dem Löschen der letzten Ziffer – jeweils ohne das Feld erneut zu verlassen</td></tr>
<tr><td>Meldung wechselt bei neuer/ anderer Falscheingabe (Telefon)</td><td>Nach dem Verlassen des Feldes mit „+(123)45“ steht „Die Nummer ist zu kurz (mind. 6 Ziffern).“; beim Tippen von „+“ wechselt sie direkt zu „Ein +-Zeichen ist nur führend erlaubt.“, nach dem Löschen des „+“ wieder zurück – jeweils ohne das Feld erneut zu verlassen</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-anzeigen-im-formular--umrandung-des-aktiven-feldes" open>
<summary><b>Umrandung des aktiven Feldes</b> (9)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Vorname: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>Nachname: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>Telefon: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>Mail: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>Straße: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>PLZ: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>Ort: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>Mitteilung: aktives Feld ist grün umrandet</td><td>Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher</td></tr>
<tr><td>Vorname: fehlerhaftes Feld bleibt rot, auch wenn es aktiv ist</td><td>Nach ungültiger Eingabe und Verlassen ist der Rahmen rot; nach erneutem Klick ins Feld bleibt er rot statt grün</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-anzeigen-im-formular--zeichenzaehler-mitteilung" open>
<summary><b>Zeichenzähler Mitteilung</b> (6)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Kurzer Text</td><td>Zähler zeigt vor der Eingabe „0 / 1000“, danach „5 / 1000“</td></tr>
<tr><td>Mehrere Zeilen (Zeilenumbruch zählt als 1 Zeichen)</td><td>Zähler zeigt vor der Eingabe „0 / 1000“, danach „15 / 1000“</td></tr>
<tr><td>Genau 1000 Zeichen</td><td>Zähler zeigt vor der Eingabe „0 / 1000“, danach „1000 / 1000“</td></tr>
<tr><td>1001 Zeichen werden abgeschnitten</td><td>Zähler zeigt vor der Eingabe „0 / 1000“, danach „1000 / 1000“</td></tr>
<tr><td>Nach dem Löschen des Textes</td><td>Zähler geht nach dem Löschen zurück auf „0 / 1000“</td></tr>
<tr><td>Nach dem Entfernen der Leerzeichen außen</td><td>Nach dem Verlassen des Feldes zählt der Zähler nur noch den gekürzten Text: „5 / 1000“</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-anzeigen-im-formular--dateinamen" open>
<summary><b>Dateinamen</b> (4)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Eine Datei</td><td>Im Upload-Bereich steht „delle.jpg“</td></tr>
<tr><td>Mehrere Dateien, mit Komma getrennt</td><td>Im Upload-Bereich steht „delle.jpg, kratzer.jpg“</td></tr>
<tr><td>Neue Auswahl ersetzt die alte</td><td>Im Upload-Bereich steht „kratzer.jpg“</td></tr>
<tr><td>Auswahl entfernt</td><td>Im Upload-Bereich steht kein Dateiname mehr</td></tr>
</table>

</details>

</dd></dl>

</details>

<details id="damage-form-spec-ts--schaden-formular-absenden" open>
<summary><b>Schaden-Formular: Absenden</b> (18)</summary>

<dl><dd>

<details id="damage-form-spec-ts--schaden-formular-absenden--kombinationen-der-pflichtfelder" open>
<summary><b>Kombinationen der Pflichtfelder</b> (10)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Kein Feld gültig ausgefüllt, dann absenden</td><td>3 Meldung(en) bei Vorname, Nachname, Telefon; Cursor im Feld „Vorname“</td></tr>
<tr><td>Nur Vorname gültig ausgefüllt, dann absenden</td><td>2 Meldung(en) bei Nachname, Telefon; Cursor im Feld „Nachname“</td></tr>
<tr><td>Nur Nachname gültig ausgefüllt, dann absenden</td><td>2 Meldung(en) bei Vorname, Telefon; Cursor im Feld „Vorname“</td></tr>
<tr><td>Nur Telefon gültig ausgefüllt, dann absenden</td><td>2 Meldung(en) bei Vorname, Nachname; Cursor im Feld „Vorname“</td></tr>
<tr><td>Vorname + Nachname gültig ausgefüllt, dann absenden</td><td>1 Meldung(en) bei Telefon; Cursor im Feld „Telefon“</td></tr>
<tr><td>Vorname + Telefon gültig ausgefüllt, dann absenden</td><td>1 Meldung(en) bei Nachname; Cursor im Feld „Nachname“</td></tr>
<tr><td>Nachname + Telefon gültig ausgefüllt, dann absenden</td><td>1 Meldung(en) bei Vorname; Cursor im Feld „Vorname“</td></tr>
<tr><td>Alle Felder außer den Pflichtfeldern gültig ausgefüllt, dann absenden</td><td>3 Meldung(en) bei Vorname, Nachname, Telefon; Cursor im Feld „Vorname“</td></tr>
<tr><td>Alle Pflichtfelder gültig ausgefüllt, dann absenden</td><td>Anfrage wird abgeschickt, Danke-Ansicht mit Vornamen erscheint</td></tr>
<tr><td>Alle Eingabefelder gültig ausgefüllt, dann absenden</td><td>Anfrage wird abgeschickt, Danke-Ansicht mit Vornamen erscheint</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-absenden--per-tastatur" open>
<summary><b>Per Tastatur</b> (2)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Pflichtfelder gültig, mit Tab zum Button, mit Enter absenden</td><td>Button ist per Tab erreichbar; Enter sendet ab, Danke-Ansicht mit Vornamen erscheint</td></tr>
<tr><td>Pflichtfelder gültig, mit Tab zum Button, mit Leertaste absenden</td><td>Button ist per Tab erreichbar; Leertaste sendet ab, Danke-Ansicht mit Vornamen erscheint</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-absenden--bereinigung-der-werte-ohne-verlassen-des-feldes" open>
<summary><b>Bereinigung der Werte ohne Verlassen des Feldes</b> (6)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Mail nur mit Leerzeichen, direkt absenden (Klick auf den Button)</td><td>Das freiwillige Mail-Feld blockiert das Absenden nicht, Danke-Ansicht mit Vornamen erscheint</td></tr>
<tr><td>Ort mit Leerzeichen außen, direkt absenden (Klick auf den Button)</td><td>Beim Absenden steht der Ort ohne die Leerzeichen außen im Feld („Graz“), Danke-Ansicht mit Vornamen erscheint</td></tr>
<tr><td>Vorname mit Akzent aus zwei Zeichen, direkt absenden (Klick auf den Button)</td><td>Abgeschickt wird „Zoë“ mit „ë“ als einem Zeichen (3 statt 4 Zeichen), Danke-Ansicht mit diesem Vornamen erscheint</td></tr>
<tr><td>Mail nur mit Leerzeichen, direkt absenden (Enter im Feld)</td><td>Das freiwillige Mail-Feld blockiert das Absenden nicht, Danke-Ansicht mit Vornamen erscheint</td></tr>
<tr><td>Ort mit Leerzeichen außen, direkt absenden (Enter im Feld)</td><td>Beim Absenden steht der Ort ohne die Leerzeichen außen im Feld („Graz“), Danke-Ansicht mit Vornamen erscheint</td></tr>
<tr><td>Vorname mit Akzent aus zwei Zeichen, direkt absenden (Enter im Feld)</td><td>Abgeschickt wird „Zoë“ mit „ë“ als einem Zeichen (3 statt 4 Zeichen), Danke-Ansicht mit diesem Vornamen erscheint</td></tr>
</table>

</details>

</dd></dl>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-aendern" open>
<summary><b>Schaden-Formular: Werte ändern</b> (13)</summary>

<dl><dd>

<details id="damage-form-spec-ts--schaden-formular-werte-aendern--fehlerhafte-werte-korrigieren" open>
<summary><b>Fehlerhafte Werte korrigieren</b> (9)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Vorname: „St3fanie“ absenden, dann zu „Karlie“ korrigieren und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>Nachname: „Nach_name“ absenden, dann zu „Kunde“ korrigieren und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>Telefon: „123456“ absenden, dann zu „+49 176 12345678“ korrigieren und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>Mail: „mailadresse.com“ absenden, dann zu „karlie@beispiel.de“ korrigieren und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>Straße: „Gebäude #2“ absenden, dann zu „Musterstraße 1“ korrigieren und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>PLZ: „1O20“ absenden, dann zu „12345“ korrigieren und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>Ort: „0rt“ absenden, dann zu „Ort“ korrigieren und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>Upload: „dokument.pdf“ absenden, dann „delle.jpg“ auswählen und erneut absenden</td><td>Erstes Absenden scheitert: Meldung nur beim Upload, Upload-Bereich rot markiert, Cursor im Upload. Nach der neuen Auswahl verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.</td></tr>
<tr><td>Nachname fehlt, Mail und PLZ ungültig, dann nacheinander ergänzen/korrigieren und jeweils absenden</td><td>Nach jedem Absenden Meldungen nur bei den noch fehlerhaften Feldern, Cursor im ersten davon (Nachname, dann Mail, dann PLZ); nach der letzten Korrektur Danke-Ansicht</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-aendern--fehlende-werte-ergaenzen" open>
<summary><b>Fehlende Werte ergänzen</b> (2)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Vorname gültig, dann absenden, dann gültigen Nachnamen ergänzen, absenden, dann gültiges Telefon ergänzen, absenden</td><td>Erstes Absenden scheitert: Meldungen bei Nachname und Telefon, Cursor im Nachnamen; zweites scheitert: Meldung nur bei Telefon, Cursor im Telefon; drittes zeigt die Danke-Ansicht</td></tr>
<tr><td>Vorname + Nachname gültig, dann absenden, dann alle anderen Eingaben ergänzen, absenden</td><td>Erstes Absenden scheitert: Meldung bei Telefon, Cursor im Telefon; nach dem Ergänzen zeigt das zweite Absenden die Danke-Ansicht</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-werte-aendern--werte-ueberschreiben" open>
<summary><b>Werte überschreiben</b> (2)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Werte vor Absenden überschreiben</td><td>Abgeschickt werden die neuen Werte aller Felder und die neue Datei, neuer Vorname erscheint in der Danke-Ansicht</td></tr>
<tr><td>Werte nach nicht erfolgreichem Absenden überschreiben</td><td>Erstes Absenden scheitert (Telefon fehlt); danach abgeschickt werden die neuen Werte aller Felder und die neue Datei, neuer Vorname erscheint in der Danke-Ansicht</td></tr>
</table>

</details>

</dd></dl>

</details>

<details id="damage-form-spec-ts--schaden-formular-danke-ansicht-schliessen" open>
<summary><b>Schaden-Formular: Danke-Ansicht schließen</b> (7)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Danke-Ansicht mit Button „Schließen“ schließen</td><td>Overlay ist geschlossen, Seite ist wieder scrollbar</td></tr>
<tr><td>Danke-Ansicht mit X oben rechts schließen</td><td>Overlay ist geschlossen, Seite ist wieder scrollbar</td></tr>
<tr><td>Danke-Ansicht mit Escape-Taste schließen</td><td>Overlay ist geschlossen, Seite ist wieder scrollbar</td></tr>
<tr><td>Danke-Ansicht mit Klick auf den dunklen Rand schließen</td><td>Overlay ist geschlossen, Seite ist wieder scrollbar</td></tr>
<tr><td>Danke-Ansicht schließen und Overlay erneut öffnen</td><td>Formular statt Danke-Ansicht sichtbar; alle Felder leer, keine Meldungen, keine roten Markierungen, Zähler auf „0 / 1000“, kein Dateiname</td></tr>
<tr><td>Nach dem Absenden zeigen Felder ihre Meldung erst nach dem Verlassen</td><td>PLZ ausgefüllt, verlassen und abgeschickt; nach dem Schließen und erneuten Öffnen während der Eingabe von „123“ keine Meldung, nach dem Verlassen des Feldes Meldung „Bitte 4 oder 5 Ziffern eingeben.“, Feld rot markiert</td></tr>
<tr><td>Fokus liegt nach dem Absenden auf „Schließen“, Enter schließt das Overlay</td><td>Nach dem Absenden hat der Button „Schließen“ der Danke-Ansicht den Fokus; Enter schließt das Overlay, Seite ist wieder scrollbar</td></tr>
</table>

</details>

<details id="damage-form-spec-ts--schaden-formular-overlay-schliessen" open>
<summary><b>Schaden-Formular: Overlay schließen</b> (7)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Formular mit X oben rechts schließen</td><td>Overlay ist geschlossen, Seite ist wieder scrollbar</td></tr>
<tr><td>Formular mit Escape-Taste schließen</td><td>Overlay ist geschlossen, Seite ist wieder scrollbar</td></tr>
<tr><td>Formular mit Klick auf den dunklen Rand schließen</td><td>Overlay ist geschlossen, Seite ist wieder scrollbar</td></tr>
<tr><td>Klick in das Formular lässt das Overlay offen</td><td>Overlay bleibt geöffnet</td></tr>
<tr><td>Seite ist bei offenem Overlay nicht scrollbar</td><td>Scrollen der Seite ist gesperrt, solange das Overlay offen ist; Scrollen erst nach dem Schließen wieder möglich</td></tr>
<tr><td>Befülltes Formular ist nach dem Schließen beim erneuten Öffnen weiterhin befüllt</td><td>Formular sichtbar; alle Felder, Zähler und Dateiname wie vor dem Schließen</td></tr>
<tr><td>Meldung und roter Rahmen bleiben nach dem Schließen erhalten, kein Feld ist aktiv</td><td>Nach erneutem Öffnen: ungültiger Wert, Meldung und roter Rahmen wie vor dem Schließen; das zuletzt aktive Feld ist nicht mehr aktiv</td></tr>
</table>

</details>

<a id="faq-spec-ts"></a>

## Tests der FAQ (faq.spec.ts) (14)

[↑ Übersicht](#uebersicht)

<details id="faq-spec-ts--faq-allgemein" open>
<summary><b>FAQ - allgemein</b> (2)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>zu jeder Frage gibt es eine Antwort mit mind. 50 Zeichen</td><td>Jeder FAQ-Eintrag hat eine Frage und eine Antwort mit mind. 50 Zeichen</td></tr>
<tr><td>jede Frage hat eine eigene Antwort</td><td>Keine Antwort steht bei mehr als einer Frage</td></tr>
</table>

</details>

<details id="faq-spec-ts--faq-desktop-821-px" open>
<summary><b>FAQ - Desktop (821 px)</b> (7)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>jedes Bild wird nur bei einer Frage verwendet</td><td>Kein Bild (data-img) ist bei mehr als einer Frage hinterlegt</td></tr>
<tr><td>jede Frage hat ein Bild</td><td>Bei jeder Frage ist ein Bild hinterlegt (data-img); nach dem Klick wird genau dieses Bild sichtbar im Bildbereich angezeigt</td></tr>
<tr><td>beim Laden 1 Frage(n) offen, nach jedem Klick nur genau die angeklickte</td><td>Beim Laden ist genau eine Frage offen; nach jedem Klick ist nur die angeklickte Frage aktiv</td></tr>
<tr><td>erneuter Klick auf die offene Frage lässt sie offen</td><td>Frage bleibt offen, Antwort bleibt sichtbar, genau eine Frage ist offen</td></tr>
<tr><td>Antworten sind nur bei der aktiven Frage sichtbar</td><td>Beim Laden und nach jedem Klick ist nur die Antwort der aktiven Frage sichtbar, alle anderen sind ausgeblendet</td></tr>
<tr><td>Fragen lassen sich per Tastatur öffnen</td><td>Frage ist fokussierbar und öffnet mit Enter; aria-expanded ist bei der offenen Frage "true", bei der geschlossenen "false"</td></tr>
<tr><td>keine Antwort wird abgeschnitten</td><td>Jede geöffnete Antwort passt vollständig in ihre Box, nichts wird abgeschnitten</td></tr>
</table>

</details>

<details id="faq-spec-ts--faq-smartphone-320-px" open>
<summary><b>FAQ - Smartphone (320 px)</b> (5)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>beim Laden 0 Frage(n) offen, nach jedem Klick nur genau die angeklickte</td><td>Beim Laden ist keine Frage offen; nach jedem Klick ist nur die angeklickte Frage aktiv</td></tr>
<tr><td>erneuter Klick auf die offene Frage klappt sie zu</td><td>Frage klappt zu, Antwort ist ausgeblendet, keine Frage ist mehr offen</td></tr>
<tr><td>Antworten sind nur bei der aktiven Frage sichtbar</td><td>Beim Laden und nach jedem Klick ist nur die Antwort der aktiven Frage sichtbar, alle anderen sind ausgeblendet</td></tr>
<tr><td>Fragen lassen sich per Tastatur öffnen</td><td>Frage ist fokussierbar und öffnet mit Enter; aria-expanded ist bei der offenen Frage "true", bei der geschlossenen "false"</td></tr>
<tr><td>keine Antwort wird abgeschnitten</td><td>Jede geöffnete Antwort passt vollständig in ihre Box, nichts wird abgeschnitten</td></tr>
</table>

</details>

<a id="footer-spec-ts"></a>

## Tests des Footers (footer.spec.ts) (4)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Footer: Nachhaltigkeit korrekt verlinkt</td><td>Link führt auf #nachhaltigkeit; nach dem Klick endet die URL auf #nachhaltigkeit und der Abschnitt ist im sichtbaren Bereich</td></tr>
<tr><td>Footer: Galerie korrekt verlinkt</td><td>Link führt auf #galerie; nach dem Klick endet die URL auf #galerie und der Abschnitt ist im sichtbaren Bereich</td></tr>
<tr><td>Footer: Bewertungen korrekt verlinkt</td><td>Link führt auf #bewertungen; nach dem Klick endet die URL auf #bewertungen und der Abschnitt ist im sichtbaren Bereich</td></tr>
<tr><td>Footer: Logo führt zum Seitenanfang</td><td>Link führt auf #; nach dem Klick endet die URL auf # und die Seite steht wieder ganz oben</td></tr>
</table>

<a id="gallery-spec-ts"></a>

## Tests der Galerie (gallery.spec.ts) (4)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Galerie: Pfeile vor/zurück wechseln das Bild</td><td>„Weiter“ zeigt ein anderes Bild, „zurück“ wieder das vorherige</td></tr>
<tr><td>Galerie: Endlos-Schleife in beide Richtungen mit Positionsanzeige</td><td>Jedes Bild erscheint genau einmal, danach wieder das erste; „zurück“ vom ersten Bild zeigt das letzte; der Fortschrittsbalken ist dabei immer passend zur Position des Bildes gefüllt</td></tr>
<tr><td>Galerie: Bildwechsel automatisch im eingestellten Takt</td><td>Bild bleibt bis kurz vor Ablauf des im Code eingestellten Takts stehen und wechselt danach automatisch</td></tr>
</table>

<details id="gallery-spec-ts--galerie-inhalt" open>
<summary><b>Galerie: Inhalt</b> (1)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>jedes Bild kommt nur einmal vor</td><td>Kein Bild (src) wird bei mehr als einem Slide verwendet</td></tr>
</table>

</details>

<a id="homepage-spec-ts"></a>

## Tests der Startseite (homepage.spec.ts) (6)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Startseite: lädt mit richtigem Titel</td><td>Seitentitel enthält den Firmennamen „Dellen Company“</td></tr>
<tr><td>Startseite: lädt ohne JavaScript-Fehler und ohne fehlgeschlagene Anfragen</td><td>Beim Laden und Durchscrollen der Seite gibt es keine JavaScript-Fehler, keine Fehler in der Konsole und keine fehlgeschlagenen Anfragen</td></tr>
<tr><td>Startseite - Desktop (821 px): kein horizontales Scrollen</td><td>Die Seite ist nicht breiter als das Fenster</td></tr>
<tr><td>Startseite - Desktop (1121 px): kein horizontales Scrollen</td><td>Die Seite ist nicht breiter als das Fenster</td></tr>
<tr><td>Startseite: letzter Einblend-Bereich ist nach dem Laden noch ausgeblendet</td><td>Der letzte Einblend-Bereich der Seite ist nach dem Laden noch unsichtbar (opacity 0)</td></tr>
<tr><td>Startseite: jeder Einblend-Bereich wird beim Scrollen eingeblendet</td><td>Jeder Einblend-Bereich ist vollständig sichtbar (opacity 1), sobald er ins Fenster gescrollt wurde</td></tr>
</table>

<a id="images-spec-ts"></a>

## Tests der Bilder (images.spec.ts) (5)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Bilder: alle &lt;img&gt;-Bilder können geladen werden</td><td>Jedes &lt;img&gt; hat ein src; alle Bilder (auch per data-img nachgeladene) werden vom Server als Bild ausgeliefert</td></tr>
<tr><td>Bilder: alle CSS-Hintergrundbilder können geladen werden</td><td>Alle im Quelltext mit url(…) eingebundenen Hintergrundbilder werden vom Server als Bild ausgeliefert</td></tr>
<tr><td>Bilder: Favicon kann geladen werden</td><td>Favicon ist eingebunden und wird vom Server als Bild ausgeliefert</td></tr>
<tr><td>Bilder - Desktop (821 px): loading="lazy"</td><td>Sichtbare Bilder unterhalb des Heroes haben loading="lazy", Bilder im oder über dem Hero nicht</td></tr>
<tr><td>Bilder - Smartphone (320 px): loading="lazy"</td><td>Sichtbare Bilder unterhalb des Heroes haben loading="lazy", Bilder im oder über dem Hero nicht</td></tr>
</table>

<a id="navbar-socialicons-spec-ts"></a>

## Tests der Social-Icons in der Navbar (navbar-socialicons.spec.ts) (3)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Navbar: Social-Icon Facebook öffnet in neuem Tab</td><td>Link führt auf https://facebook.com (target="_blank", rel="noopener"); Klick öffnet Facebook in neuem Tab</td></tr>
<tr><td>Navbar: Social-Icon Instagram öffnet in neuem Tab</td><td>Link führt auf https://instagram.com (target="_blank", rel="noopener"); Klick öffnet Instagram in neuem Tab</td></tr>
<tr><td>Navbar: Social-Icon TikTok öffnet in neuem Tab</td><td>Link führt auf https://tiktok.com (target="_blank", rel="noopener"); Klick öffnet TikTok in neuem Tab</td></tr>
</table>

<a id="navbar-spec-ts"></a>

## Tests der Navbar (navbar.spec.ts) (5)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Navbar: Leistungen korrekt verlinkt</td><td>Link führt auf #leistungen; nach dem Klick endet die URL auf #leistungen und der Abschnitt ist im sichtbaren Bereich</td></tr>
<tr><td>Navbar: Nachhaltigkeit korrekt verlinkt</td><td>Link führt auf #nachhaltigkeit; nach dem Klick endet die URL auf #nachhaltigkeit und der Abschnitt ist im sichtbaren Bereich</td></tr>
<tr><td>Navbar: Galerie korrekt verlinkt</td><td>Link führt auf #galerie; nach dem Klick endet die URL auf #galerie und der Abschnitt ist im sichtbaren Bereich</td></tr>
<tr><td>Navbar: Kontakt korrekt verlinkt</td><td>Link führt auf #kontakt; nach dem Klick endet die URL auf #kontakt und der Abschnitt ist im sichtbaren Bereich</td></tr>
<tr><td>Navbar: Logo führt zum Seitenanfang</td><td>Link führt auf #; nach dem Klick endet die URL auf # und die Seite steht wieder ganz oben</td></tr>
</table>

<a id="reviews-spec-ts"></a>

## Tests der Bewertungen (reviews.spec.ts) (13)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Bewertungen: Zeitangabe 0 Monat(e) nach der Bewertung</td><td>Neben den Sternen steht „diesen Monat“</td></tr>
<tr><td>Bewertungen: Zeitangabe 1 Monat(e) nach der Bewertung</td><td>Neben den Sternen steht „vor 1 Monat“</td></tr>
<tr><td>Bewertungen: Zeitangabe 11 Monat(e) nach der Bewertung</td><td>Neben den Sternen steht „vor 11 Monaten“</td></tr>
<tr><td>Bewertungen: Zeitangabe 12 Monat(e) nach der Bewertung</td><td>Neben den Sternen steht „vor 1 Jahr“</td></tr>
<tr><td>Bewertungen: Zeitangabe 23 Monat(e) nach der Bewertung</td><td>Neben den Sternen steht „vor 1 Jahr“</td></tr>
<tr><td>Bewertungen: Zeitangabe 24 Monat(e) nach der Bewertung</td><td>Neben den Sternen steht „vor 2 Jahren“</td></tr>
<tr><td>Bewertungen: Pfeile vor/zurück wechseln die Bewertung</td><td>„Weiter“ zeigt eine andere Bewertung, „zurück“ wieder die vorherige</td></tr>
<tr><td>Bewertungen: Endlos-Schleife in beide Richtungen mit Positionsanzeige</td><td>Jede Bewertung erscheint genau einmal, danach wieder die erste; „zurück“ von der ersten Bewertung zeigt die letzte; dabei ist immer genau der Punkt an der Position der Bewertung aktiv</td></tr>
<tr><td>Bewertungen: Wechsel automatisch im eingestellten Takt</td><td>Bewertung bleibt bis kurz vor Ablauf des im Code eingestellten Takts stehen und wechselt danach automatisch</td></tr>
<tr><td>Bewertungen: Inhalt wird vollständig angezeigt - Smartphone (320 px)</td><td>Name, Sterne und Text jeder Bewertung liegen vollständig innerhalb der Karte</td></tr>
<tr><td>Bewertungen: Inhalt wird vollständig angezeigt - Desktop (821 px)</td><td>Name, Sterne und Text jeder Bewertung liegen vollständig innerhalb der Karte</td></tr>
</table>

<details id="reviews-spec-ts--bewertungen-inhalt" open>
<summary><b>Bewertungen: Inhalt</b> (2)</summary>

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>jede Bewertung hat Name, 1–5 Sterne, Text ab 50 Zeichen und gültiges Datum</td><td>Jede Bewertung hat einen Namen, 1–5 Sterne, einen Text ab 50 Zeichen und ein Datum im Format JJJJ-MM, das nicht in der Zukunft liegt</td></tr>
<tr><td>kein Name kommt doppelt vor</td><td>Jeder Name steht nur einmal auf der Seite</td></tr>
</table>

</details>

<a id="seo-spec-ts"></a>

## SEO-Tests (seo.spec.ts) (7)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>SEO: Meta-Description ist vorhanden und passend lang</td><td>Es gibt genau eine Meta-Description mit 50–160 Zeichen</td></tr>
<tr><td>SEO: Seitensprache ist Deutsch</td><td>Das &lt;html&gt;-Element hat lang="de"</td></tr>
<tr><td>SEO: genau eine Hauptüberschrift (h1)</td><td>Die Seite hat genau eine h1, sie ist sichtbar und hat Text</td></tr>
<tr><td>SEO: Unternehmens-Schema ist vollständig und passt zur Adresse im Footer</td><td>SEO-Schema AutoRepair enthält Name, URL, Telefon und vollständige Adresse; Straße, PLZ, Ort und Telefonnummer stehen so auch im Footer</td></tr>
<tr><td>SEO: Google Fonts werden mit font-display: swap eingebunden</td><td>Jeder Google-Fonts-Link enthält display=swap, jede eigene @font-face-Regel font-display: swap</td></tr>
<tr><td>SEO: FAQ-Schema und FAQ auf der Seite sind gleich</td><td>Anzahl, Fragen und Antworten der FAQ auf der Seite stimmen mit dem SEO-Schema (FAQPage) überein</td></tr>
<tr><td>SEO: alle &lt;img&gt;-Bilder haben einen Alt-Text</td><td>Jedes &lt;img&gt; hat ein alt-Attribut; ein leerer Alt-Text steht nur bei dekorativen Bildern (aria-hidden="true")</td></tr>
</table>

<a id="services-spec-ts"></a>

## Tests der Leistungen (services.spec.ts) (5)

[↑ Übersicht](#uebersicht)

<table width="100%">
<tr><th width="40%" align="left">Testfall</th><th width="60%" align="left">Erwartetes Ergebnis</th></tr>
<tr><td>Leistungen: beim Laden ist die erste Leistung aktiv</td><td>Nach dem Laden ist nur der erste Tab aktiv und nur sein Panel sichtbar</td></tr>
<tr><td>Leistungen: Klick auf eine Leistung zeigt ihr Panel mit Text und Hintergrundbild</td><td>Nach jedem Klick ist der Tab aktiv und nur sein Panel sichtbar, mit Text und Hintergrundbild</td></tr>
<tr><td>Leistungen: jede Leistung hat einen Text mit mind. 50 Zeichen</td><td>Der Text jeder Leistung hat mind. 50 Zeichen</td></tr>
<tr><td>Leistungen: jede Leistung hat einen eigenen Text</td><td>Kein Text steht bei mehr als einer Leistung</td></tr>
<tr><td>Leistungen: jede Leistung hat ein eigenes Hintergrundbild</td><td>Kein Hintergrundbild wird bei mehr als einer Leistung verwendet</td></tr>
</table>
