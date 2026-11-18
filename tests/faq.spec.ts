import { test, expect, type Locator } from '@playwright/test';
import { expectedResult } from './helpers/addExpectedResult';
import { normalizeWhitespace } from './helpers/normalizeWhitespace';

// Doku-Titel: Tests der FAQ

const MIN_ANSWER_LENGTH = 50;

// The button with the question text inside an FAQ entry
const questionButton = (item: Locator) => item.getByRole('button');

// ─── Content (independent of the layout) ────────────────────────

test.describe('FAQ - allgemein', () => {
    test(`zu jeder Frage gibt es eine Antwort mit mind. ${MIN_ANSWER_LENGTH} Zeichen`, expectedResult(
        `Jeder FAQ-Eintrag hat eine Frage und eine Antwort mit mind. ${MIN_ANSWER_LENGTH} Zeichen`
    ), async ({ page }) => {
        await page.goto('/');

        const items = page.locator('.faq__item');
        const itemCount = await items.count();
        expect(itemCount, 'Keine FAQ-Einträge gefunden (Klasse .faq__item)').toBeGreaterThan(0);

        for (let i = 0; i < itemCount; i++) {
            const item = items.nth(i);

            const question = normalizeWhitespace(await questionButton(item).textContent());
            const label = question ? `„${question}“` : `FAQ Nr. ${i + 1}`;
            // expect.soft: the test keeps running, all failures are reported together at the end
            expect.soft(question, `FAQ Nr. ${i + 1} hat keine Frage`).not.toBe('');

            const answer = normalizeWhitespace(await item.locator('.faq__answer').textContent());
            expect.soft(answer.length, `${label}: Antwort zu kurz (${answer.length} Zeichen, mind. ${MIN_ANSWER_LENGTH})`)
                .toBeGreaterThanOrEqual(MIN_ANSWER_LENGTH);
        }
    });

    test('jede Frage hat eine eigene Antwort', expectedResult(
        'Keine Antwort steht bei mehr als einer Frage'
    ), async ({ page }) => {
        await page.goto('/');

        const items = page.locator('.faq__item');
        expect(await items.count(), 'Keine FAQ-Einträge gefunden (Klasse .faq__item)').toBeGreaterThan(0);

        // questions per answer text; empty answers are reported by the test above
        const questionsByAnswer = new Map<string, string[]>();
        for (const item of await items.all()) {
            const question = normalizeWhitespace(await questionButton(item).textContent());
            const answer = normalizeWhitespace(await item.locator('.faq__answer').textContent());
            if (answer === '') continue;
            questionsByAnswer.set(answer, [...(questionsByAnswer.get(answer) ?? []), `„${question}“`]);
        }
        const duplicates = [...questionsByAnswer.values()].filter(questions => questions.length > 1).map(questions => questions.join(', '));
        expect(duplicates, 'Diese Fragen haben dieselbe Antwort').toEqual([]);
    });
});

// ─── Layouts ────────────────────────────────────────────────────

// Desktop (from 821 px): list on the left, image on the right – always exactly one question open
// Smartphone (up to 820 px): accordion without image – all closed on load, a second click closes the question again
//
// Each layout is tested at its narrowest width: there the answers need the most lines,
// which matters for "keine Antwort wird abgeschnitten". The behavior is the same at every width of a layout.
// More widths need to be added if the font size ever scales with the viewport (e.g. clamp).
const layouts = [
    { name: 'Desktop', width: 821, height: 800, showsImage: true, openOnLoad: 1, secondClickCloses: false },
    { name: 'Smartphone', width: 320, height: 568, showsImage: false, openOnLoad: 0, secondClickCloses: true },
];

for (const layout of layouts) {
    test.describe(`FAQ - ${layout.name} (${layout.width} px)`, () => {
        test.use({ viewport: { width: layout.width, height: layout.height } });

        // ─── Image (only shown in the desktop layout) ───────────────

        if (layout.showsImage) {
            test('jedes Bild wird nur bei einer Frage verwendet', expectedResult(
                'Kein Bild (data-img) ist bei mehr als einer Frage hinterlegt'
            ), async ({ page }) => {
                await page.goto('/');

                const imageUrls = await page.locator('.faq__item').evaluateAll(faqItems => faqItems.map(item => item.getAttribute('data-img') ?? ''));
                const duplicates = [...new Set(imageUrls.filter((imageUrl, i) => imageUrls.indexOf(imageUrl) !== i))];
                expect(duplicates, 'Diese Bilder werden bei mehreren Fragen verwendet').toEqual([]);
            });

            // tests/images.spec.ts checks that the server delivers these images
            test('jede Frage hat ein Bild', expectedResult(
                'Bei jeder Frage ist ein Bild hinterlegt (data-img); nach dem Klick wird genau dieses Bild sichtbar im Bildbereich angezeigt'
            ), async ({ page }) => {
                await page.goto('/');

                const items = page.locator('.faq__item');
                const itemCount = await items.count();
                expect(itemCount, 'Keine FAQ-Einträge gefunden (Klasse .faq__item)').toBeGreaterThan(0);
                const faqImage = page.locator('#faqImg');

                for (let i = 0; i < itemCount; i++) {
                    const item = items.nth(i);
                    const question = normalizeWhitespace(await questionButton(item).textContent());
                    const label = question ? `„${question}“` : `FAQ Nr. ${i + 1}`;

                    // expect.soft: the test keeps running, all failures are reported together at the end
                    const imageUrl = (await item.getAttribute('data-img')) ?? '';
                    expect.soft(imageUrl, `${label}: kein Bild hinterlegt (data-img)`).not.toBe('');

                    // the script fades the image out, swaps it after 300 ms and fades it in again
                    await questionButton(item).click();
                    await expect.soft(faqImage, `${label}: nach dem Klick wird nicht das passende Bild eingesetzt`).toHaveAttribute('src', imageUrl);
                    await expect.soft(faqImage, `${label}: Bild ist nicht sichtbar`).toBeVisible();
                    await expect.soft(faqImage, `${label}: Bild wird nicht vollständig eingeblendet`).toHaveCSS('opacity', '1');
                }
            });
        }

        // ─── Opening and closing ────────────────────────────────────

        test(`beim Laden ${layout.openOnLoad} Frage(n) offen, nach jedem Klick nur genau die angeklickte`, expectedResult(
            `Beim Laden ist ${layout.openOnLoad === 1 ? 'genau eine' : 'keine'} Frage offen; nach jedem Klick ist nur die angeklickte Frage aktiv`
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            const activeItems = page.locator('.faq__item.is-active');
            await expect(activeItems, `Beim Laden sind nicht genau ${layout.openOnLoad} Frage(n) offen`).toHaveCount(layout.openOnLoad);

            const itemCount = await items.count();
            for (let i = 0; i < itemCount; i++) {
                await questionButton(items.nth(i)).click();
                await expect(items.nth(i), `FAQ Nr. ${i + 1} ist nach dem Klick nicht aktiv`).toHaveClass(/is-active/);
                await expect(activeItems, `Nach Klick auf FAQ Nr. ${i + 1} ist nicht genau eine Frage aktiv`).toHaveCount(1);
            }
        });

        test(`erneuter Klick auf die offene Frage ${layout.secondClickCloses ? 'klappt sie zu' : 'lässt sie offen'}`, expectedResult(
            layout.secondClickCloses
                ? 'Frage klappt zu, Antwort ist ausgeblendet, keine Frage ist mehr offen'
                : 'Frage bleibt offen, Antwort bleibt sichtbar, genau eine Frage ist offen'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            expect(await items.count(), 'Für diesen Test braucht es mindestens 2 Fragen').toBeGreaterThan(1);

            // open the second question and then click it again
            const item = items.nth(1);
            await questionButton(item).click();
            await questionButton(item).click();

            if (layout.secondClickCloses) {
                await expect(item, 'Frage ist nach erneutem Klick noch offen').not.toHaveClass(/is-active/);
                await expect(item.locator('.faq__answer'), 'Antwort ist nach erneutem Klick noch sichtbar').toBeHidden();
                await expect(page.locator('.faq__item.is-active'), 'Es ist noch eine Frage offen').toHaveCount(0);
            } else {
                await expect(item, 'Frage ist nach erneutem Klick nicht mehr offen').toHaveClass(/is-active/);
                await expect(item.locator('.faq__answer'), 'Antwort ist nach erneutem Klick nicht mehr sichtbar').toBeVisible();
                await expect(page.locator('.faq__item.is-active'), 'Nicht genau eine Frage offen').toHaveCount(1);
            }
        });

        // In both layouts: whether an answer is visible depends on the CSS, and the smartphone layout
        // has its own rules for the height and padding of the answers
        test('Antworten sind nur bei der aktiven Frage sichtbar', expectedResult(
            'Beim Laden und nach jedem Klick ist nur die Antwort der aktiven Frage sichtbar, alle anderen sind ausgeblendet'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            const itemCount = await items.count();

            // checks all answers: only the one at index "openIndex" is visible, all others are hidden
            async function expectOnlyAnswerVisible(openIndex: number, when: string) {
                for (let j = 0; j < itemCount; j++) {
                    const answer = items.nth(j).locator('.faq__answer');
                    if (j === openIndex) await expect(answer, `${when}: Antwort Nr. ${j + 1} ist nicht sichtbar`).toBeVisible();
                    else                 await expect(answer, `${when}: Antwort Nr. ${j + 1} ist sichtbar, obwohl nicht aktiv`).toBeHidden();
                }
            }

            // on load: the answer of the active question
            // (-1 if no question is open, as on smartphones: then all answers must be hidden)
            const startIndex = await items.evaluateAll(elements => elements.findIndex(element => element.classList.contains('is-active')));
            await expectOnlyAnswerVisible(startIndex, 'Beim Laden');

            for (let i = 0; i < itemCount; i++) {
                await questionButton(items.nth(i)).click();
                await expectOnlyAnswerVisible(i, `Nach Klick auf FAQ Nr. ${i + 1}`);
            }
        });

        // Also tested in the smartphone layout, although phones rarely have a keyboard:
        // the smartphone layout is not only used on phones. Anyone who zooms in on a desktop computer
        // gets it as well (e.g. 200 % on a 1280 px wide screen leaves 640 px) – and people with poor eyesight
        // who zoom in often use the keyboard instead of the mouse.
        test('Fragen lassen sich per Tastatur öffnen', expectedResult(
            'Frage ist fokussierbar und öffnet mit Enter; aria-expanded ist bei der offenen Frage "true", bei der geschlossenen "false"'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            expect(await items.count(), 'Für diesen Test braucht es mindestens 2 Fragen').toBeGreaterThan(1);

            // move the focus to the second question and open it with Enter
            const question = questionButton(items.nth(1));
            await question.focus();
            await expect(question, 'Frage lässt sich nicht fokussieren').toBeFocused();
            await page.keyboard.press('Enter');

            await expect(items.nth(1), 'Frage ist nach Enter nicht aktiv').toHaveClass(/is-active/);
            // screen readers learn from aria-expanded which question is open
            await expect(question, 'aria-expanded der geöffneten Frage ist nicht "true"').toHaveAttribute('aria-expanded', 'true');
            await expect(questionButton(items.nth(0)), 'aria-expanded der geschlossenen Frage ist nicht "false"')
                .toHaveAttribute('aria-expanded', 'false');
        });

        // ─── Answers are not cut off ────────────────────────────────

        // open answers are at most 200 px (desktop) or 300 px (smartphone) high
        test('keine Antwort wird abgeschnitten', expectedResult(
            'Jede geöffnete Antwort passt vollständig in ihre Box, nichts wird abgeschnitten'
        ), async ({ page }) => {
            await page.goto('/');

            const items = page.locator('.faq__item');
            const itemCount = await items.count();

            for (let i = 0; i < itemCount; i++) {
                const item = items.nth(i);
                const question = normalizeWhitespace(await questionButton(item).textContent());
                const answer = item.locator('.faq__answer');

                await questionButton(item).click();
                // keep measuring until the expand animation is done:
                // whatever does not fit into the box is cut off (1 px is allowed for rounding)
                await expect.soft
                    .poll(() => answer.evaluate(element => element.scrollHeight - element.clientHeight),
                        { message: `Antwort zu „${question}“ wird abgeschnitten (zu lang für die maximale Höhe)` })
                    .toBeLessThanOrEqual(1);
            }
        });
    });
}

// tests/seo.spec.ts checks that the SEO schema and the FAQ match
