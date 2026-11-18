import { expect, type Locator } from '@playwright/test';

// A link that jumps to a section of the page
export type AnchorLink = {
    name: string;   // visible link text
    href: string;   // anchor of the section, e.g. '#galerie'
};

// Click the link inside the given area (e.g. navbar or footer)
// and check that the page jumps to its section
export async function checkAnchorLink(area: Locator, link: AnchorLink) {
    const page = area.page();
    await page.goto('/');

    const linkElement = area.getByRole('link', { name: link.name, exact: true });

    // correct link target in the HTML
    await expect(linkElement).toHaveAttribute('href', link.href);
    await linkElement.click();
    // URL ends with the anchor after the click
    await expect(page).toHaveURL(new RegExp(`${link.href}$`));
    // section is in view (the anchor doubles as the CSS selector for its id)
    await expect(page.locator(link.href)).toBeInViewport();
}
