import { test, expect, type Page, type Locator, type PlaywrightWorkerOptions } from '@playwright/test';
import * as fs from 'fs';
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

// Tag per field: used by the validation group and the correction test of the field,
// so all tests of one field can be run together, e.g. npx playwright test --grep @validierung-plz
const VALIDATION_TAG: Record<InputField, string> = {
    firstName: '@validierung-vorname',
    lastName: '@validierung-nachname',
    phone: '@validierung-telefon',
    email: '@validierung-mail',
    street: '@validierung-strasse',
    postalCode: '@validierung-plz',
    city: '@validierung-ort',
    message: '@validierung-mitteilung',
    upload: '@validierung-upload',
};

// Tag of the group "Werte korrigieren": runs all correction tests, e.g. npx playwright test --grep @korrektur
const CORRECTION_TAG = '@korrektur';

const REQUIRED_FIELDS: InputField[] = ['firstName', 'lastName', 'phone'];
const ALL_FIELDS = Object.keys(FIELD_ID) as InputField[];

// ─── Error messages (verbatim from index.html, RULES) ───────────
// Left out: the "too long" messages for name, email and message –
// maxlength cuts the input before these rules can apply
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

// The overlay, the button that sends the form and the heading of the thank-you view
const overlay = (page: Page) => page.getByRole('dialog', { name: 'Schaden einreichen' });
const submitButton = (page: Page) => overlay(page).getByRole('button', { name: 'Anfrage absenden' });
const thankYouHeading = (page: Page) => overlay(page).getByRole('heading', { name: /^Danke für Ihre Anfrage/ });

// Input element of a field, found by its label the way a visitor finds it
const fieldInput = (page: Page, field: InputField) => overlay(page).getByLabel(FIELD_LABEL_ON_PAGE[field], { exact: true });
// Error message below a field: a plain text without a role, so it is found by its id
const fieldError = (page: Page, field: InputField) => page.locator(`#${FIELD_ID[field]}-error`);

// Character counter below the message field, the upload area (marked red on errors)
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
// messages only at these fields, cursor in the first of them, form still open
async function expectInvalidSubmit(page: Page, fieldsWithMessage: InputField[], focusedField?: InputField) {
    // Abort if the submit must fail but no cursor position is given
    if (!focusedField) throw new Error('Testschritt ohne focusedField, obwohl das Absenden scheitern muss');

    // Message only at the given fields, no hint at any other field
    await test.step(`Meldungen und Cursor-Position korrekt`, async () => {
        for (const field of ALL_FIELDS) {
            if (fieldsWithMessage.includes(field)) {
                await expect(fieldError(page, field), `Meldung bei "${FIELD_LABEL[field]}"`).not.toBeEmpty();
            } else {
                await expect(fieldError(page, field), `keine Meldung bei "${FIELD_LABEL[field]}"`).toBeEmpty();
            }
        }
        await expect(fieldInput(page, focusedField), 'Cursor im ersten Feld mit Meldung').toBeFocused();
    });

    await expect(thankYouHeading(page), 'Danke-Ansicht wird nicht angezeigt').toBeHidden();
    await expect(overlay(page), 'Schaden-Formular bleibt geöffnet').toHaveClass(/is-open/);
}

// After a successful submit: the thank-you view with the first name replaces the form
async function expectSuccessfulSubmit(page: Page, firstName = VALID_INPUTS.firstName) {
    await expect(thankYouHeading(page), 'Anzeige der Danke-Ansicht').toBeVisible();
    await expect(thankYouHeading(page), `Vorname in der Danke-Ansicht: "${firstName}"`).toHaveText(`Danke für Ihre Anfrage, ${firstName}!`);
    await expect(submitButton(page), 'Schaden-Formular ist nicht mehr sichtbar').toBeHidden();
}

// After reopening: the empty form instead of the thank-you view – no values, no messages, no red marking
async function expectEmptyForm(page: Page) {
    await expect(submitButton(page), 'Formular ist sichtbar').toBeVisible();
    await expect(thankYouHeading(page), 'Danke-Ansicht ist nicht mehr sichtbar').toBeHidden();

    await test.step('alle Felder leer, ohne Meldung und nicht rot markiert', async () => {
        for (const field of ALL_FIELDS) {
            // for the upload, the upload area is marked red, not the file input itself
            const markedElement = field === 'upload' ? uploadArea(page) : fieldInput(page, field);
            await expect(fieldInput(page, field), `"${FIELD_LABEL[field]}" ist leer`).toHaveValue('');
            await expect(fieldError(page, field), `keine Meldung bei "${FIELD_LABEL[field]}"`).toBeEmpty();
            await expect(markedElement, `"${FIELD_LABEL[field]}" ist nicht rot markiert`).not.toHaveClass(/is-invalid/);
        }
    });

    await expect(messageCounter(page), 'Zähler steht wieder auf 0').toHaveText('0 / 1000');
    await expect(fileNames(page), 'kein Dateiname mehr angezeigt').toBeEmpty();
}

// Open the form and run the steps one after the other: fill in, submit, check.
// As long as required fields are missing or fields have an invalid value, the submit must fail
// with messages at exactly these fields – once everything is filled in correctly, it must succeed.
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
            // remember the first name entered last, it must appear in the thank-you view
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

// Text for the expected result: the value the page leaves in the field.
// Long values (e.g. 'x'.repeat(1000)) only with their length, so the documentation stays readable
function expectedValueText(expectedValue: string) {
    if (expectedValue === '') return 'Feld danach leer';
    if (expectedValue.length > 40) return `Wert im Feld danach ${expectedValue.length} Zeichen lang`;
    return `Wert im Feld danach „${expectedValue}“`;
}

// Create one test per table row: enter the value, leave the field,
// then check the message, the red marking and – if given – the value the page has changed
function validationTests(testCases: ValidationTest[], field: InputField) {
    for (const testCase of testCases) {
        const messageText = testCase.errorMessage
            ? `Meldung „${testCase.errorMessage}“, Feld rot markiert`
            : 'keine Meldung, Feld nicht rot markiert';
        const expectedResultText = testCase.expectedValue === undefined
            ? messageText
            : `${messageText}; ${expectedValueText(testCase.expectedValue)}`;

        test(`${FIELD_LABEL[field]}: ${testCase.description}`,
            { ...expectedResult(expectedResultText), tag: testCase.errorMessage ? '@negativtest' : '@positivtest' },
            async ({ page, browserName }) => {
                test.skip(testCase.browsers !== undefined && !testCase.browsers.includes(browserName),
                    `nur für ${testCase.browsers?.join(', ')}`);
                await openDamageForm(page);
                await fieldInput(page, field).fill(testCase.input);
                await fieldInput(page, field).blur();   // leave the field, the page validates now

                if (testCase.errorMessage) {
                    const errorMessage = testCase.errorMessage;

                    await test.step('Fehlermeldung und rote Markierung', async () => {
                        await expect(fieldError(page, field), 'Meldung unter dem Feld').toHaveText(errorMessage);
                        await expect(fieldInput(page, field), 'Feld rot markiert').toHaveClass(/is-invalid/);
                    });
                } else {
                    await test.step('kein Hinweis und keine rote Markierung', async () => {
                        await expect(fieldError(page, field), 'keine Meldung').toBeEmpty();
                        await expect(fieldInput(page, field), 'Feld nicht rot markiert').not.toHaveClass(/is-invalid/);
                    });
                }
                if (testCase.expectedValue !== undefined) {
                    await expect(fieldInput(page, field), 'Wert im Feld korrekt ersetzt').toHaveValue(testCase.expectedValue);
                }
            });
    }
}

// Create one test: fill in the required fields, enter an invalid value and submit – the submit must fail.
// Then overwrite the value with the valid one from VALID_INPUTS – message and red marking must disappear,
// and the next submit must succeed.
// upload is excluded: its valid value is a file, not a text for the test title
function correctionTest(field: Exclude<InputField, 'upload'>, invalidInput: string) {
    test(`${FIELD_LABEL[field]}: „${invalidInput}“ absenden, dann zu „${VALID_INPUTS[field]}“ korrigieren und erneut absenden`,
        {
            ...expectedResult('Erstes Absenden scheitert: Meldung nur bei diesem Feld, Feld rot markiert, Cursor im Feld. '
                + 'Nach der Korrektur verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.'),
            tag: [CORRECTION_TAG, VALIDATION_TAG[field]],
        }, async ({ page }) => {
            await openDamageForm(page);
            await fillFields(page, REQUIRED_FIELDS.filter(requiredField => requiredField !== field));
            await fillFields(page, [field], { [field]: invalidInput });

            // Submit with Enter: the cursor stays in the field, so the message must come from the submit itself
            await fieldInput(page, field).press('Enter');
            await expectInvalidSubmit(page, [field], field);
            await expect(fieldInput(page, field), 'Feld rot markiert').toHaveClass(/is-invalid/);

            await fillFields(page, [field]);   // overwrite with the valid value from VALID_INPUTS

            await test.step('kein Hinweis und keine rote Markierung', async () => {
                await expect(fieldError(page, field), 'keine Meldung').toBeEmpty();
                await expect(fieldInput(page, field), 'Feld nicht rot markiert').not.toHaveClass(/is-invalid/);
            });

            await submit(page);
            await expectSuccessfulSubmit(page);
        });
}

// ─── Test set A: different combinations of required fields ──────
test.describe('Schaden-Formular: verschiedene Kombinationen der Pflichtfelder', () => {
    const testCasesA: TestStep[] = [
        { name: 'kein Feld', fields: [], focusedField: 'firstName' },
        { name: 'nur Vorname', fields: ['firstName'], focusedField: 'lastName' },
        { name: 'nur Nachname', fields: ['lastName'], focusedField: 'firstName' },
        { name: 'nur Telefon', fields: ['phone'], focusedField: 'firstName' },
        { name: 'Vorname + Nachname', fields: ['firstName', 'lastName'], focusedField: 'phone' },
        { name: 'Vorname + Telefon', fields: ['firstName', 'phone'], focusedField: 'lastName' },
        { name: 'Nachname + Telefon', fields: ['lastName', 'phone'], focusedField: 'firstName' },
        { name: 'alle Felder außer den Pflichtfeldern', fields: ALL_FIELDS.filter(field => !REQUIRED_FIELDS.includes(field)), focusedField: 'firstName' },
        { name: 'alle Pflichtfelder', fields: REQUIRED_FIELDS },
        { name: 'alle Eingabefelder', fields: ALL_FIELDS },
    ];
    for (const testCase of testCasesA) {
        const missingRequiredFields = REQUIRED_FIELDS.filter(requiredField => !testCase.fields.includes(requiredField));
        const allRequiredFilled = missingRequiredFields.length === 0;
        // Build the expected result from the table: are all required fields filled in?
        const expectedResultText = allRequiredFilled
            ? `Anfrage wird abgeschickt, Danke-Ansicht mit Vornamen erscheint`
            : `${missingRequiredFields.length} Meldung(en) bei ${missingRequiredFields.map(field => FIELD_LABEL[field]).join(', ')}; Cursor im Feld „${testCase.focusedField && FIELD_LABEL[testCase.focusedField]}“`;

        test(`${testCase.name} gültig ausgefüllt, dann absenden`,
            { ...expectedResult(expectedResultText), tag: allRequiredFilled ? '@positivtest' : '@negativtest' },
            async ({ page }) => {
                await runScenario(page, [testCase]);
            });
    }
});

// ─── Test set B: input fields ───────────────────────────────────
// Validation of every field (B1-B8, B10), the character counter (B9) and the file names (B11)

// 'chromium' | 'firefox' | 'webkit' – the same type Playwright uses for browserName
type BrowserName = PlaywrightWorkerOptions['browserName'];

type ValidationTest = {
    description: string;
    input: string;
    errorMessage?: string;
    expectedValue?: string;     // only set if the page changes the value
    browsers?: BrowserName[];   // only set if the browsers behave differently; the test runs only in these
};

// Title of the outer group for all fields. Playwright shows the blocks with this title one after the other;
// the inner group per field keeps them apart in the report and in dokuTestcases.md
const VALIDATION_GROUP = 'Schaden-Formular: Werte validieren';

// ─── Test set B1: first name ────────────────────────────────────
const FIRST_NAME_TESTS: ValidationTest[] = [
    // POSITIVE TESTS
    { description: 'genau 2 Zeichen', input: 'Al' },
    { description: 'genau 50 Zeichen', input: 'A'.repeat(50) },
    { description: 'Umlaute', input: 'Jürgen' },
    { description: 'Akzente', input: 'Zoë' },
    // "ë" as two characters: normalize('NFD') splits it into "e" + combining diaeresis (U+0308),
    // as it happens when pasting – the page must join them again (normalize('NFC'))
    { description: 'Akzent aus zwei Zeichen (e + Trema, z. B. beim Einfügen)', input: 'Zoë'.normalize('NFD') },
    { description: 'andere Schrift', input: 'Иван' },
    { description: 'Bindestrich zwischen Buchstaben', input: 'Anne-Marie' },
    { description: 'Leerzeichen zwischen Buchstaben', input: 'Mary Ann' },
    { description: 'Apostroph', input: "D'Angelo" },
    { description: 'typografischer Apostroph', input: 'D’Angelo' },
    { description: 'Leerzeichen außen werden entfernt', input: '  Anna  ', expectedValue: 'Anna' },
    { description: '51 Zeichen werden abgeschnitten', input: 'A'.repeat(51), expectedValue: 'A'.repeat(50) },

    // NEGATIVE TESTS
    { description: 'nur Leerzeichen', input: '   ', errorMessage: ERROR_MESSAGE.name.firstNameEmpty },
    { description: '1 Zeichen', input: 'A', errorMessage: ERROR_MESSAGE.name.tooShort },
    { description: 'Ziffer', input: 'Anna1', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
    { description: 'Sonderzeichen', input: 'Anna!', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
    { description: 'Bindestrich am Anfang', input: '-Anna', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
    { description: 'Bindestrich am Ende', input: 'Anna-', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
    { description: 'doppelter Bindestrich', input: 'Anna--Lena', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
    { description: 'doppeltes Leerzeichen innen', input: 'Anna  Lena', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
];

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.firstName, { tag: VALIDATION_TAG.firstName }, () => {
        validationTests(FIRST_NAME_TESTS, 'firstName');
    });
});

// ─── Test set B2: last name ─────────────────────────────────────
const LAST_NAME_TESTS: ValidationTest[] = [
    // POSITIVE TESTS
    { description: 'genau 2 Zeichen', input: 'Li' },
    { description: 'genau 50 Zeichen', input: 'B'.repeat(50) },
    { description: 'Umlaute', input: 'Müller' },
    { description: 'Akzente', input: 'Brontë' },
    // "ë" as two characters: normalize('NFD') splits it into "e" + combining diaeresis (U+0308),
    // as it happens when pasting – the page must join them again (normalize('NFC'))
    { description: 'Akzent aus zwei Zeichen (e + Trema, z. B. beim Einfügen)', input: 'Brontë'.normalize('NFD') },
    { description: 'andere Schrift', input: 'Иванов' },
    { description: 'Bindestrich zwischen Buchstaben', input: 'Müller-Lüdenscheidt' },
    { description: 'Leerzeichen zwischen Buchstaben', input: 'von Bülow' },
    { description: 'Apostroph', input: "O'Brien" },
    { description: 'typografischer Apostroph', input: 'O’Brien' },
    { description: 'Leerzeichen außen werden entfernt', input: '  Kunde  ', expectedValue: 'Kunde' },
    { description: '51 Zeichen werden abgeschnitten', input: 'B'.repeat(51), expectedValue: 'B'.repeat(50) },

    // NEGATIVE TESTS
    { description: 'nur Leerzeichen', input: '   ', errorMessage: ERROR_MESSAGE.name.lastNameEmpty },
    { description: '1 Zeichen', input: 'B', errorMessage: ERROR_MESSAGE.name.tooShort },
    { description: 'Ziffer', input: 'Kunde1', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
    { description: 'Sonderzeichen', input: 'Kunde&Co', errorMessage: ERROR_MESSAGE.name.invalidCharacters },
    { description: 'Bindestrich am Anfang', input: '-Kunde', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
    { description: 'Bindestrich am Ende', input: 'Kunde-', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
    { description: 'doppelter Bindestrich', input: 'Müller--Lüdenscheidt', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
    { description: 'doppeltes Leerzeichen innen', input: 'von  Bülow', errorMessage: ERROR_MESSAGE.name.misplacedSeparator },
];

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.lastName, { tag: VALIDATION_TAG.lastName }, () => {
        validationTests(LAST_NAME_TESTS, 'lastName');
    });
});

// ─── Test set B3: phone ─────────────────────────────────────────
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
    { description: 'Leerzeichen außen werden entfernt', input: '  0176 123456  ', expectedValue: '0176 123456' },

    // NEGATIVE TESTS
    { description: 'nur Leerzeichen', input: '   ', errorMessage: ERROR_MESSAGE.phone.empty },
    { description: 'Buchstaben', input: '0176 abc', errorMessage: ERROR_MESSAGE.phone.invalidCharacters },
    { description: 'Punkt', input: '089.123456', errorMessage: ERROR_MESSAGE.phone.invalidCharacters },
    { description: '+ in der Mitte', input: '0176+123456', errorMessage: ERROR_MESSAGE.phone.plusNotAtStart },
    { description: 'doppeltes +', input: '++49 176 123456', errorMessage: ERROR_MESSAGE.phone.plusNotAtStart },
    { description: 'ohne Vorwahl', input: '176 123456', errorMessage: ERROR_MESSAGE.phone.missingAreaCode },
    { description: '5 Ziffern', input: '01234', errorMessage: ERROR_MESSAGE.phone.tooShort },
    { description: '16 Ziffern', input: '0' + '1'.repeat(15), errorMessage: ERROR_MESSAGE.phone.tooLong },
];

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.phone, { tag: VALIDATION_TAG.phone }, () => {
        validationTests(PHONE_TESTS, 'phone');
    });
});

// ─── Test set B4: email ─────────────────────────────────────────
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
];

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.email, { tag: VALIDATION_TAG.email }, () => {
        validationTests(EMAIL_TESTS, 'email');
    });
});

// ─── Test set B5: street ────────────────────────────────────────
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

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.street, { tag: VALIDATION_TAG.street }, () => {
        validationTests(STREET_TESTS, 'street');
    });
});

// ─── Test set B6: postal code ───────────────────────────────────
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

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.postalCode, { tag: VALIDATION_TAG.postalCode }, () => {
        validationTests(POSTAL_CODE_TESTS, 'postalCode');
    });
});

// ─── Test set B7: city ──────────────────────────────────────────
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

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.city, { tag: VALIDATION_TAG.city }, () => {
        validationTests(CITY_TESTS, 'city');
    });
});

// ─── Test set B8: message ───────────────────────────────────────
// Positive tests only: the single rule (at most 1000 characters) cannot be violated because of maxlength="1000"
const MESSAGE_TESTS: ValidationTest[] = [
    { description: 'leer (optionales Feld)', input: '' },
    { description: 'nur Leerzeichen werden entfernt', input: '   ', expectedValue: '' },
    { description: 'kurzer Text', input: 'Delle in der Fahrertür.' },
    { description: 'mehrere Zeilen', input: 'Zeile 1\nZeile 2' },
    { description: 'Sonderzeichen und Emoji', input: 'Delle <links> & rechts 🚗?!..."§$%&/()=' },
    { description: 'genau 1000 Zeichen', input: 'x'.repeat(1000) },
    { description: '1001 Zeichen werden abgeschnitten', input: 'x'.repeat(1001), expectedValue: 'x'.repeat(1000) },
    { description: 'Leerzeichen außen werden entfernt', input: '  Delle  ', expectedValue: 'Delle' },
];

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.message, { tag: VALIDATION_TAG.message }, () => {
        validationTests(MESSAGE_TESTS, 'message');
    });
});

// ─── Test set B9: character counter of the message ──────────────
type CounterTest = {
    description: string;
    input: string;
    expectedCount: number;
};

const COUNTER_TESTS: CounterTest[] = [
    { description: 'kurzer Text', input: 'Delle', expectedCount: 5 },
    { description: 'mehrere Zeilen (Zeilenumbruch zählt als 1 Zeichen)', input: 'Zeile 1\nZeile 2', expectedCount: 15 },
    { description: 'genau 1000 Zeichen', input: 'x'.repeat(1000), expectedCount: 1000 },
    { description: '1001 Zeichen werden abgeschnitten', input: 'x'.repeat(1001), expectedCount: 1000 },
];

test.describe('Schaden-Formular: Zeichenzähler Mitteilung', { tag: '@zeichenzaehler' }, () => {
    for (const testCase of COUNTER_TESTS) {
        test(`${FIELD_LABEL.message}: Zeichenzähler bei ${testCase.description}`, expectedResult(
            `Zähler zeigt vor der Eingabe „0 / 1000“, danach „${testCase.expectedCount} / 1000“`
        ), async ({ page }) => {
            await openDamageForm(page);
            await expect(messageCounter(page), 'Zähler vor der Eingabe').toHaveText('0 / 1000');

            await fieldInput(page, 'message').fill(testCase.input);
            await expect(messageCounter(page), 'Zähler nach der Eingabe').toHaveText(`${testCase.expectedCount} / 1000`);
        });
    }

    test(`${FIELD_LABEL.message}: Zeichenzähler nach dem Löschen des Textes`, expectedResult(
        'Zähler geht nach dem Löschen zurück auf „0 / 1000“'
    ), async ({ page }) => {
        await openDamageForm(page);
        await fieldInput(page, 'message').fill(VALID_INPUTS.message);
        await expect(messageCounter(page), 'Zähler nach der Eingabe').toHaveText(`${VALID_INPUTS.message.length} / 1000`);

        await fieldInput(page, 'message').fill('');
        await expect(messageCounter(page), 'Zähler nach dem Löschen').toHaveText('0 / 1000');
    });

    test(`${FIELD_LABEL.message}: Zeichenzähler nach dem Entfernen der Leerzeichen außen`, expectedResult(
        'Nach dem Verlassen des Feldes zählt der Zähler nur noch den gekürzten Text: „5 / 1000“'
    ), async ({ page }) => {
        await openDamageForm(page);
        await fieldInput(page, 'message').fill('  Delle  ');
        await expect(messageCounter(page), 'Zähler nach der Eingabe').toHaveText('9 / 1000');

        await fieldInput(page, 'message').blur();   // leave the field, the page removes the outer spaces now
        await expect(fieldInput(page, 'message'), 'Leerzeichen außen entfernt').toHaveValue('Delle');
        await expect(messageCounter(page), 'Zähler nach dem Verlassen des Feldes').toHaveText('5 / 1000');
    });
});

// ─── Test set B10: upload ───────────────────────────────────────
const MB = 1024 * 1024;

type TestFile = { name: string; size?: number };   // size in bytes, default 1 KB

type UploadValidationTest = {
    description: string;
    files: TestFile[];
    errorMessage?: string;
};

// creates a list of images: bild1.jpg, bild2.jpg, …
const images = (count: number): TestFile[] => Array.from({ length: count }, (_, i) => ({ name: `bild${i + 1}.jpg` }));

const UPLOAD_TESTS: UploadValidationTest[] = [
    // POSITIVE TESTS
    { description: 'ein JPG', files: [{ name: 'delle.jpg' }] },
    { description: 'ein PNG', files: [{ name: 'delle.png' }] },
    { description: 'ein Video', files: [{ name: 'delle.mp4' }] },
    { description: 'Bild und Video', files: [{ name: 'delle.jpg' }, { name: 'delle.mp4' }] },
    { description: 'genau 10 Dateien', files: images(10) },
    { description: 'Datei genau 20 MB', files: [{ name: 'gross.jpg', size: 20 * MB }] },
    { description: 'zusammen genau 50 MB', files: [{ name: 'a.jpg', size: 20 * MB }, { name: 'b.jpg', size: 20 * MB }, { name: 'c.jpg', size: 10 * MB }] },

    // NEGATIVE TESTS
    { description: '11 Dateien', files: images(11), errorMessage: ERROR_MESSAGE.upload.tooManyFiles },
    { description: 'PDF', files: [{ name: 'dokument.pdf' }], errorMessage: ERROR_MESSAGE.upload.notImageOrVideo('dokument.pdf') },
    { description: 'Bild und PDF', files: [{ name: 'delle.jpg' }, { name: 'dokument.pdf' }], errorMessage: ERROR_MESSAGE.upload.notImageOrVideo('dokument.pdf') },
    { description: 'Datei 20 MB + 1 Byte', files: [{ name: 'zu-gross.jpg', size: 20 * MB + 1 }], errorMessage: ERROR_MESSAGE.upload.fileTooLarge('zu-gross.jpg') },
    { description: 'Dateien zusammen 50 MB + 1 Byte', files: [{ name: 'a.jpg', size: 20 * MB }, { name: 'b.jpg', size: 20 * MB }, { name: 'c.jpg', size: 10 * MB + 1 }], errorMessage: ERROR_MESSAGE.upload.totalTooLarge },
];

// Create one test per table row: select the files,
// then check the message and the red marking of the upload area
function uploadValidationTests(testCases: UploadValidationTest[]) {
    for (const testCase of testCases) {
        const expectedResultText = testCase.errorMessage
            ? `Meldung „${testCase.errorMessage}“, Upload-Bereich rot markiert`
            : 'keine Meldung, Upload-Bereich nicht rot markiert';

        test(`${FIELD_LABEL.upload}: ${testCase.description}`,
            { ...expectedResult(expectedResultText), tag: testCase.errorMessage ? '@negativtest' : '@positivtest' },
            async ({ page }, testInfo) => {
                await openDamageForm(page);

                // Create the test files in the test's output folder (the browser detects the type from the extension)
                const paths = testCase.files.map(file => {
                    const filePath = testInfo.outputPath(file.name);
                    fs.writeFileSync(filePath, Buffer.alloc(file.size ?? 1024));
                    return filePath;
                });
                await fieldInput(page, 'upload').setInputFiles(paths);   // the page validates right after selection

                if (testCase.errorMessage) {
                    const errorMessage = testCase.errorMessage;

                    await test.step('Fehlermeldung und rote Markierung', async () => {
                        await expect(fieldError(page, 'upload'), 'Meldung unter dem Upload-Bereich').toHaveText(errorMessage);
                        await expect(uploadArea(page), 'Upload-Bereich rot markiert').toHaveClass(/is-invalid/);
                    });
                } else {
                    await test.step('kein Hinweis und keine rote Markierung', async () => {
                        await expect(fieldError(page, 'upload'), 'keine Meldung').toBeEmpty();
                        await expect(uploadArea(page), 'Upload-Bereich nicht rot markiert').not.toHaveClass(/is-invalid/);
                    });
                }
            });
    }
}

test.describe(VALIDATION_GROUP, () => {
    test.describe(FIELD_LABEL.upload, { tag: VALIDATION_TAG.upload }, () => {
        uploadValidationTests(UPLOAD_TESTS);
    });
});

// ─── Test set B11: names of the selected files ──────────────────
type FileNamesTest = {
    description: string;
    selections: string[][];   // file names of each selection, one after the other
    expectedNames: string;    // text shown after the last selection
};

const FILE_NAMES_TESTS: FileNamesTest[] = [
    { description: 'eine Datei', selections: [['delle.jpg']], expectedNames: 'delle.jpg' },
    { description: 'mehrere Dateien, mit Komma getrennt', selections: [['delle.jpg', 'kratzer.jpg']], expectedNames: 'delle.jpg, kratzer.jpg' },
    { description: 'neue Auswahl ersetzt die alte', selections: [['delle.jpg'], ['kratzer.jpg']], expectedNames: 'kratzer.jpg' },
    { description: 'Auswahl entfernt', selections: [['delle.jpg'], []], expectedNames: '' },
];

// creates a small image with the given name, kept in memory only (no file on disk)
const imageFile = (name: string) => ({ name, mimeType: 'image/jpeg', buffer: Buffer.from('Testbild') });

test.describe('Schaden-Formular: Anzeige der Dateinamen', { tag: '@dateinamen' }, () => {
    for (const testCase of FILE_NAMES_TESTS) {
        const expectedResultText = testCase.expectedNames
            ? `Im Upload-Bereich steht „${testCase.expectedNames}“`
            : 'Im Upload-Bereich steht kein Dateiname mehr';

        test(`${FIELD_LABEL.upload}: Dateinamen – ${testCase.description}`, expectedResult(expectedResultText), async ({ page }) => {
            await openDamageForm(page);
            await expect(fileNames(page), 'kein Dateiname vor der Auswahl').toBeEmpty();

            for (const selection of testCase.selections) {
                await fieldInput(page, 'upload').setInputFiles(selection.map(imageFile));
            }
            await expect(fileNames(page), 'Dateinamen nach der letzten Auswahl').toHaveText(testCase.expectedNames);
        });
    }
});

// ─── Test set C: correct invalid values ─────────────────────────
// One test per field: submit with an invalid value, correct it, submit again.
// Each test has two tags: CORRECTION_TAG (all correction tests) and the tag of its field (all tests of the field).
type CorrectionTest = {
    field: Exclude<InputField, 'upload' | 'message'>;   // the message has no invalid value (see test set B8)
    invalidInput: string;
};

const CORRECTION_TESTS: CorrectionTest[] = [
    { field: 'firstName', invalidInput: 'St3fanie' },
    { field: 'lastName', invalidInput: 'Nach_name' },
    { field: 'phone', invalidInput: '123456' },
    { field: 'email', invalidInput: 'mailadresse.com' },
    { field: 'street', invalidInput: 'Gebäude #2' },
    { field: 'postalCode', invalidInput: '1O20' },
    { field: 'city', invalidInput: '0rt' },
];

test.describe('Schaden-Formular: Werte korrigieren', () => {
    // C1: text fields
    for (const testCase of CORRECTION_TESTS) {
        correctionTest(testCase.field, testCase.invalidInput);
    }

    // C2: upload – same as correctionTest: fill in the required fields, select an invalid file and submit –
    // the submit must fail. Then select a valid file from VALID_INPUTS – message and red marking
    // of the upload area must disappear, and the next submit must succeed.
    const invalidFile = { name: 'dokument.pdf', mimeType: 'application/pdf', buffer: Buffer.from('Testdokument') };

    test(`${FIELD_LABEL.upload}: „${invalidFile.name}“ absenden, dann „${VALID_INPUTS.upload.name}“ auswählen und erneut absenden`,
        {
            ...expectedResult('Erstes Absenden scheitert: Meldung nur beim Upload, Upload-Bereich rot markiert, Cursor im Upload. '
                + 'Nach der neuen Auswahl verschwinden Meldung und rote Markierung, zweites Absenden zeigt die Danke-Ansicht.'),
            tag: [CORRECTION_TAG, VALIDATION_TAG.upload],
        }, async ({ page }) => {
            await openDamageForm(page);
            await fillFields(page, REQUIRED_FIELDS);
            await fieldInput(page, 'upload').setInputFiles(invalidFile);   // the page validates right after selection

            await submit(page);
            await expectInvalidSubmit(page, ['upload'], 'upload');

            await test.step('Fehlermeldung und rote Markierung', async () => {
                await expect(fieldError(page, 'upload'), 'Meldung unter dem Upload-Bereich').toHaveText(ERROR_MESSAGE.upload.notImageOrVideo(invalidFile.name));
                await expect(uploadArea(page), 'Upload-Bereich rot markiert').toHaveClass(/is-invalid/);
            });

            await fieldInput(page, 'upload').setInputFiles(VALID_INPUTS.upload);   // new selection with the valid file

            await test.step('kein Hinweis und keine rote Markierung', async () => {
                await expect(fieldError(page, 'upload'), 'keine Meldung').toBeEmpty();
                await expect(uploadArea(page), 'Upload-Bereich nicht rot markiert').not.toHaveClass(/is-invalid/);
            });

            await submit(page);
            await expectSuccessfulSubmit(page);
        });
});

// ─── Test set D: add/ overwrite fields ──────────────────────────
test.describe('Schaden-Formular: Werte ergänzen/ überschreiben', () => {
    // D1: first name, then add last name, then add phone
    test(`Vorname gültig, dann absenden, dann gültigen Nachnamen ergänzen, absenden, dann gültiges Telefon ergänzen, absenden`, expectedResult(`Nach dem ersten und zweiten Absenden erscheint ein Fehler, Eingaben können ergänzt und beim dritten Mal erfolgreich abgesendet werden`), async ({ page }) => {
        await runScenario(page, [
            { name: 'Vorname', fields: ['firstName'], focusedField: 'lastName' },
            { name: 'Nachname', fields: ['lastName'], focusedField: 'phone' },
            { name: 'Telefon', fields: ['phone'] },
        ]);
    });

    // D2: first name + last name, then add all other values
    test(`Vorname + Nachname gültig, dann absenden, dann alle anderen Eingaben ergänzen`, expectedResult(`Nach dem ersten Absenden erscheint ein Fehler, Eingaben können dann ergänzt und erfolgreich abgesendet werden`), async ({ page }) => {
        await runScenario(page, [
            { name: 'Vorname + Nachname', fields: ['firstName', 'lastName'], focusedField: 'phone' },
            { name: 'alle weiteren Felder', fields: ALL_FIELDS.filter(field => field !== 'firstName' && field !== 'lastName') },
        ]);
    });

    // D3: overwrite values before submitting
    test(`Werte vor Absenden überschreiben`, expectedResult(`Werte können vor dem Absenden überschrieben werden, neuer Vorname erscheint in der Danke-Ansicht`), async ({ page }) => {
        await openDamageForm(page);
        await fillFields(page, ALL_FIELDS);
        await fillFields(page, ALL_FIELDS, VALID_INPUTS_OVERRIDE);
        await submit(page);
        await expectSuccessfulSubmit(page, VALID_INPUTS_OVERRIDE.firstName);
    });

    // D4: overwrite values after an UNSUCCESSFUL submit
    test(`Werte nach nicht erfolgreichem Absenden überschreiben`, expectedResult(`Werte können nach NICHT erfolgreichem Absenden überschrieben werden, neuer Vorname erscheint in der Danke-Ansicht`), async ({ page }) => {
        await runScenario(page, [
            { name: 'Vorname + Nachname', fields: ['firstName', 'lastName'], focusedField: 'phone' },
            { name: 'alle Werte neu', fields: ALL_FIELDS, values: VALID_INPUTS_OVERRIDE },
        ]);
    });

    // D5: several errors at once, fixed one after the other – after each submit the cursor jumps
    // to the first field that still has a message (also to an optional field once all required fields are filled in).
    // Afterwards the form must be reset: this time there really were messages and red markings to remove.
    test(`Nachname fehlt, Mail und PLZ ungültig, dann nacheinander ergänzen/korrigieren und jeweils absenden`, expectedResult(
        'Nach jedem Absenden Meldungen nur bei den noch fehlerhaften Feldern, Cursor im ersten davon (Nachname, dann Mail, dann PLZ); '
        + 'nach der letzten Korrektur Danke-Ansicht; nach dem Schließen und erneuten Öffnen ist das Formular leer, ohne Meldungen und ohne rote Markierungen'
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

        await closeOverlay(page, 'button');
        await openOverlay(page);
        await expectEmptyForm(page);
    });
});

// ─── Test set E: close the overlay ──────────────────────────────
// The ways to close the overlay. The X at the top and the button of the thank-you view are both
// called "Schließen" – the visible text ("×" or "Schließen") tells the two apart.
const CLOSE_WAYS = {
    button: { description: 'Button „Schließen“', close: (page: Page) => overlay(page).getByRole('button', { name: 'Schließen' }).filter({ hasText: 'Schließen' }).click() },
    x: { description: 'X oben rechts', close: (page: Page) => overlay(page).getByRole('button', { name: 'Schließen' }).filter({ hasText: '×' }).click() },
    escape: { description: 'Escape-Taste', close: (page: Page) => page.keyboard.press('Escape') },
    // top left corner of the overlay: the dark area around the form
    outside: { description: 'Klick auf den dunklen Rand', close: (page: Page) => overlay(page).click({ position: { x: 5, y: 5 } }) },
};
type CloseWay = keyof typeof CLOSE_WAYS;

// The button "Schließen" only exists in the thank-you view – the form can be closed in all other ways
const FORM_CLOSE_WAYS = (Object.keys(CLOSE_WAYS) as CloseWay[]).filter(closeWay => closeWay !== 'button');

// Close the overlay in the given way and check that it is closed
async function closeOverlay(page: Page, closeWay: CloseWay) {
    await CLOSE_WAYS[closeWay].close(page);
    await expect(overlay(page), 'Overlay ist geschlossen').not.toHaveClass(/is-open/);
    await expect(page.locator('body'), 'Seite ist wieder scrollbar').not.toHaveCSS('overflow', 'hidden');
}

test.describe('Schaden-Formular: Overlay schließen', () => {
    // E1: close the form in every way
    for (const closeWay of FORM_CLOSE_WAYS) {
        test(`Formular mit ${CLOSE_WAYS[closeWay].description} schließen`, expectedResult(
            'Overlay ist geschlossen, Seite ist wieder scrollbar'
        ), async ({ page }) => {
            await openDamageForm(page);
            await closeOverlay(page, closeWay);
        });
    }

    // E2: a click into the form keeps the overlay open
    test('Klick in das Formular lässt das Overlay offen', expectedResult(
        'Overlay bleibt geöffnet'
    ), async ({ page }) => {
        await openDamageForm(page);
        await overlay(page).getByRole('heading', { name: 'Schaden checken' }).click();
        await expect(overlay(page), 'Overlay bleibt geöffnet').toHaveClass(/is-open/);
    });

    // E3: the page cannot be scrolled while the overlay is open
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
});

// ─── Test set F: thank-you view ─────────────────────────────────

test.describe('Schaden-Formular: Danke-Ansicht schließen', () => {
    // F1: close the thank-you view in every way
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

    // F2: close the thank-you view and reopen the form
    test('Danke-Ansicht schließen und erneut öffnen', expectedResult(
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
});

// ─── Test set G: reopening ──────────────────────────────────────

test('Schaden-Formular: Befülltes Formular ist nach dem Schließen beim erneuten Öffnen weiterhin befüllt', expectedResult(
    'Formular sichtbar; alle Felder, Zähler und Dateiname wie vor dem Schließen'
), async ({ page }) => {
    await openDamageForm(page);
    await fillFields(page, ALL_FIELDS);
    await closeOverlay(page, 'escape');
    await openOverlay(page);

    await test.step('alle Felder haben vorherigen Wert', async () => {
        for (const field of ALL_FIELDS) {
            if (field === 'upload') continue;
            await expect(fieldInput(page, field), `"${FIELD_LABEL[field]}" entspricht dem Wert vor dem Schließen`).toHaveValue(VALID_INPUTS[field]);
        }
    });

    await expect(messageCounter(page), 'Zähler zeigt weiterhin die Länge der Nachricht').toHaveText(`${VALID_INPUTS.message.length} / 1000`);
    await expect(fileNames(page), 'ausgewählte Datei entspricht der Vorherigen').toHaveText(VALID_INPUTS.upload.name);
});

// ─── Test set H: submit with the keyboard ───────────────────────
// For visitors without a mouse: Tab to "Anfrage absenden", then Enter or Space.
// The button ignores mousedown (see index.html) – the keyboard must not be affected by that.
const SUBMIT_KEYS = [
    { key: 'Enter', description: 'Enter' },
    { key: 'Space', description: 'Leertaste' },
];

// Press Tab until the element has the focus – fails if it cannot be reached with the keyboard
async function tabTo(page: Page, element: Locator, maxTabs = 20) {
    for (let i = 0; i < maxTabs; i++) {
        if (await element.evaluate(el => el === document.activeElement)) return;
        await page.keyboard.press('Tab');
    }
    await expect(element, `nach ${maxTabs}× Tab nicht erreicht`).toBeFocused();
}

test.describe('Schaden-Formular: Absenden per Tastatur', () => {
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

// ─── Test set I: submit straight from a field ───────────────────
// When a visitor submits without leaving the last field first, the field gets no blur event –
// so the page must tidy up the values (remove the outer spaces) during the submit itself.
const DIRECT_SUBMIT_WAYS: { description: string; submit: (page: Page, field: InputField) => Promise<void> }[] = [
    { description: 'Klick auf den Button', submit: page => submit(page) },
    { description: 'Enter im Feld', submit: (page, field) => fieldInput(page, field).press('Enter') },
];

test.describe('Schaden-Formular: Absenden direkt aus einem Feld', () => {
    for (const way of DIRECT_SUBMIT_WAYS) {
        // I1: Firefox treats an email field with only spaces as invalid until its value is set again
        test(`Mail nur mit Leerzeichen, direkt absenden (${way.description})`, expectedResult(
            'Das freiwillige Mail-Feld blockiert das Absenden nicht, Danke-Ansicht mit Vornamen erscheint'
        ), async ({ page }) => {
            await openDamageForm(page);
            await fillFields(page, REQUIRED_FIELDS);
            await fillFields(page, ['email'], { email: '   ' });

            await way.submit(page, 'email');
            await expectSuccessfulSubmit(page);
        });

        // I2: the value is read at the moment of the submit event – afterwards the page clears the form
        test(`Ort mit Leerzeichen außen, direkt absenden (${way.description})`, expectedResult(
            'Beim Absenden steht der Ort ohne die Leerzeichen außen im Feld („Graz“), Danke-Ansicht mit Vornamen erscheint'
        ), async ({ page }) => {
            await openDamageForm(page);
            await fillFields(page, REQUIRED_FIELDS);
            await fillFields(page, ['city'], { city: '  Graz  ' });

            // resolves with the value of the field as soon as the form is submitted
            const cityAtSubmit = page.evaluate(id => new Promise<string>(resolve => {
                document.addEventListener('submit', () => resolve((document.getElementById(id) as HTMLInputElement).value), { capture: true, once: true });
            }), FIELD_ID.city);

            await way.submit(page, 'city');
            expect(await cityAtSubmit, 'Ort beim Absenden ohne Leerzeichen außen').toBe('Graz');
            await expectSuccessfulSubmit(page);
        });
    }
});
