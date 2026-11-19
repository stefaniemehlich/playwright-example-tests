import { test, expect, type Page, type Locator, type PlaywrightWorkerOptions } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { expectedResult } from './helpers/addExpectedResult';

// Doku-Titel: Tests des Schaden-Formulars

// ─── Valid sample values for each input field ───────────────────
const VALID_INPUTS = {
    firstName: 'Karlie',
    lastName: 'Kunde',
    phone: '+49 176 12345678',
    email: 'karlie@beispiel.de',
    street: 'Musterstraße 1',
    postalCode: '12345',
    city: 'Ort',
    message: 'Delle in der Fahrertür nach einem Parkrempler.',
    upload: { name: 'delle.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('Testbild') },
};

const VALID_INPUTS_OVERRIDE = {
    firstName: 'Maxi',
    lastName: 'Muster',
    phone: '+43 676 987654',
    email: 'maxi@muster.de',
    street: 'Wiener Straße 12a',
    postalCode: '1234',
    city: 'Graz',
    message: 'Kratzer an der Beifahrertür',
    upload: { name: 'schaden.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('Testbild') },
};

// Input field IDs in the HTML
const FIELD_ID = {
    firstName: 'sf-vorname',
    lastName: 'sf-name',
    phone: 'sf-telefon',
    email: 'sf-mail',
    street: 'sf-strasse',
    postalCode: 'sf-plz',
    city: 'sf-ort',
    message: 'sf-mitteilung',
    upload: 'sf-upload',
};

type InputField = keyof typeof FIELD_ID;

// German field names for test titles, expected results and messages in the report
const FIELD_LABEL: Record<InputField, string> = {
    firstName: 'Vorname',
    lastName: 'Nachname',
    phone: 'Telefon',
    email: 'Mail',
    street: 'Straße',
    postalCode: 'PLZ',
    city: 'Ort',
    message: 'Mitteilung',
    upload: 'Upload',
};

const REQUIRED_FIELDS: InputField[] = ['firstName', 'lastName', 'phone'];
const ALL_FIELDS = Object.keys(FIELD_ID) as InputField[];

// ─── Error messages (verbatim from index.html, RULES) ───────────
// Not included: the "too long" messages for name, email and message –
// maxlength truncates the input before these rules can apply
const ERROR_MESSAGE = {
    // First name and last name (shared rule nameRule)
    name: {
        firstNameEmpty: 'Bitte geben Sie Ihren Vornamen ein.',
        lastNameEmpty: 'Bitte geben Sie Ihren Nachnamen ein.',
        tooShort: 'Bitte mindestens 2 Zeichen eingeben.',
        invalidCharacters: 'Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph sind erlaubt.',
        misplacedSeparator: 'Leerzeichen, Bindestrich und Apostroph nur einzeln zwischen Buchstaben.',
    },
    phone: {
        empty: 'Bitte geben Sie Ihre Telefonnummer ein.',
        invalidCharacters: 'Nur Ziffern, Leerzeichen und + - / ( ) sind erlaubt.',
        plusNotAtStart: 'Ein +-Zeichen ist nur führend erlaubt.',
        missingAreaCode: 'Bitte mit Vorwahl eingeben (beginnend mit 0 oder +).',
        tooShort: 'Die Nummer ist zu kurz (mind. 6 Ziffern).',
        tooLong: 'Die Nummer ist zu lang (höchstens 15 Ziffern).',
    },
    email: {
        invalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.',
    },
    street: {
        invalidCharacters: 'Nur Buchstaben, Ziffern, Leerzeichen und . - / sind erlaubt.',
    },
    postalCode: {
        invalidLength: 'Bitte 4 oder 5 Ziffern eingeben.',
    },
    city: {
        tooShort: 'Bitte mindestens 2 Zeichen eingeben.',
        invalidCharacters: "Nur Buchstaben, Leerzeichen und . - ' ( ) sind erlaubt.",
        firstCharNotLetter: 'Der Ort muss mit einem Buchstaben beginnen.',
    },
    upload: {
        tooManyFiles: 'Bitte höchstens 10 Dateien auswählen.',
        notImageOrVideo: (fileName: string) => `„${fileName}“ ist kein Bild oder Video.`,
        fileTooLarge: (fileName: string) => `„${fileName}“ ist größer als 20 MB.`,
        totalTooLarge: 'Alle Dateien zusammen dürfen höchstens 50 MB groß sein.',
    },
};

// ─── Helper functions ───────────────────────────────────────────

// Label of each input field as a visitor reads it on the page
const FIELD_LABEL_ON_PAGE: Record<InputField, string> = {
    firstName: 'Vorname *',
    lastName: 'Nachname *',
    phone: 'Telefonnummer *',
    email: 'E-Mail-Adresse',
    street: 'Straße',
    postalCode: 'PLZ',
    city: 'Ort',
    message: 'Mitteilung',
    upload: 'Fotos & Videos des Schadens',
};

// The overlay, the button that sends the form and the heading of the thank-you screen
const overlay = (page: Page) => page.getByRole('dialog', { name: 'Schaden einreichen' });
const submitButton = (page: Page) => overlay(page).getByRole('button', { name: 'Anfrage absenden' });
const thankYouHeading = (page: Page) => overlay(page).getByRole('heading', { name: /^Danke für Ihre Anfrage/ });

// Input element of a field, found by its label the way a visitor finds it
const fieldInput = (page: Page, field: InputField) => overlay(page).getByLabel(FIELD_LABEL_ON_PAGE[field], { exact: true });
// Error message below a field: plain text without a role, so it is found by its id
const fieldError = (page: Page, field: InputField) => page.locator(`#${FIELD_ID[field]}-error`);

// Character counter below the message field, the upload area (highlighted in red on errors)
// and the names of the selected files inside it
const messageCounter = (page: Page) => page.locator('#sf-mitteilung-counter');
const uploadArea = (page: Page) => page.locator('#sfUploadArea');
const fileNames = (page: Page) => page.locator('#sfFileNames');

// Open the overlay on the page that is already loaded
async function openOverlay(page: Page) {
    await page.locator('.cta-float').getByRole('button', { name: 'Schaden checken' }).click();
    await expect(overlay(page), 'Schaden-Formular ist sichtbar').toHaveClass(/is-open/);
}

// Load the page and open the overlay with the form
async function openDamageForm(page: Page) {
    await page.goto('/');
    await openOverlay(page);
}

type InputValues = typeof VALID_INPUTS;

// Fill in the given fields: with the values from VALID_INPUTS, unless overrides has another value for a field
async function fillFields(page: Page, fields: InputField[], overrides: Partial<InputValues> = {}) {
    // Overwrite the default values with the overrides
    const values = { ...VALID_INPUTS, ...overrides };

    for (const field of fields) {
        if (field === 'upload') {
            await fieldInput(page, field).setInputFiles(values.upload);
        } else {
            await fieldInput(page, field).fill(values[field]);
        }
    }
}

// Click "Anfrage absenden"
async function submit(page: Page) {
    await submitButton(page).click();
}

// One step of a scenario: fill in some fields, then submit
type TestStep = {
    name: string;
    fields: InputField[];             // fields that are filled in during this step
    values?: Partial<InputValues>;    // overrides, otherwise VALID_INPUTS
    invalidFields?: InputField[];     // fields that get an invalid value from "values" in this step
    focusedField?: InputField;        // field that must have the cursor after submitting
};

// After a submit that must fail (required fields missing or invalid values):
// messages only on these fields, cursor in the first of them, form still open
async function expectInvalidSubmit(page: Page, fieldsWithMessage: InputField[], focusedField?: InputField) {
    // Abort if the submit must fail but no cursor position is given
    if (!focusedField) throw new Error('Testschritt ohne focusedField, obwohl das Absenden scheitern muss');

    // Message only on the given fields, no hint on any other field
    await test.step('Meldungen und Cursor-Position korrekt', async () => {
        for (const field of ALL_FIELDS) {
            if (fieldsWithMessage.includes(field)) {
                await expect(fieldError(page, field), `Meldung bei „${FIELD_LABEL[field]}“`).not.toBeEmpty();
            } else {
                await expect(fieldError(page, field), `keine Meldung bei „${FIELD_LABEL[field]}“`).toBeEmpty();
            }
        }
        await expect(fieldInput(page, focusedField), 'Cursor im ersten Feld mit Meldung').toBeFocused();
    });

    await expect(thankYouHeading(page), 'Danke-Ansicht wird nicht angezeigt').toBeHidden();
    await expect(overlay(page), 'Schaden-Formular bleibt geöffnet').toHaveClass(/is-open/);
}

// A text field shows this message and is highlighted in red
async function expectMessage(page: Page, field: InputField, errorMessage: string) {
    await test.step('Fehlermeldung und rote Markierung', async () => {
        await expect(fieldError(page, field), 'Meldung unter dem Feld').toHaveText(errorMessage);
        await expect(fieldInput(page, field), 'Feld rot markiert').toHaveClass(/is-invalid/);
    });
}

// A text field shows no message and is not highlighted in red
async function expectNoMessage(page: Page, field: InputField) {
    await test.step('kein Hinweis und keine rote Markierung', async () => {
        await expect(fieldError(page, field), 'keine Meldung').toBeEmpty();
        await expect(fieldInput(page, field), 'Feld nicht rot markiert').not.toHaveClass(/is-invalid/);
    });
}

// The upload shows this message and the upload area is highlighted in red (not the file input inside it)
async function expectUploadMessage(page: Page, errorMessage: string) {
    await test.step('Fehlermeldung und rote Markierung', async () => {
        await expect(fieldError(page, 'upload'), 'Meldung unter dem Upload-Bereich').toHaveText(errorMessage);
        await expect(uploadArea(page), 'Upload-Bereich rot markiert').toHaveClass(/is-invalid/);
    });
}

// The upload shows no message and the upload area is not highlighted in red
async function expectNoUploadMessage(page: Page) {
    await test.step('kein Hinweis und keine rote Markierung', async () => {
        await expect(fieldError(page, 'upload'), 'keine Meldung').toBeEmpty();
        await expect(uploadArea(page), 'Upload-Bereich nicht rot markiert').not.toHaveClass(/is-invalid/);
    });
}

// After a successful submit: the thank-you screen with the first name replaces the form
async function expectSuccessfulSubmit(page: Page, firstName = VALID_INPUTS.firstName) {
    await expect(thankYouHeading(page), 'Anzeige der Danke-Ansicht').toBeVisible();
    await expect(thankYouHeading(page), `Vorname in der Danke-Ansicht: „${firstName}“`).toHaveText(`Danke für Ihre Anfrage, ${firstName}!`);
    await expect(submitButton(page), 'Schaden-Formular ist nicht mehr sichtbar').toBeHidden();
}

// After reopening, no field has the cursor, so none is bordered green (B2 checks that focus means green).
// The focus is checked instead of the colour: right after opening, the 0.2 s colour transition would make
// "not green" pass even for a field that is just turning green.
async function expectNoActiveField(page: Page) {
    await test.step('kein Feld aktiv (nicht grün umrandet)', async () => {
        for (const field of ALL_FIELDS) {
            await expect(fieldInput(page, field), `„${FIELD_LABEL[field]}“ ist nicht aktiv`).not.toBeFocused();
        }
    });
}

// After reopening: the empty form instead of the thank-you screen – no values, no messages, no red highlight,
// no active field
async function expectEmptyForm(page: Page) {
    await expect(submitButton(page), 'Formular ist sichtbar').toBeVisible();
    await expect(thankYouHeading(page), 'Danke-Ansicht ist nicht mehr sichtbar').toBeHidden();

    await test.step('alle Felder leer, ohne Meldung und nicht rot markiert', async () => {
        for (const field of ALL_FIELDS) {
            // for the upload, the upload area is highlighted in red, not the file input itself
            const markedElement = field === 'upload' ? uploadArea(page) : fieldInput(page, field);
            await expect(fieldInput(page, field), `„${FIELD_LABEL[field]}“ ist leer`).toHaveValue('');
            await expect(fieldError(page, field), `keine Meldung bei „${FIELD_LABEL[field]}“`).toBeEmpty();
            await expect(markedElement, `„${FIELD_LABEL[field]}“ ist nicht rot markiert`).not.toHaveClass(/is-invalid/);
        }
    });

    await expect(messageCounter(page), 'Zähler steht wieder auf 0').toHaveText('0 / 1000');
    await expect(fileNames(page), 'kein Dateiname mehr angezeigt').toBeEmpty();
    await expectNoActiveField(page);
}

// Open the form and run the steps one after the other: fill in, submit, check.
// As long as required fields are missing or fields have an invalid value, the submit must fail
// with messages on exactly these fields – once everything is filled in correctly, it must succeed.
async function runScenario(page: Page, steps: TestStep[]) {
    await openDamageForm(page);
    let missingRequiredFields = REQUIRED_FIELDS;
    let invalidFields: InputField[] = [];
    let firstName = VALID_INPUTS.firstName;

    for (const step of steps) {
        await test.step(`${step.name} eingeben`, async () => {
            missingRequiredFields = missingRequiredFields.filter(field => !step.fields.includes(field));
            // a field filled in again is valid now – unless this step gives it an invalid value
            invalidFields = [...invalidFields.filter(field => !step.fields.includes(field)), ...(step.invalidFields ?? [])];
            // remember the first name entered last; it must appear in the thank-you screen
            if (step.fields.includes('firstName')) {
                firstName = step.values?.firstName ?? VALID_INPUTS.firstName;
            }
            await fillFields(page, step.fields, step.values);
        });

        await submit(page);

        // in the order of the form, like the messages on the page
        const fieldsWithMessage = ALL_FIELDS.filter(field => missingRequiredFields.includes(field) || invalidFields.includes(field));
        if (fieldsWithMessage.length === 0) {
            await expectSuccessfulSubmit(page, firstName);
        } else {
            await expectInvalidSubmit(page, fieldsWithMessage, step.focusedField);
        }
    }
}

// Values of all fields as they are submitted: the text of each field, and for the upload, the file names
type SubmittedValues = Record<InputField, string>;

// The submitted values to expect when the fields were filled in with these values
const submittedValuesOf = (values: InputValues): SubmittedValues => ({ ...values, upload: values.upload.name });

// Start listening on the page: resolves with the values of all fields at the moment the form is submitted
// (afterwards the page clears the form). Call it after opening the form and before submitting.
// The browser fires the submit event only for a valid form, so a failed submit does not count.
// The promise has no time limit of its own: await it only after expectSuccessfulSubmit –
// otherwise a failed submit would wait for the test timeout (30 s) without a clear message
function captureSubmittedValues(page: Page) {
    return page.evaluate(ids => new Promise<Record<string, string>>(resolve => {
        document.addEventListener('submit', () => resolve(Object.fromEntries(Object.entries(ids).map(([field, id]) => {
            const input = document.getElementById(id) as HTMLInputElement;
            return [field, input.type === 'file' ? Array.from(input.files ?? [], file => file.name).join(', ') : input.value];
        }))), { capture: true, once: true });
    }), FIELD_ID) as Promise<SubmittedValues>;
}

// The ways to close the overlay. The X at the top and the button of the thank-you screen are both
// called "Schließen" – the visible text ("×" or "Schließen") tells the two apart.
const thankYouCloseButton = (page: Page) => overlay(page).getByRole('button', { name: 'Schließen' }).filter({ hasText: 'Schließen' });

const CLOSE_WAYS = {
    button: { description: 'Button „Schließen“', close: (page: Page) => thankYouCloseButton(page).click() },
    x: { description: 'X oben rechts', close: (page: Page) => overlay(page).getByRole('button', { name: 'Schließen' }).filter({ hasText: '×' }).click() },
    escape: { description: 'Escape-Taste', close: (page: Page) => page.keyboard.press('Escape') },
    // top left corner of the overlay: the dark area around the form
    outside: { description: 'Klick auf den dunklen Rand', close: (page: Page) => overlay(page).click({ position: { x: 5, y: 5 } }) },
};
type CloseWay = keyof typeof CLOSE_WAYS;

// The button "Schließen" only exists in the thank-you screen – the form can be closed in all other ways
const FORM_CLOSE_WAYS = (Object.keys(CLOSE_WAYS) as CloseWay[]).filter(closeWay => closeWay !== 'button');

// The overlay is closed and the page behind it can be scrolled again
async function expectOverlayClosed(page: Page) {
    await expect(overlay(page), 'Overlay ist geschlossen').not.toHaveClass(/is-open/);
    await expect(page.locator('body'), 'Seite ist wieder scrollbar').not.toHaveCSS('overflow', 'hidden');
}

// Close the overlay in the given way and check that it is closed
async function closeOverlay(page: Page, closeWay: CloseWay) {
    await CLOSE_WAYS[closeWay].close(page);
    await expectOverlayClosed(page);
}

// ─── Overview of the test sets ──────────────────────────────────
// From the single field to the whole overlay:
// A  validate the values: every field on its own (A1-A9)
// B  displays in the form: when the messages appear (B1), border of the active field (B2), character counter (B3), file names (B4)
// C  submit: combinations of the required fields (C1), with the keyboard (C2), values tidied up without leaving the field (C3)
// D  change values: correct (D1), add (D2), overwrite (D3)
// E  thank-you screen
// F  close the overlay

// ─── Test set A: validate the values ────────────────────────────

// 'chromium' | 'firefox' | 'webkit' – the same type Playwright uses for browserName
type BrowserName = PlaywrightWorkerOptions['browserName'];

type ValidationTest = {
    description: string;
    input: string;
    errorMessage?: string;
    expectedValue?: string;     // only set if the page changes the value
    browsers?: BrowserName[];   // only set if the browsers behave differently; the test runs only in these
};

// Text for the expected result: the value the page leaves in the field.
// Long values (e.g. 'x'.repeat(1000)) are shown only by their length, so the documentation stays readable
function expectedValueText(expectedValue: string) {
    if (expectedValue === '') return 'Feld ist danach leer';
    if (expectedValue.length > 40) return `Feld enthält danach ${expectedValue.length} Zeichen`;
    return `Feld enthält danach „${expectedValue}“`;
}

// Create one test per table row: enter the value, leave the field,
// then check the message, the red highlight and – if given – the value the page has changed
function validationTests(testCases: ValidationTest[], field: InputField) {
    for (const testCase of testCases) {
        const messageText = testCase.errorMessage
            ? `Meldung „${testCase.errorMessage}“, Feld rot markiert`
            : 'keine Meldung, Feld nicht rot markiert';
        const expectedResultText = testCase.expectedValue === undefined
            ? messageText
            : `${messageText}; ${expectedValueText(testCase.expectedValue)}`;

        test(`${FIELD_LABEL[field]}: ${testCase.description}`,
            { ...expectedResult(expectedResultText), tag: testCase.errorMessage ? ['@negative-test'] : [] },
            async ({ page, browserName }) => {
                test.skip(testCase.browsers !== undefined && !testCase.browsers.includes(browserName),
                    `nur für ${testCase.browsers?.join(', ')}`);
                await openDamageForm(page);
                await fieldInput(page, field).fill(testCase.input);
                await fieldInput(page, field).blur();   // leave the field, the page validates now

                if (testCase.errorMessage) {
                    await expectMessage(page, field, testCase.errorMessage);
                } else {
                    await expectNoMessage(page, field);
                }
                if (testCase.expectedValue !== undefined) {
                    await expect(fieldInput(page, field), 'Wert im Feld korrekt ersetzt').toHaveValue(testCase.expectedValue);
                }
            });
    }
}

// Upload: files instead of text, checked right after selection
const MB = 1024 * 1024;

const DEFAULT_FILE_SIZE = 1024;   // 1 KB

type TestFile = { name: string; size?: number };   // size in bytes, default DEFAULT_FILE_SIZE

type UploadValidationTest = {
    description: string;
    files: TestFile[];
    errorMessage?: string;
};

// creates a list of images: bild1.jpg, bild2.jpg, … (only name and size – the test writes the files to disk)
const numberedImages = (count: number): TestFile[] => Array.from({ length: count }, (_, i) => ({ name: `bild${i + 1}.jpg` }));

// Create one test per table row: select the files,
// then check the message and the red highlight of the upload area
function uploadValidationTests(testCases: UploadValidationTest[]) {
    for (const testCase of testCases) {
        const expectedResultText = testCase.errorMessage
            ? `Meldung „${testCase.errorMessage}“, Upload-Bereich rot markiert`
            : 'keine Meldung, Upload-Bereich nicht rot markiert';
        const totalSize = testCase.files.reduce((sum, file) => sum + (file.size ?? DEFAULT_FILE_SIZE), 0);

        test(`${FIELD_LABEL.upload}: ${testCase.description}`,
            { ...expectedResult(expectedResultText), tag: testCase.errorMessage ? ['@negative-test'] : [] },
            async ({ page }, testInfo) => {
                // From 20 MB upwards, writing the files and passing them to the browser takes a while – with many tests
                // running in parallel, Firefox exceeded the 30 s limit. test.slow() triples the time limit for these tests
                test.slow(totalSize >= 20 * MB, 'große Dateien');
                await openDamageForm(page);

                // Create the test files in the test's output folder (the browser detects the type from the extension)
                const paths = testCase.files.map(file => {
                    const filePath = testInfo.outputPath(file.name);
                    writeFileSync(filePath, Buffer.alloc(file.size ?? DEFAULT_FILE_SIZE));
                    return filePath;
                });
                await fieldInput(page, 'upload').setInputFiles(paths);   // the page validates right after selection

                if (testCase.errorMessage) {
                    await expectUploadMessage(page, testCase.errorMessage);
                } else {
                    await expectNoUploadMessage(page);
                }
            });
    }
}

test.describe('Schaden-Formular: Werte validieren', () => {
    // ─── A1: first name ─────────────────────────────────────────
    test.describe(FIELD_LABEL.firstName, () => {
        const FIRST_NAME_TESTS: ValidationTest[] = [
            // POSITIVE TESTS
            { description: 'genau 2 Zeichen', input: 'Al' },
            { description: 'genau 50 Zeichen', input: 'A'.repeat(50) },
            { description: 'Umlaute', input: 'Jürgen' },
            { description: 'Akzente', input: 'Zoë' },
            // "ë" as two characters: normalize('NFD') splits it into "e" + combining diaeresis (U+0308),
            // as it happens when pasting – the page joins them into one character in the field (normalize('NFC'))
            { description: 'Akzent aus zwei Zeichen wird zu einem (e + Trema, z. B. beim Einfügen)', input: 'Zoë'.normalize('NFD'), expectedValue: 'Zoë'.normalize('NFC') },
            { description: 'andere Schrift', input: 'Иван' },
            { description: 'Bindestrich zwischen Buchstaben', input: 'Anne-Marie' },
            { description: 'Leerzeichen zwischen Buchstaben', input: 'Mary Ann' },
            { description: 'mehrere Bindestriche', input: 'Marie-Luise-Charlotte' },
            { description: 'Bindestrich und Leerzeichen gemischt', input: 'Jean-Pierre Louis' },
            { description: 'Apostroph', input: "D'Angelo" },
            { description: 'typografischer Apostroph', input: 'D’Angelo' },
            { description: 'Leerzeichen außen werden entfernt', input: '  Anna  ', expectedValue: 'Anna' },
            { description: '51 Zeichen werden abgeschnitten', input: 'A'.repeat(51), expectedValue: 'A'.repeat(50) },

            // NEGATIVE TESTS
            { description: 'leer (Pflichtfeld)', input: '', errorMessage: ERROR_MESSAGE.name.firstNameEmpty },
            { description: 'nur Leerzeichen', input: '   ', errorMessage: ERROR_MESSAGE.name.firstNameEmpty },
            { description: '1 Zeichen', input: 'A', errorMessage: ERROR_MESSAGE.name.tooShort },
            { description: 'Ziffer', input: 'Anna1', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
            { description: 'Sonderzeichen', input: 'Anna!', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
            { description: 'Bindestrich am Anfang', input: '-Anna', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'Bindestrich am Ende', input: 'Anna-', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'doppelter Bindestrich', input: 'Anna--Lena', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'doppeltes Leerzeichen innen', input: 'Anna  Lena', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'Bindestrich direkt neben Leerzeichen', input: 'Jean- Pierre', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
        ];
        validationTests(FIRST_NAME_TESTS, 'firstName');
    });

    // ─── A2: last name ──────────────────────────────────────────
    test.describe(FIELD_LABEL.lastName, () => {
        const LAST_NAME_TESTS: ValidationTest[] = [
            // POSITIVE TESTS
            { description: 'genau 2 Zeichen', input: 'Li' },
            { description: 'genau 50 Zeichen', input: 'B'.repeat(50) },
            { description: 'Umlaute', input: 'Müller' },
            { description: 'Akzente', input: 'Brontë' },
            // "ë" as two characters: normalize('NFD') splits it into "e" + combining diaeresis (U+0308),
            // as it happens when pasting – the page joins them into one character in the field (normalize('NFC'))
            { description: 'Akzent aus zwei Zeichen wird zu einem (e + Trema, z. B. beim Einfügen)', input: 'Brontë'.normalize('NFD'), expectedValue: 'Brontë'.normalize('NFC') },
            { description: 'andere Schrift', input: 'Иванов' },
            { description: 'Bindestrich zwischen Buchstaben', input: 'Müller-Lüdenscheidt' },
            { description: 'Leerzeichen zwischen Buchstaben', input: 'von Bülow' },
            { description: 'mehrere Leerzeichen', input: 'de la Cruz' },
            { description: 'Bindestrich und Leerzeichen gemischt', input: 'García-López de Vega' },
            { description: 'Apostroph', input: "O'Brien" },
            { description: 'typografischer Apostroph', input: 'O’Brien' },
            { description: 'Leerzeichen außen werden entfernt', input: '  Kunde  ', expectedValue: 'Kunde' },
            { description: '51 Zeichen werden abgeschnitten', input: 'B'.repeat(51), expectedValue: 'B'.repeat(50) },

            // NEGATIVE TESTS
            { description: 'leer (Pflichtfeld)', input: '', errorMessage: ERROR_MESSAGE.name.lastNameEmpty },
            { description: 'nur Leerzeichen', input: '   ', errorMessage: ERROR_MESSAGE.name.lastNameEmpty },
            { description: '1 Zeichen', input: 'B', errorMessage: ERROR_MESSAGE.name.tooShort },
            { description: 'Ziffer', input: 'Kunde1', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
            { description: 'Sonderzeichen', input: 'Kunde&Co', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
            { description: 'Bindestrich am Anfang', input: '-Kunde', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'Bindestrich am Ende', input: 'Kunde-', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'doppelter Bindestrich', input: 'Müller--Lüdenscheidt', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'doppeltes Leerzeichen innen', input: 'von  Bülow', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
            { description: 'Leerzeichen direkt neben Bindestrich', input: 'Müller -Lüdenscheidt', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
        ];
        validationTests(LAST_NAME_TESTS, 'lastName');
    });

    // ─── A3: phone ──────────────────────────────────────────────
    test.describe(FIELD_LABEL.phone, () => {
        const PHONE_TESTS: ValidationTest[] = [
            // POSITIVE TESTS
            { description: 'beginnend mit +49', input: '+49 176 12345678' },
            { description: 'beginnend mit 0', input: '0176 12345678' },
            { description: 'Schrägstrich', input: '089/123456' },
            { description: 'Bindestrich', input: '0176-12345678' },
            { description: 'Vorwahl in Klammern', input: '(089) 123456' },
            { description: '+49 mit (0)', input: '+49 (0)89 123456' },
            { description: 'genau 6 Ziffern', input: '012345' },
            { description: 'genau 15 Ziffern', input: '0' + '1'.repeat(14) },
            // only the digits count: 24 characters, but 15 digits
            { description: 'genau 15 Ziffern mit allen erlaubten Trennzeichen', input: '+49 (0)176 / 123-456 789' },
            { description: 'Leerzeichen außen werden entfernt', input: '  0176 123456  ', expectedValue: '0176 123456' },

            // NEGATIVE TESTS
            { description: 'leer (Pflichtfeld)', input: '', errorMessage: ERROR_MESSAGE.phone.empty },
            { description: 'nur Leerzeichen', input: '   ', errorMessage: ERROR_MESSAGE.phone.empty },
            { description: 'Buchstaben', input: '0176 abc', errorMessage: ERROR_MESSAGE.phone.invalidCharacters },
            { description: 'Punkt', input: '089.123456', errorMessage: ERROR_MESSAGE.phone.invalidCharacters },
            { description: '+ in der Mitte', input: '0176+123456', errorMessage: ERROR_MESSAGE.phone.plusNotAtStart },
            { description: 'doppeltes +', input: '++49 176 123456', errorMessage: ERROR_MESSAGE.phone.plusNotAtStart },
            { description: 'ohne Vorwahl', input: '176 123456', errorMessage: ERROR_MESSAGE.phone.missingAreaCode },
            { description: '5 Ziffern', input: '01234', errorMessage: ERROR_MESSAGE.phone.tooShort },
            { description: '16 Ziffern', input: '0' + '1'.repeat(15), errorMessage: ERROR_MESSAGE.phone.tooLong },
            { description: '16 Ziffern mit allen erlaubten Trennzeichen', input: '+49 (0)176 / 123-456 7890', errorMessage: ERROR_MESSAGE.phone.tooLong },
        ];
        validationTests(PHONE_TESTS, 'phone');
    });

    // ─── A4: email ──────────────────────────────────────────────
    test.describe(FIELD_LABEL.email, () => {
        const EMAIL_TESTS: ValidationTest[] = [
            // POSITIVE TESTS
            { description: 'leer (optionales Feld)', input: '' },
            { description: 'nur Leerzeichen werden entfernt', input: '   ', expectedValue: '' },
            { description: 'einfache Adresse', input: 'name@beispiel.de' },
            { description: 'Punkt, Plus und Subdomain', input: 'vor.name+info@mail.beispiel.de' },
            { description: 'kürzeste Endung (2 Zeichen)', input: 'a@b.co' },
            { description: 'Großbuchstaben', input: 'NAME@BEISPIEL.DE' },
            { description: 'Bindestrich und Ziffern in der Domain', input: 'name@bei-spiel24.de' },
            // Chromium converts umlauts in the domain itself (Punycode) – the address is valid and works
            { description: 'Umlaut in der Domain (Chromium)', input: 'name@müller.de', expectedValue: 'name@xn--mller-kva.de', browsers: ['chromium'] },
            { description: 'genau 254 Zeichen', input: 'a'.repeat(242) + '@beispiel.de' },
            // each part of the domain (between the dots, including the top-level domain) may have at most 63 characters
            { description: 'Teil der Domain mit genau 63 Zeichen', input: 'name@' + 'a'.repeat(63) + '.de' },
            { description: 'Leerzeichen außen werden entfernt', input: '  name@beispiel.de  ', expectedValue: 'name@beispiel.de' },

            // NEGATIVE TESTS
            { description: 'ohne @', input: 'name', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'ohne Endung', input: 'name@beispiel', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'Endung nur 1 Zeichen', input: 'name@beispiel.d', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'ohne Namen vor @', input: '@beispiel.de', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'doppeltes @', input: 'name@@beispiel.de', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'Leerzeichen innen', input: 'na me@beispiel.de', errorMessage: ERROR_MESSAGE.email.invalid },
            // The browser rejects these too (type="email"), but the page must show its own message
            { description: 'doppelter Punkt in der Domain', input: 'name@beispiel..de', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'Domain beginnt mit Bindestrich', input: 'name@-beispiel.de', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'Domain endet mit Bindestrich', input: 'name@beispiel-.de', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'Umlaut vor @', input: 'jürgen@beispiel.de', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'Umlaut in der Domain (Firefox, WebKit)', input: 'name@müller.de', errorMessage: ERROR_MESSAGE.email.invalid, browsers: ['firefox', 'webkit'] },
            { description: 'Endung aus Ziffern', input: 'name@beispiel.12', errorMessage: ERROR_MESSAGE.email.invalid },
            // Without its own limit (63 characters per domain part) the page would accept these –
            // the browser rejects them and would show its own (English) message
            { description: 'Teil der Domain mit 64 Zeichen', input: 'name@' + 'a'.repeat(64) + '.de', errorMessage: ERROR_MESSAGE.email.invalid },
            { description: 'Endung mit 64 Buchstaben', input: 'name@beispiel.' + 'd'.repeat(64), errorMessage: ERROR_MESSAGE.email.invalid },
            // maxlength="254" cuts off the last character: "…@beispiel.de" becomes "…@beispiel.d", the top-level domain is then too short
            { description: '255 Zeichen werden abgeschnitten', input: 'a'.repeat(243) + '@beispiel.de', expectedValue: 'a'.repeat(243) + '@beispiel.d', errorMessage: ERROR_MESSAGE.email.invalid },
        ];
        validationTests(EMAIL_TESTS, 'email');
    });

    // ─── A5: street ─────────────────────────────────────────────
    test.describe(FIELD_LABEL.street, () => {
        const STREET_TESTS: ValidationTest[] = [
            // POSITIVE TESTS
            { description: 'leer (optionales Feld)', input: '' },
            { description: 'nur Leerzeichen werden entfernt', input: '   ', expectedValue: '' },
            { description: 'Straße mit Hausnummer', input: 'Musterstraße 1' },
            { description: 'Abkürzung mit Punkt und Buchstabe an Hausnummer', input: 'Hauptstr. 12a' },
            { description: 'Schrägstrich', input: 'Am Anger 3/1' },
            { description: 'Bindestriche', input: 'Karl-Marx-Allee 5' },
            { description: 'genau 100 Zeichen', input: 'a'.repeat(100) },
            { description: '101 Zeichen werden abgeschnitten', input: 'a'.repeat(101), expectedValue: 'a'.repeat(100) },
            { description: 'Leerzeichen außen werden entfernt', input: '  Musterstraße 1  ', expectedValue: 'Musterstraße 1' },

            // NEGATIVE TESTS
            { description: 'Komma', input: 'Musterstraße 1, 2. OG', errorMessage: ERROR_MESSAGE.street.invalidCharacters },
            { description: 'Raute', input: 'Weg #5', errorMessage: ERROR_MESSAGE.street.invalidCharacters },
            { description: 'Klammern', input: 'Hauptstr. 1 (Hinterhaus)', errorMessage: ERROR_MESSAGE.street.invalidCharacters },
            { description: 'Apostroph', input: "Rue de l'Église 3", errorMessage: ERROR_MESSAGE.street.invalidCharacters },
        ];
        validationTests(STREET_TESTS, 'street');
    });

    // ─── A6: postal code ────────────────────────────────────────
    test.describe(FIELD_LABEL.postalCode, () => {
        const POSTAL_CODE_TESTS: ValidationTest[] = [
            // POSITIVE TESTS
            { description: 'leer (optionales Feld)', input: '' },
            { description: 'nur Leerzeichen werden entfernt', input: '   ', expectedValue: '' },
            { description: '5 Ziffern (Deutschland)', input: '12223' },
            { description: '4 Ziffern (Österreich, Schweiz)', input: '1234' },
            { description: 'führende Null', input: '01067' },
            { description: 'Leerzeichen außen werden entfernt', input: ' 04109 ', expectedValue: '04109' },

            // NEGATIVE TESTS
            { description: '3 Ziffern', input: '123', errorMessage: ERROR_MESSAGE.postalCode.invalidLength },
            { description: '6 Ziffern', input: '122234', errorMessage: ERROR_MESSAGE.postalCode.invalidLength },
            { description: 'Buchstabe', input: '8222a', errorMessage: ERROR_MESSAGE.postalCode.invalidLength },
            { description: 'Leerzeichen dazwischen', input: '82 23', errorMessage: ERROR_MESSAGE.postalCode.invalidLength },
            { description: 'Minuszeichen', input: '-8222', errorMessage: ERROR_MESSAGE.postalCode.invalidLength },
        ];
        validationTests(POSTAL_CODE_TESTS, 'postalCode');
    });

    // ─── A7: city ───────────────────────────────────────────────
    test.describe(FIELD_LABEL.city, () => {
        const CITY_TESTS: ValidationTest[] = [
            // POSITIVE TESTS
            { description: 'leer (optionales Feld)', input: '' },
            { description: 'nur Leerzeichen werden entfernt', input: '   ', expectedValue: '' },
            { description: 'genau 2 Zeichen', input: 'Ob' },
            { description: 'Umlaute', input: 'München' },
            { description: 'Bindestrich', input: 'Garmisch-Partenkirchen' },
            { description: 'Klammern', input: 'Halle (Saale)' },
            { description: 'Punkt', input: 'St. Gallen' },
            { description: 'Apostroph', input: "L'Aquila" },
            { description: 'typografischer Apostroph', input: 'L’Aquila' },
            { description: 'genau 50 Zeichen', input: 'O'.repeat(50) },
            { description: '51 Zeichen werden abgeschnitten', input: 'O'.repeat(51), expectedValue: 'O'.repeat(50) },
            { description: 'Leerzeichen außen werden entfernt', input: '  Graz  ', expectedValue: 'Graz' },

            // NEGATIVE TESTS
            { description: '1 Zeichen', input: 'A', errorMessage: ERROR_MESSAGE.city.tooShort },
            { description: 'Ziffer', input: 'Leipzig 2', errorMessage: ERROR_MESSAGE.city.invalidCharacters },
            { description: 'Schrägstrich', input: 'Fürstenfeld/Obb', errorMessage: ERROR_MESSAGE.city.invalidCharacters },
            { description: 'Bindestrich am Anfang', input: '-Partenkirchen', errorMessage: ERROR_MESSAGE.city.firstCharNotLetter },
            { description: 'Klammer am Anfang', input: '(Saale', errorMessage: ERROR_MESSAGE.city.firstCharNotLetter },
        ];
        validationTests(CITY_TESTS, 'city');
    });

    // ─── A8: message ────────────────────────────────────────────
    // Positive tests only: the single rule (at most 1000 characters) cannot be violated because of maxlength="1000"
    test.describe(FIELD_LABEL.message, () => {
        const MESSAGE_TESTS: ValidationTest[] = [
            { description: 'leer (optionales Feld)', input: '' },
            { description: 'nur Leerzeichen werden entfernt', input: '   ', expectedValue: '' },
            { description: 'kurzer Text', input: 'Delle in der Fahrertür.' },
            { description: 'mehrere Zeilen', input: 'Zeile 1\nZeile 2' },
            { description: 'Sonderzeichen und Emoji', input: 'Delle <links> & rechts 🚗?!..."§$%&/()=' },
            // realistic case: videos that are too large for the upload are sent as a link
            { description: 'Link (z. B. zu weiteren Fotos)', input: 'Video vom Schaden: https://beispiel.de/fotos/delle.mp4' },
            { description: 'genau 1000 Zeichen', input: 'x'.repeat(1000) },
            { description: '1001 Zeichen werden abgeschnitten', input: 'x'.repeat(1001), expectedValue: 'x'.repeat(1000) },
            { description: 'Leerzeichen außen werden entfernt', input: '  Delle  ', expectedValue: 'Delle' },
        ];
        validationTests(MESSAGE_TESTS, 'message');
    });

    // ─── A9: upload ─────────────────────────────────────────────
    test.describe(FIELD_LABEL.upload, () => {
        const UPLOAD_TESTS: UploadValidationTest[] = [
            // POSITIVE TESTS
            { description: 'ein JPG', files: [{ name: 'delle.jpg' }] },
            { description: 'ein PNG', files: [{ name: 'delle.png' }] },
            { description: 'ein Video', files: [{ name: 'delle.mp4' }] },
            { description: 'Bild und Video', files: [{ name: 'delle.jpg' }, { name: 'delle.mp4' }] },
            { description: 'genau 10 Dateien', files: numberedImages(10) },
            { description: 'Datei genau 20 MB', files: [{ name: 'gross.jpg', size: 20 * MB }] },
            { description: 'zusammen genau 50 MB', files: [{ name: 'a.jpg', size: 20 * MB }, { name: 'b.jpg', size: 20 * MB }, { name: 'c.jpg', size: 10 * MB }] },

            // NEGATIVE TESTS
            { description: '11 Dateien', files: numberedImages(11), errorMessage: ERROR_MESSAGE.upload.tooManyFiles },
            { description: 'PDF', files: [{ name: 'dokument.pdf' }], errorMessage: ERROR_MESSAGE.upload.notImageOrVideo('dokument.pdf') },
            { description: 'Bild und PDF', files: [{ name: 'delle.jpg' }, { name: 'dokument.pdf' }], errorMessage: ERROR_MESSAGE.upload.notImageOrVideo('dokument.pdf') },
            { description: 'Datei 20 MB + 1 Byte', files: [{ name: 'zu-gross.jpg', size: 20 * MB + 1 }], errorMessage: ERROR_MESSAGE.upload.fileTooLarge('zu-gross.jpg') },
            { description: 'Dateien zusammen 50 MB + 1 Byte', files: [{ name: 'a.jpg', size: 20 * MB }, { name: 'b.jpg', size: 20 * MB }, { name: 'c.jpg', size: 10 * MB + 1 }], errorMessage: ERROR_MESSAGE.upload.totalTooLarge },
        ];
        uploadValidationTests(UPLOAD_TESTS);
    });
});

// ─── Test set B: displays in the form ───────────────────────────
type CounterTest = {
    description: string;
    input: string;
    expectedCount: number;
};

type FileNamesTest = {
    description: string;
    selections: string[][];   // file names of each selection, one after the other
    expectedNames: string;    // text shown after the last selection
};

// creates a small image with the given name, kept in memory only (no file on disk)
const inMemoryImage = (name: string) => ({ name, mimeType: 'image/jpeg', buffer: Buffer.from('Testbild') });

test.describe('Schaden-Formular: Anzeigen im Formular', () => {
    // ─── B1: when the messages appear ───────────────────────────
    // A text field shows its message only after the visitor has left it for the first time –
    // nobody wants to read "invalid" after the first digit. From then on the message follows every keystroke.
    // Demonstrated with the postal code (valid: 4 or 5 digits); index.html treats all text fields the same way.
    // The switch between two different messages is shown with the phone number, which has several rules.
    test.describe('Hinweismeldungen bei Falscheingaben', () => {
        const postalCode = (page: Page) => fieldInput(page, 'postalCode');
        const errorMessage = ERROR_MESSAGE.postalCode.invalidLength;

        // back into the field: a visitor clicks behind the last character,
        // focus() alone would put the cursor in front of the first one
        async function focusAtEnd(input: Locator) {
            await input.focus();
            await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(element.value.length, element.value.length));
        }

        // pressSequentially types key by key like a visitor, the cursor stays in the field
        test(`Beim ersten Tippen keine Meldung, erst nach dem Verlassen des Feldes (${FIELD_LABEL.postalCode})`, {
            ...expectedResult(
                `Während der Eingabe von „123“ keine Meldung und keine rote Markierung; nach dem Verlassen des Feldes Meldung „${errorMessage}“, Feld rot markiert`
            ),
        }, async ({ page }) => {
            await openDamageForm(page);

            await postalCode(page).pressSequentially('123');
            await expect(postalCode(page), 'Cursor ist noch im Feld').toBeFocused();
            await expectNoMessage(page, 'postalCode');

            await postalCode(page).blur();
            await expectMessage(page, 'postalCode', errorMessage);
        });

        // 3 digits are too few, 4 and 5 are valid, 6 are too many
        test(`Nach dem ersten Verlassen des Feldes wird die Meldung bei jedem Tastendruck neu geprüft (${FIELD_LABEL.postalCode})`, {
            ...expectedResult(
                'Nach dem Verlassen des Feldes mit „123“ steht die Meldung da; beim Weitertippen verschwindet sie bei „1234“, '
                + 'bei „12345“ wird weiter nichts angezeigt, erscheint bei „123456“ sofort wieder und verschwindet nach dem Löschen der letzten Ziffer – '
                + 'jeweils ohne das Feld erneut zu verlassen'
            ),
        }, async ({ page }) => {
            await openDamageForm(page);
            await postalCode(page).pressSequentially('123');
            await postalCode(page).blur();
            await expectMessage(page, 'postalCode', errorMessage);

            await focusAtEnd(postalCode(page));

            const steps = [
                { key: '4', value: '1234', valid: true },
                { key: '5', value: '12345', valid: true },
                { key: '6', value: '123456', valid: false },
                { key: 'Backspace', value: '12345', valid: true },
            ];
            for (const step of steps) {
                await test.step(`Taste „${step.key}“: im Feld steht „${step.value}“`, async () => {
                    await postalCode(page).press(step.key);
                    await expect(postalCode(page), 'Wert im Feld').toHaveValue(step.value);
                    await expect(postalCode(page), 'Cursor ist noch im Feld').toBeFocused();
                    if (step.valid) await expectNoMessage(page, 'postalCode');
                    else await expectMessage(page, 'postalCode', errorMessage);
                });
            }
        });

        // The message text is replaced on every keystroke, not only shown or hidden:
        // the rules are checked one after the other, so a "+" at the end hides the "too short" problem behind another one
        test(`Meldung wechselt bei neuer/ anderer Falscheingabe (${FIELD_LABEL.phone})`, {
            ...expectedResult(
                `Nach dem Verlassen des Feldes mit „+(123)45“ steht „${ERROR_MESSAGE.phone.tooShort}“; `
                + `beim Tippen von „+“ wechselt sie direkt zu „${ERROR_MESSAGE.phone.plusNotAtStart}“, `
                + 'nach dem Löschen des „+“ wieder zurück – jeweils ohne das Feld erneut zu verlassen'
            ),
        }, async ({ page }) => {
            const phone = fieldInput(page, 'phone');
            await openDamageForm(page);
            await phone.pressSequentially('+(123)45');
            await phone.blur();
            await expectMessage(page, 'phone', ERROR_MESSAGE.phone.tooShort);

            await focusAtEnd(phone);

            const steps = [
                { key: '+', value: '+(123)45+', errorMessage: ERROR_MESSAGE.phone.plusNotAtStart },
                { key: 'Backspace', value: '+(123)45', errorMessage: ERROR_MESSAGE.phone.tooShort },
            ];
            for (const step of steps) {
                await test.step(`Taste „${step.key}“: im Feld steht „${step.value}“`, async () => {
                    await phone.press(step.key);
                    await expect(phone, 'Wert im Feld').toHaveValue(step.value);
                    await expect(phone, 'Cursor ist noch im Feld').toBeFocused();
                    await expectMessage(page, 'phone', step.errorMessage);
                });
            }
        });
    });

    // ─── B2: border of the active field ─────────────────────────
    // index.html removes the browser's focus outline (outline: none) – the green border is the only sign
    // of where the cursor is, which matters most for keyboard users.
    // :focus (green) and .is-invalid (red) are equally specific, so the rule further down in the CSS wins:
    // red must stay ahead, otherwise an invalid field would look fine as soon as the cursor is in it.
    test.describe('Umrandung des aktiven Feldes', () => {
        // computed values of --dellen_green and --error in index.html
        const GREEN = 'rgb(108, 209, 65)';
        const RED = 'rgb(255, 107, 107)';

        // Open the form without the 0.2 s colour transition: otherwise the first measurement right after
        // a click still shows the old colour, and "stays red" would pass even if the border turned green
        async function openFormWithoutTransition(page: Page) {
            await openDamageForm(page);
            await page.addStyleTag({ content: '.schaden-form__input { transition: none !important; }' });
        }

        for (const field of ALL_FIELDS.filter(field => field !== 'upload')) {
            test(`${FIELD_LABEL[field]}: aktives Feld ist grün umrandet`, expectedResult(
                'Nach dem Klick ins Feld ist der Rahmen grün; nach dem Verlassen (mit gültigem Wert) wieder wie vorher'
            ), async ({ page }) => {
                await openFormWithoutTransition(page);
                const input = fieldInput(page, field);
                const borderBefore = await input.evaluate(el => getComputedStyle(el).borderTopColor);
                expect(borderBefore, 'Rahmen ist schon vor dem Klick grün').not.toBe(GREEN);

                await input.click();
                await expect(input, 'Rahmen des aktiven Feldes').toHaveCSS('border-top-color', GREEN);

                await fillFields(page, [field]);
                await input.blur();
                await expect(input, 'Rahmen nach dem Verlassen des Feldes').toHaveCSS('border-top-color', borderBefore);
            });
        }

        test('Vorname: fehlerhaftes Feld bleibt rot, auch wenn es aktiv ist', expectedResult(
            'Nach ungültiger Eingabe und Verlassen ist der Rahmen rot; nach erneutem Klick ins Feld bleibt er rot statt grün'
        ), async ({ page }) => {
            await openFormWithoutTransition(page);
            const input = fieldInput(page, 'firstName');

            await input.fill('Anna1');
            await input.blur();
            await expectMessage(page, 'firstName', ERROR_MESSAGE.name.invalidCharacters);
            await expect(input, 'Rahmen nach dem Verlassen des Feldes').toHaveCSS('border-top-color', RED);

            await input.click();
            await expect(input, 'Feld ist wieder aktiv').toBeFocused();
            await expect(input, 'Rahmen des aktiven, fehlerhaften Feldes').toHaveCSS('border-top-color', RED);
        });
    });

    // ─── B3: character counter of the message ───────────────────
    test.describe('Zeichenzähler Mitteilung', () => {
        const COUNTER_TESTS: CounterTest[] = [
            { description: 'Kurzer Text', input: 'Delle', expectedCount: 5 },
            { description: 'Mehrere Zeilen (Zeilenumbruch zählt als 1 Zeichen)', input: 'Zeile 1\nZeile 2', expectedCount: 15 },
            { description: 'Genau 1000 Zeichen', input: 'x'.repeat(1000), expectedCount: 1000 },
            { description: '1001 Zeichen werden abgeschnitten', input: 'x'.repeat(1001), expectedCount: 1000 },
        ];

        for (const testCase of COUNTER_TESTS) {
            test(testCase.description, expectedResult(
                `Zähler zeigt vor der Eingabe „0 / 1000“, danach „${testCase.expectedCount} / 1000“`
            ), async ({ page }) => {
                await openDamageForm(page);
                await expect(messageCounter(page), 'Zähler vor der Eingabe').toHaveText('0 / 1000');

                await fieldInput(page, 'message').fill(testCase.input);
                await expect(messageCounter(page), 'Zähler nach der Eingabe').toHaveText(`${testCase.expectedCount} / 1000`);
            });
        }

        test('Nach dem Löschen des Textes', expectedResult(
            'Zähler geht nach dem Löschen zurück auf „0 / 1000“'
        ), async ({ page }) => {
            await openDamageForm(page);
            await fieldInput(page, 'message').fill(VALID_INPUTS.message);
            await expect(messageCounter(page), 'Zähler nach der Eingabe').toHaveText(`${VALID_INPUTS.message.length} / 1000`);

            await fieldInput(page, 'message').fill('');
            await expect(messageCounter(page), 'Zähler nach dem Löschen').toHaveText('0 / 1000');
        });

        test('Nach dem Entfernen der Leerzeichen außen', expectedResult(
            'Nach dem Verlassen des Feldes zählt der Zähler nur noch den gekürzten Text: „5 / 1000“'
        ), async ({ page }) => {
            await openDamageForm(page);
            await fieldInput(page, 'message').fill('  Delle  ');
            await expect(messageCounter(page), 'Zähler nach der Eingabe').toHaveText('9 / 1000');

            await fieldInput(page, 'message').blur();   // leave the field, the page trims leading and trailing spaces now
            await expect(fieldInput(page, 'message'), 'Leerzeichen außen entfernt').toHaveValue('Delle');
            await expect(messageCounter(page), 'Zähler nach dem Verlassen des Feldes').toHaveText('5 / 1000');
        });
    });

    // ─── B4: names of the selected files ────────────────────────
    test.describe('Dateinamen', () => {
        const FILE_NAMES_TESTS: FileNamesTest[] = [
            { description: 'Eine Datei', selections: [['delle.jpg']], expectedNames: 'delle.jpg' },
            { description: 'Mehrere Dateien, mit Komma getrennt', selections: [['delle.jpg', 'kratzer.jpg']], expectedNames: 'delle.jpg, kratzer.jpg' },
            { description: 'Neue Auswahl ersetzt die alte', selections: [['delle.jpg'], ['kratzer.jpg']], expectedNames: 'kratzer.jpg' },
            { description: 'Auswahl entfernt', selections: [['delle.jpg'], []], expectedNames: '' },
        ];

        for (const testCase of FILE_NAMES_TESTS) {
            const expectedResultText = testCase.expectedNames
                ? `Im Upload-Bereich steht „${testCase.expectedNames}“`
                : 'Im Upload-Bereich steht kein Dateiname mehr';

            test(testCase.description, expectedResult(expectedResultText), async ({ page }) => {
                await openDamageForm(page);
                await expect(fileNames(page), 'kein Dateiname vor der Auswahl').toBeEmpty();

                for (const selection of testCase.selections) {
                    await fieldInput(page, 'upload').setInputFiles(selection.map(inMemoryImage));
                }
                await expect(fileNames(page), 'Dateinamen nach der letzten Auswahl').toHaveText(testCase.expectedNames);
            });
        }
    });
});

// ─── Test set C: submit ─────────────────────────────────────────

// Press Tab until the element has focus – fails if it cannot be reached with the keyboard
async function tabTo(page: Page, element: Locator, maxTabs = 20) {
    for (let i = 0; i < maxTabs; i++) {
        if (await element.evaluate(el => el === document.activeElement)) return;
        await page.keyboard.press('Tab');
    }
    await expect(element, `nach ${maxTabs}× Tab nicht erreicht`).toBeFocused();
}

test.describe('Schaden-Formular: Absenden', () => {
    // ─── C1: different combinations of required fields ──────────
    test.describe('Kombinationen der Pflichtfelder', () => {
        const COMBINATION_TESTS: TestStep[] = [
            { name: 'Kein Feld', fields: [], focusedField: 'firstName' },
            { name: 'Nur Vorname', fields: ['firstName'], focusedField: 'lastName' },
            { name: 'Nur Nachname', fields: ['lastName'], focusedField: 'firstName' },
            { name: 'Nur Telefon', fields: ['phone'], focusedField: 'firstName' },
            { name: 'Vorname + Nachname', fields: ['firstName', 'lastName'], focusedField: 'phone' },
            { name: 'Vorname + Telefon', fields: ['firstName', 'phone'], focusedField: 'lastName' },
            { name: 'Nachname + Telefon', fields: ['lastName', 'phone'], focusedField: 'firstName' },
            { name: 'Alle Felder außer den Pflichtfeldern', fields: ALL_FIELDS.filter(field => !REQUIRED_FIELDS.includes(field)), focusedField: 'firstName' },
            { name: 'Alle Pflichtfelder', fields: REQUIRED_FIELDS },
            { name: 'Alle Eingabefelder', fields: ALL_FIELDS },
        ];

        for (const testCase of COMBINATION_TESTS) {
            const missingRequiredFields = REQUIRED_FIELDS.filter(requiredField => !testCase.fields.includes(requiredField));
            const allRequiredFilled = missingRequiredFields.length === 0;
            // Build the expected result from the table: are all required fields filled in?
            const expectedResultText = allRequiredFilled
                ? 'Anfrage wird abgeschickt, Danke-Ansicht mit Vornamen erscheint'
                : `${missingRequiredFields.length} Meldung(en) bei ${missingRequiredFields.map(field => FIELD_LABEL[field]).join(', ')}; Cursor im Feld „${testCase.focusedField && FIELD_LABEL[testCase.focusedField]}“`;

            test(`${testCase.name} gültig ausgefüllt, dann absenden`,
                { ...expectedResult(expectedResultText), tag: allRequiredFilled ? [] : ['@negative-test'] },
                async ({ page }) => {
                    await runScenario(page, [testCase]);
                });
        }
    });

    // ─── C2: with the keyboard ──────────────────────────────────
    // Tab to "Anfrage absenden", then Enter or Space.
    // The button ignores mousedown (see index.html) – the keyboard must not be affected by that.
    test.describe('Per Tastatur', () => {
        const SUBMIT_KEYS = [
            { key: 'Enter', description: 'Enter' },
            { key: 'Space', description: 'Leertaste' },
        ];

        for (const submitKey of SUBMIT_KEYS) {
            test(`Pflichtfelder gültig, mit Tab zum Button, mit ${submitKey.description} absenden`, expectedResult(
                `Button ist per Tab erreichbar; ${submitKey.description} sendet ab, Danke-Ansicht mit Vornamen erscheint`
            ), async ({ page }) => {
                await openDamageForm(page);
                await fillFields(page, REQUIRED_FIELDS);

                await tabTo(page, submitButton(page));
                await page.keyboard.press(submitKey.key);
                await expectSuccessfulSubmit(page);
            });
        }
    });

    // ─── C3: values are tidied up without leaving the field ─────
    // When a visitor submits without leaving the last field first, the field gets no blur event –
    // so the page must tidy up the values (trim leading and trailing spaces, join combined characters) during the submit itself.
    test.describe('Bereinigung der Werte ohne Verlassen des Feldes', () => {
        const DIRECT_SUBMIT_WAYS: { description: string; submit: (page: Page, field: InputField) => Promise<void> }[] = [
            { description: 'Klick auf den Button', submit: page => submit(page) },
            { description: 'Enter im Feld', submit: (page, field) => fieldInput(page, field).press('Enter') },
        ];

        for (const way of DIRECT_SUBMIT_WAYS) {
            // Firefox treats an email field with only spaces as invalid until its value is set again
            test(`Mail nur mit Leerzeichen, direkt absenden (${way.description})`, expectedResult(
                'Das freiwillige Mail-Feld blockiert das Absenden nicht, Danke-Ansicht mit Vornamen erscheint'
            ), async ({ page }) => {
                await openDamageForm(page);
                await fillFields(page, REQUIRED_FIELDS);
                await fillFields(page, ['email'], { email: '   ' });

                await way.submit(page, 'email');
                await expectSuccessfulSubmit(page);
            });

            // the value is read at the moment of the submit event – afterwards the page clears the form
            test(`Ort mit Leerzeichen außen, direkt absenden (${way.description})`, expectedResult(
                'Beim Absenden steht der Ort ohne die Leerzeichen außen im Feld („Graz“), Danke-Ansicht mit Vornamen erscheint'
            ), async ({ page }) => {
                await openDamageForm(page);
                await fillFields(page, REQUIRED_FIELDS);
                await fillFields(page, ['city'], { city: '  Graz  ' });

                const submittedValues = captureSubmittedValues(page);

                await way.submit(page, 'city');
                await expectSuccessfulSubmit(page);
                expect((await submittedValues).city, 'Ort beim Absenden ohne Leerzeichen außen').toBe('Graz');
            });

            // "ë" as "e" + diaeresis (see A1) – the first name is filled in last, so the submit itself must join them
            test(`Vorname mit Akzent aus zwei Zeichen, direkt absenden (${way.description})`, expectedResult(
                'Abgeschickt wird „Zoë“ mit „ë“ als einem Zeichen (3 statt 4 Zeichen), Danke-Ansicht mit diesem Vornamen erscheint'
            ), async ({ page }) => {
                const joinedName = 'Zoë'.normalize('NFC');
                await openDamageForm(page);
                await fillFields(page, ['lastName', 'phone']);
                await fillFields(page, ['firstName'], { firstName: joinedName.normalize('NFD') });

                const submittedValues = captureSubmittedValues(page);

                await way.submit(page, 'firstName');
                await expectSuccessfulSubmit(page, joinedName);
                expect((await submittedValues).firstName, 'Vorname beim Absenden als ein Zeichen „ë“').toBe(joinedName);
            });
        }
    });
});

// ─── Test set D: change values ──────────────────────────────────
type CorrectionTest = {
    // upload: its valid value is a file, not text that fits in a test title (separate test in D1);
    // message: it has no invalid value (see A8)
    field: Exclude<InputField, 'upload' | 'message'>;
    invalidInput: string;
};

// Create one test: fill in the required fields, enter an invalid value and submit – the submit must fail.
// Then overwrite the value with the valid one from VALID_INPUTS – message and red highlight must disappear,
// and the next submit must succeed.
function correctionTest(field: CorrectionTest['field'], invalidInput: string) {
    test(`${FIELD_LABEL[field]}: „${invalidInput}“ absenden, dann zu „${VALID_INPUTS[field]}“ korrigieren und erneut absenden`,
        {
            ...expectedResult('Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. '
                + 'Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.'),
        }, async ({ page }) => {
            await openDamageForm(page);
            await fillFields(page, REQUIRED_FIELDS.filter(requiredField => requiredField !== field));
            await fillFields(page, [field], { [field]: invalidInput });

            // Submit with Enter: the cursor stays in the field, so the message must come from the submit itself
            await fieldInput(page, field).press('Enter');
            await expectInvalidSubmit(page, [field], field);
            await expect(fieldInput(page, field), 'Feld rot markiert').toHaveClass(/is-invalid/);

            await fillFields(page, [field]);   // overwrite with the valid value from VALID_INPUTS

            await expectNoMessage(page, field);

            await submit(page);
            await expectSuccessfulSubmit(page);
        });
}

test.describe('Schaden-Formular: Werte ändern', () => {
    // ─── D1: correct invalid values ─────────────────────────────
    // Submit with an invalid value, correct it, submit again.
    // The tests for a single field have that field's tag.
    test.describe('Fehlerhafte Werte korrigieren', () => {
        // text fields: one test per field
        const CORRECTION_TESTS: CorrectionTest[] = [
            { field: 'firstName', invalidInput: 'St3fanie' },
            { field: 'lastName', invalidInput: 'Nach_name' },
            { field: 'phone', invalidInput: '123456' },
            { field: 'email', invalidInput: 'mailadresse.com' },
            { field: 'street', invalidInput: 'Gebäude #2' },
            { field: 'postalCode', invalidInput: '1O20' },
            { field: 'city', invalidInput: '0rt' },
        ];
        for (const testCase of CORRECTION_TESTS) {
            correctionTest(testCase.field, testCase.invalidInput);
        }

        // upload – same as correctionTest: fill in the required fields, select an invalid file and submit –
        // the submit must fail. Then select a valid file from VALID_INPUTS – message and red highlight
        // of the upload area must disappear, and the next submit must succeed.
        const invalidFile = { name: 'dokument.pdf', mimeType: 'application/pdf', buffer: Buffer.from('Testdokument') };

        test(`${FIELD_LABEL.upload}: „${invalidFile.name}“ absenden, dann „${VALID_INPUTS.upload.name}“ auswählen und erneut absenden`,
            {
                ...expectedResult('Erstes Absenden scheitert: Meldung nur beim Upload, Upload-Bereich rot markiert, Cursor im Upload. '
                    + 'Nach der neuen Auswahl verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.'),
            }, async ({ page }) => {
                await openDamageForm(page);
                await fillFields(page, REQUIRED_FIELDS);
                await fieldInput(page, 'upload').setInputFiles(invalidFile);   // the page validates right after selection

                await submit(page);
                await expectInvalidSubmit(page, ['upload'], 'upload');
                await expectUploadMessage(page, ERROR_MESSAGE.upload.notImageOrVideo(invalidFile.name));

                await fieldInput(page, 'upload').setInputFiles(VALID_INPUTS.upload);   // new selection with the valid file

                await expectNoUploadMessage(page);

                await submit(page);
                await expectSuccessfulSubmit(page);
            });

        // several errors at once, fixed one after the other – after each submit the cursor jumps
        // to the first field that still has a message (also to an optional field once all required fields are filled in).
        test('Nachname fehlt, Mail und PLZ ungültig, dann nacheinander ergänzen/korrigieren und jeweils absenden', expectedResult(
            'Nach jedem Absenden Meldungen nur bei den noch fehlerhaften Feldern, Cursor im ersten davon (Nachname, dann Mail, dann PLZ); '
            + 'nach der letzten Korrektur Danke-Ansicht'
        ), async ({ page }) => {
            await runScenario(page, [
                {
                    name: 'Vorname + Telefon gültig, Mail + PLZ ungültig', fields: ['firstName', 'phone', 'email', 'postalCode'],
                    values: { email: 'mailadresse.com', postalCode: '1O20' }, invalidFields: ['email', 'postalCode'], focusedField: 'lastName',
                },
                { name: 'Nachname', fields: ['lastName'], focusedField: 'email' },
                { name: 'Mail korrigiert', fields: ['email'], focusedField: 'postalCode' },
                { name: 'PLZ korrigiert', fields: ['postalCode'] },
            ]);
        });
    });

    // ─── D2: add missing values ─────────────────────────────────
    test.describe('Fehlende Werte ergänzen', () => {
        // first name, then add last name, then add phone
        test('Vorname gültig, dann absenden, dann gültigen Nachnamen ergänzen, absenden, dann gültiges Telefon ergänzen, absenden', expectedResult(
            'Erstes Absenden scheitert: Meldungen bei Nachname und Telefon, Cursor im Nachnamen; '
            + 'zweites scheitert: Meldung nur bei Telefon, Cursor im Telefon; drittes zeigt die Danke-Ansicht'
        ), async ({ page }) => {
            await runScenario(page, [
                { name: 'Vorname', fields: ['firstName'], focusedField: 'lastName' },
                { name: 'Nachname', fields: ['lastName'], focusedField: 'phone' },
                { name: 'Telefon', fields: ['phone'] },
            ]);
        });

        // first name + last name, then add all other values
        test('Vorname + Nachname gültig, dann absenden, dann alle anderen Eingaben ergänzen, absenden', expectedResult(
            'Erstes Absenden scheitert: Meldung bei Telefon, Cursor im Telefon; nach dem Ergänzen zeigt das zweite Absenden die Danke-Ansicht'
        ), async ({ page }) => {
            await runScenario(page, [
                { name: 'Vorname + Nachname', fields: ['firstName', 'lastName'], focusedField: 'phone' },
                { name: 'alle weiteren Felder', fields: ALL_FIELDS.filter(field => field !== 'firstName' && field !== 'lastName') },
            ]);
        });
    });

    // ─── D3: overwrite values ───────────────────────────────────
    // The thank-you screen only shows the first name – so the tests check the values that are submitted
    test.describe('Werte überschreiben', () => {
        // before submitting
        test('Werte vor Absenden überschreiben', expectedResult(
            'Abgeschickt werden die neuen Werte aller Felder und die neue Datei, neuer Vorname erscheint in der Danke-Ansicht'
        ), async ({ page }) => {
            await openDamageForm(page);
            const submittedValues = captureSubmittedValues(page);

            await fillFields(page, ALL_FIELDS);
            await fillFields(page, ALL_FIELDS, VALID_INPUTS_OVERRIDE);
            await submit(page);

            await expectSuccessfulSubmit(page, VALID_INPUTS_OVERRIDE.firstName);
            expect(await submittedValues, 'abgeschickte Werte').toEqual(submittedValuesOf(VALID_INPUTS_OVERRIDE));
        });

        // after an UNSUCCESSFUL submit
        test('Werte nach nicht erfolgreichem Absenden überschreiben', expectedResult(
            'Erstes Absenden scheitert (Telefon fehlt); danach abgeschickt werden die neuen Werte aller Felder und die neue Datei, '
            + 'neuer Vorname erscheint in der Danke-Ansicht'
        ), async ({ page }) => {
            await openDamageForm(page);
            const submittedValues = captureSubmittedValues(page);

            await fillFields(page, ['firstName', 'lastName']);
            await submit(page);
            await expectInvalidSubmit(page, ['phone'], 'phone');

            await fillFields(page, ALL_FIELDS, VALID_INPUTS_OVERRIDE);
            await submit(page);

            await expectSuccessfulSubmit(page, VALID_INPUTS_OVERRIDE.firstName);
            expect(await submittedValues, 'abgeschickte Werte').toEqual(submittedValuesOf(VALID_INPUTS_OVERRIDE));
        });
    });
});

// ─── Test set E: thank-you screen ───────────────────────────────
test.describe('Schaden-Formular: Danke-Ansicht schließen', () => {
    // E1: close the thank-you screen in every way
    for (const closeWay of Object.keys(CLOSE_WAYS) as CloseWay[]) {
        test(`Danke-Ansicht mit ${CLOSE_WAYS[closeWay].description} schließen`, expectedResult(
            'Overlay ist geschlossen, Seite ist wieder scrollbar'
        ), async ({ page }) => {
            await openDamageForm(page);
            await fillFields(page, REQUIRED_FIELDS);
            await submit(page);
            await expectSuccessfulSubmit(page);
            await closeOverlay(page, closeWay);
        });
    }

    // E2: close the thank-you screen and reopen the form
    test('Danke-Ansicht schließen und Overlay erneut öffnen', expectedResult(
        'Formular statt Danke-Ansicht sichtbar; alle Felder leer, keine Meldungen, keine roten Markierungen, Zähler auf „0 / 1000“, kein Dateiname'
    ), async ({ page }) => {
        await openDamageForm(page);
        await fillFields(page, ALL_FIELDS);
        await submit(page);
        await expectSuccessfulSubmit(page);
        await closeOverlay(page, 'button');

        await openOverlay(page);
        await expectEmptyForm(page);
    });

    // E3: the page remembers which fields have already been left – from then on it checks them on every keystroke (see B1).
    // The submit must reset this as well: otherwise, after reopening, the first keystroke would already show a message.
    // Messages themselves cannot be left over – a submit only succeeds once every field is valid.
    test('Nach dem Absenden zeigen Felder ihre Meldung erst nach dem Verlassen', {
        ...expectedResult(
            'PLZ ausgefüllt, verlassen und abgeschickt; nach dem Schließen und erneuten Öffnen während der Eingabe von „123“ keine Meldung, '
            + `nach dem Verlassen des Feldes Meldung „${ERROR_MESSAGE.postalCode.invalidLength}“, Feld rot markiert`
        ),
    }, async ({ page }) => {
        const postalCode = fieldInput(page, 'postalCode');
        await openDamageForm(page);
        await fillFields(page, [...REQUIRED_FIELDS, 'postalCode']);
        await postalCode.blur();   // leave the field: from now on the page checks it on every keystroke
        await submit(page);
        await expectSuccessfulSubmit(page);
        await closeOverlay(page, 'button');
        await openOverlay(page);

        await postalCode.pressSequentially('123');
        await expect(postalCode, 'Cursor ist noch im Feld').toBeFocused();
        await expectNoMessage(page, 'postalCode');

        await postalCode.blur();
        await expectMessage(page, 'postalCode', ERROR_MESSAGE.postalCode.invalidLength);
    });

    // E4: the whole flow using only the keyboard – on submit the form disappears, and the focus with it.
    // The page moves the focus to "Schließen", otherwise the next Tab would start somewhere behind the overlay.
    test('Fokus liegt nach dem Absenden auf „Schließen“, Enter schließt das Overlay', expectedResult(
        'Nach dem Absenden hat der Button „Schließen“ der Danke-Ansicht den Fokus; Enter schließt das Overlay, Seite ist wieder scrollbar'
    ), async ({ page }) => {
        await openDamageForm(page);
        await fillFields(page, REQUIRED_FIELDS);
        await fieldInput(page, 'phone').press('Enter');
        await expectSuccessfulSubmit(page);

        await expect(thankYouCloseButton(page), 'Fokus auf dem Button „Schließen“').toBeFocused();
        await page.keyboard.press('Enter');
        await expectOverlayClosed(page);
    });
});

// ─── Test set F: close the overlay ──────────────────────────────
test.describe('Schaden-Formular: Overlay schließen', () => {
    // F1: close the form in every way
    for (const closeWay of FORM_CLOSE_WAYS) {
        test(`Formular mit ${CLOSE_WAYS[closeWay].description} schließen`, expectedResult(
            'Overlay ist geschlossen, Seite ist wieder scrollbar'
        ), async ({ page }) => {
            await openDamageForm(page);
            await closeOverlay(page, closeWay);
        });
    }

    // F2: a click inside the form keeps the overlay open
    test('Klick in das Formular lässt das Overlay offen', expectedResult(
        'Overlay bleibt geöffnet'
    ), async ({ page }) => {
        await openDamageForm(page);
        await overlay(page).getByRole('heading', { name: 'Schaden checken' }).click();
        await expect(overlay(page), 'Overlay bleibt geöffnet').toHaveClass(/is-open/);
    });

    // F3: the page cannot be scrolled while the overlay is open
    test('Seite ist bei offenem Overlay nicht scrollbar', expectedResult(
        'Scrollen der Seite ist gesperrt, solange das Overlay offen ist; Scrollen erst nach dem Schließen wieder möglich'
    ), async ({ page }) => {
        const body = page.locator('body');
        await page.goto('/');
        await expect(body, 'Seite ist vor dem Öffnen scrollbar').not.toHaveCSS('overflow', 'hidden');

        await openOverlay(page);
        await expect(body, 'Seite ist bei offenem Overlay gesperrt').toHaveCSS('overflow', 'hidden');

        await closeOverlay(page, 'x');   // also checks that the page can be scrolled again
    });

    // F4: reopening
    test('Befülltes Formular ist nach dem Schließen beim erneuten Öffnen weiterhin befüllt', expectedResult(
        'Formular sichtbar; alle Felder, Zähler und Dateiname wie vor dem Schließen'
    ), async ({ page }) => {
        await openDamageForm(page);
        await fillFields(page, ALL_FIELDS);
        await closeOverlay(page, 'escape');
        await openOverlay(page);

        await test.step('alle Felder haben vorherigen Wert', async () => {
            for (const field of ALL_FIELDS) {
                if (field === 'upload') continue;
                await expect(fieldInput(page, field), `„${FIELD_LABEL[field]}“ entspricht dem Wert vor dem Schließen`).toHaveValue(VALID_INPUTS[field]);
            }
        });

        await expect(messageCounter(page), 'Zähler zeigt weiterhin die Länge der Nachricht').toHaveText(`${VALID_INPUTS.message.length} / 1000`);
        await expect(fileNames(page), 'ausgewählte Datei entspricht der Vorherigen').toHaveText(VALID_INPUTS.upload.name);
    });

    // F5: closing without submitting keeps the values (F4) – so a message for an invalid value must stay as well,
    // otherwise the field would look fine until the next submit
    test('Meldung und roter Rahmen bleiben nach dem Schließen erhalten, kein Feld ist aktiv', expectedResult(
        'Nach erneutem Öffnen: ungültiger Wert, Meldung und roter Rahmen wie vor dem Schließen; das zuletzt aktive Feld ist nicht mehr aktiv'
    ), async ({ page }) => {
        await openDamageForm(page);
        await fieldInput(page, 'firstName').fill('Anna1');
        // leave the field by clicking into the next one: the message appears, and the cursor
        // is still in the form when it is closed
        await fieldInput(page, 'lastName').click();
        await expectMessage(page, 'firstName', ERROR_MESSAGE.name.invalidCharacters);
        await expect(fieldInput(page, 'lastName'), 'Nachname ist vor dem Schließen aktiv').toBeFocused();

        await closeOverlay(page, 'escape');
        await openOverlay(page);

        await expect(fieldInput(page, 'firstName'), 'ungültiger Wert ist noch da').toHaveValue('Anna1');
        await expectMessage(page, 'firstName', ERROR_MESSAGE.name.invalidCharacters);
        await expectNoActiveField(page);
    });
});
