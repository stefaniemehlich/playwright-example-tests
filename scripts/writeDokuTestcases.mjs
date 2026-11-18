// Generates dokuTestcases.md: all Playwright test cases with their expected results,
// grouped by test file and test group (describe) – with an overview at the top and collapsible groups.
// Usage: npm run writeDokuTestcases
//
// Each test can define its expected result with expectedResult('…') (see tests/helpers/addExpectedResult.ts).
// The title of a test file comes from a comment line in the file, e.g. "// Doku-Titel: Tests der CTA-Buttons"
// → shown as "Tests der CTA-Buttons (cta-float.spec.ts)". Without that line, only the file name is shown.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_FILE = 'dokuTestcases.md';
const MISSING_RESULT = '⚠ noch nicht hinterlegt';
const OVERVIEW_ID = 'uebersicht';        // anchor of the overview, for the "↑ Übersicht" links

// One browser only – otherwise every test would be listed three times
const testListJson = execSync('npx playwright test --list --reporter=json --project=chromium', {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
});
const report = JSON.parse(testListJson);

// ─── Build the tree: test file → groups → test cases ────────────
// A group holds its own test cases and its subgroups (nested describe).
const newGroup = title => ({ title, tests: [], groups: new Map() });

// Groups with the same title are merged – a describe title can be used several times in a file
function collect(suite, group) {
    for (const spec of suite.specs ?? []) {
        const annotation = spec.tests[0]?.annotations.find(a => a.type === 'expectedResult');
        group.tests.push({ title: spec.title, expectedResult: annotation?.description ?? MISSING_RESULT });
    }
    for (const subSuite of suite.suites ?? []) {
        if (!group.groups.has(subSuite.title)) group.groups.set(subSuite.title, newGroup(subSuite.title));
        collect(subSuite, group.groups.get(subSuite.title));
    }
}

// Title from the line "// Doku-Titel: …" in the test file, or undefined if there is none
function readDocTitle(fileName) {
    const source = readFileSync(join(report.config.rootDir, fileName), 'utf8');
    return source.match(/^\/\/ Doku-Titel: (.+)$/m)?.[1].trim();
}

// Top level = one test file, shown as "Doku-Titel (file name)"
const files = report.suites.map(fileSuite => {
    const docTitle = readDocTitle(fileSuite.file);
    const file = newGroup(docTitle ? `${docTitle} (${fileSuite.file})` : fileSuite.file);
    file.fileName = fileSuite.file;
    file.hasDocTitle = docTitle !== undefined;
    collect(fileSuite, file);
    return file;
});

const countTests = group => group.tests.length + [...group.groups.values()].reduce((sum, sub) => sum + countTests(sub), 0);
const allTests = group => [...group.tests, ...[...group.groups.values()].flatMap(allTests)];

// Anchor for the links in the overview, e.g. "damage-form.spec.ts" → "damage-form-spec-ts", "Straße" → "strasse"
const slug = text => text.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Every file and group gets a unique id: the ids of its parents + its own title, e.g.
// "damage-form-spec-ts--schaden-formular-werte-validieren--plz"
const usedIds = new Set();
function uniqueId(id) {
    let candidate = id;
    for (let i = 2; usedIds.has(candidate); i++) candidate = `${id}-${i}`;
    usedIds.add(candidate);
    return candidate;
}

// Subgroups as shown in the document, with their ids
function assignIds(group, parentId) {
    group.subgroups = [...group.groups.values()];
    for (const subgroup of group.subgroups) {
        subgroup.id = uniqueId(`${parentId}--${slug(subgroup.title)}`);
        assignIds(subgroup, subgroup.id);
    }
}

for (const file of files) {
    file.id = uniqueId(slug(file.fileName));   // from the file name: stays the same when the title changes
    assignIds(file, file.id);
}

// ─── Markdown ───────────────────────────────────────────────────
// A | would break the Markdown table; < would be read as the start of an HTML tag and the text would disappear
const escapeCell = text => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\|/g, '\\|');

// Link text in the overview: [ and ] would end the link text
const escapeLinkText = text => escapeCell(text).replace(/[[\]]/g, '\\$&');

// Text inside HTML tags (summary of a collapsible group)
const escapeHtml = text => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Overview: one linked line per file, its groups indented below (only the first level, no subgroups)
function overviewLines(file) {
    return [
        `- [${escapeLinkText(file.title)}](#${file.id}) (${countTests(file)})`,
        ...file.subgroups.map(group => `  - [${escapeLinkText(group.title)}](#${group.id}) (${countTests(group)})`),
    ];
}

// Table of test cases with their expected result (nothing if there are none).
// HTML instead of a Markdown table: only HTML can set column widths, so every table has the same columns.
// No blank lines inside – a blank line would end the HTML block in Markdown.
const COLUMN_WIDTHS = { testCase: '40%', expectedResult: '60%' };

function testTable(tests) {
    if (!tests.length) return [];
    return [
        '<table width="100%">',
        `<tr><th width="${COLUMN_WIDTHS.testCase}" align="left">Testfall</th><th width="${COLUMN_WIDTHS.expectedResult}" align="left">Erwartetes Ergebnis</th></tr>`,
        ...tests.map(test => `<tr><td>${escapeHtml(test.title)}</td><td>${escapeHtml(test.expectedResult)}</td></tr>`),
        '</table>',
        '',
    ];
}

// One collapsible group: its test cases as a table, then its subgroups (collapsible as well).
// All groups are open: a link can only jump to a group, not open it – so the content must already be visible.
function renderGroup(group) {
    const lines = [
        `<details id="${group.id}" open>`,
        `<summary><b>${escapeHtml(group.title)}</b> (${countTests(group)})</summary>`,
        '',
        ...testTable(group.tests),
    ];
    // Subgroups indented: <dd> has a left margin by default (Markdown itself cannot indent)
    if (group.subgroups.length) {
        lines.push('<dl><dd>', '', ...group.subgroups.flatMap(renderGroup), '</dd></dl>', '');
    }
    lines.push('</details>', '');
    return lines;
}

const totalCount = files.reduce((sum, file) => sum + countTests(file), 0);
const missingCount = files.flatMap(allTests).filter(test => test.expectedResult === MISSING_RESULT).length;
const generatedOn = new Date().toLocaleDateString('de-DE');

const markdown = [
    '# Testfälle',
    '',
    `Automatisch erzeugt am ${generatedOn} mit \`npm run writeDokuTestcases\` – nicht von Hand bearbeiten.`,
    '',
    `${totalCount} Testfälle, davon ${missingCount} ohne erwartetes Ergebnis.`,
    '',
    `<a id="${OVERVIEW_ID}"></a>`,
    '',
    '## Übersicht',
    '',
    ...files.flatMap(overviewLines),
    '',
    ...files.flatMap(file => [
        `<a id="${file.id}"></a>`,
        '',
        `## ${file.title} (${countTests(file)})`,
        '',
        `[↑ Übersicht](#${OVERVIEW_ID})`,
        '',
        // Tests without describe: directly below the file heading, without a group
        ...testTable(file.tests),
        ...file.subgroups.flatMap(renderGroup),
    ]),
].join('\n');

writeFileSync(OUTPUT_FILE, markdown);
console.log(`${OUTPUT_FILE} geschrieben: ${totalCount} Testcases, ${missingCount} ohne erwartetes Ergebnis.`);

const filesWithoutTitle = files.filter(file => !file.hasDocTitle).map(file => file.fileName);
if (filesWithoutTitle.length) {
    console.log(`${filesWithoutTitle.length} Testdatei(en) ohne „// Doku-Titel: …“: ${filesWithoutTitle.join(', ')}`);
}
