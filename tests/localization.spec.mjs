import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';

const localeDetails = JSON.parse(readFileSync('src/i18n/locales.json', 'utf8'));
const languages = Object.keys(localeDetails);
const addedLanguages = languages.filter((locale) => !['en', 'tr'].includes(locale));
const messages = Object.fromEntries(languages.map((locale) => [locale, JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8'))]));
const manifest = JSON.parse(readFileSync('src/generated/blog-manifest.json', 'utf8'));
const published = manifest.topics.filter((topic) => languages.every((locale) => topic[locale].status === 'published'));
const routeSource = readFileSync('src/navigation.ts', 'utf8');
const routes = [...routeSource.matchAll(/'([^']+)':\s*\{\s*en:\s*'([^']+)',\s*tr:\s*'([^']+)'/g)]
  .filter((match) => !match[1].includes('['));
const localizedPath = (locale, route) => locale === 'en' ? route : `${localeDetails[locale].urlPrefix ?? `/${locale}`}${route === '/' ? '' : route}`;
const languageNames = Object.fromEntries(Object.entries(localeDetails).map(([locale, details]) => [locale, details.name]));

async function dismissConsent(page, locale) {
  const reject = page.getByRole('button', {name: messages[locale].ConsentBanner.reject, exact: true});
  if (await reject.isVisible()) await reject.click();
}

async function switchLanguage(page, locale) {
  const trigger = page.locator('header').getByRole('button').filter({has: page.locator('span.sr-only')}).last();
  await trigger.click();
  await page.getByRole('menuitem', {name: languageNames[locale], exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
}

test.beforeEach(async ({page}) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
});

test('all static routes and published articles serve their selected language and reciprocal alternates', async ({baseURL}) => {
  const checks = languages.flatMap((locale) => [
    ...routes.map(([, , en, tr]) => ({locale, route: localizedPath(locale, locale === 'tr' ? tr : en)})),
    ...published.map((topic) => ({locale, route: localizedPath(locale, `/blog/${topic[locale].slug}`), title: topic[locale].title})),
  ]);
  for (let index = 0; index < checks.length; index += 8) {
    await Promise.all(checks.slice(index, index + 8).map(async ({locale, route, title}) => {
      const response = await fetch(new URL(route, baseURL), {
        headers: {'Accept-Language': 'en', Cookie: `NEXT_LOCALE=${locale}`},
        signal: AbortSignal.timeout(15_000),
      });
      expect(response.status, route).toBe(200);
      const html = await response.text();
      expect(html.includes(`lang="${locale}"`), route).toBe(true);
      expect(html.includes(`dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`), route).toBe(true);
      const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
      expect(canonical?.replace(/\/$/, ''), route).toBe(`https://kermitfloor.com${route}`.replace(/\/$/, ''));
      for (const language of languages) expect(html.includes(`hrefLang="${language}"`), `${route}: ${language}`).toBe(true);
      if (title) expect(html.includes(`"inLanguage":"${locale}"`), route).toBe(true);
      expect(html, route).not.toMatch(/MISSING_MESSAGE|INVALID_MESSAGE|⟦|⟧/);
    }));
  }
});

for (const locale of addedLanguages) {
  test(`${locale}: translated navigation, product labels, contact links and original PDFs`, async ({page}) => {
    await page.goto(localizedPath(locale, '/'));
    await expect(page.getByRole('heading', {name: messages[locale].HomePage.heroTitle, exact: true})).toBeVisible();
    await expect(page.locator('header').getByRole('link', {name: messages[locale].Header.navDownload, exact: true})).toBeVisible();
    await dismissConsent(page, locale);

    await page.goto(localizedPath(locale, '/spc-flooring-elite-collection'));
    await expect(page.getByRole('heading', {name: 'Bleached Oak', exact: true})).toBeVisible();
    await expect(page.getByText(`${messages[locale].ProductDetails.specThickness}:`, {exact: true})).toBeVisible();
    await expect(page.getByText(messages[locale].ProductDetails.specInteriorValue, {exact: true})).toBeVisible();
    await expect(page.getByText(messages[locale].ProductDetails.specIxpeIncludedValue.replace('{thickness}', '1 mm / 1,5 mm'), {exact: true})).toBeVisible();
    await page.getByRole('button', {name: messages[locale].Common.nextSlide, exact: true}).first().click();
    await expect(page.getByRole('heading', {name: 'Arctic Oak', exact: true})).toBeVisible();

    await page.goto(localizedPath(locale, '/contact'));
    await expect(page.locator('a[href="tel:+37379157375"]')).toBeVisible();
    await expect(page.getByRole('main').locator('a[href="mailto:info@kermit.com.tr"]')).toBeVisible();

    await page.goto(localizedPath(locale, '/resources?tab=wall_panels'));
    await expect(page.getByRole('heading', {name: messages[locale].ResourcesPage.heroTitle, exact: true})).toBeVisible();
    const catalogue = page.locator('a[download][href="/downloads/catalogues/kermit-spc-wall-panel-catalogue-en-2026-08.pdf"]').first();
    await expect(catalogue).toBeVisible();
    await expect(catalogue).toContainText(messages[locale].ResourcesPage.downloads.enPdf);
    await expect(page.getByRole('tab', {name: messages[locale].ResourcesPage.productLineTabs_wall_panels, exact: true})).toHaveAttribute('data-state', 'active');

    await switchLanguage(page, locale === 'bg' ? 'sr' : 'bg');
    await expect(page).toHaveURL(/\/resources\?tab=wall_panels$/);
  });
}

test('article language switching resolves translated slugs and author profiles', async ({page}) => {
  const topic = published.find((entry) => entry.topicId === 'spc-manufacturer-buyers-checklist');
  await page.goto(`/bg/blog/${topic.bg.slug}`);
  await dismissConsent(page, 'bg');
  await expect(page.getByRole('heading', {name: topic.bg.title, exact: true})).toBeVisible();
  for (const locale of ['tr', 'sr', 'ar', 'uk', 'en']) {
    await switchLanguage(page, locale);
    await expect(page).toHaveURL(new RegExp(`${localizedPath(locale, `/blog/${topic[locale].slug}`)}$`));
    await expect(page.getByRole('heading', {name: topic[locale].title, exact: true})).toBeVisible();
    await expect(page.getByText('Barbaros Ahmet Bayram', {exact: true}).first()).toBeVisible();
  }
});

test('tag language switching stays on a translated topic', async ({page}) => {
  const tag = published[0].ar.tags[0];
  await page.goto(`/ar/blog/tag/${encodeURIComponent(tag)}`);
  await dismissConsent(page, 'ar');
  await expect(page.locator('main h1')).toContainText(tag);
  await switchLanguage(page, 'sr');
  await expect(page).toHaveURL(/\/sr\/blog\/tag\//);
  await expect(page.locator('main h1')).toBeVisible();
  await switchLanguage(page, 'uk');
  await expect(page).toHaveURL(/\/ukr\/blog\/tag\//);
  await expect(page.locator('main h1')).toContainText(published[0].uk.tags[0]);
});

test('the guide hub and glossary cover every topic and keep visible terms aligned with schema', async ({page}) => {
  const glossary = JSON.parse(readFileSync('src/lib/glossary.json', 'utf8'));
  for (const locale of languages) {
    await page.goto(localizedPath(locale, '/blog'));
    await dismissConsent(page, locale);
    await expect(page.locator('main h1')).toHaveText(messages[locale].Blog.title);
    await expect(page.locator('main h3[id^="guide-"]')).toHaveCount(5);
    for (const topic of published) {
      await expect(page.locator('main').getByRole('link', {name: topic[locale].title, exact: true}).first()).toBeVisible();
    }
    await page.goto(localizedPath(locale, locale === 'tr' ? '/sozluk' : '/glossary'));
    await expect(page.locator('main h1')).toHaveText(messages[locale].Glossary.title);
    await expect(page.locator('main dt')).toHaveCount(33);
    const schema = await page.locator('main script[type="application/ld+json"]').evaluate((node) => JSON.parse(node.textContent));
    expect(schema.inLanguage).toBe(locale);
    expect(schema.hasDefinedTerm).toHaveLength(33);
    for (const term of glossary.flatMap((section) => section.terms)) {
      const visible = page.locator(`main [id="${term.id}"]`);
      await expect(visible.locator('dt')).toHaveText(term[locale].name);
      await expect(visible.locator('dd p')).toHaveText(term[locale].definition);
      expect(schema.hasDefinedTerm.find((entry) => entry.url.endsWith(`#${term.id}`))).toMatchObject({
        name: term[locale].name, description: term[locale].definition,
      });
    }
  }
  await switchLanguage(page, 'tr');
  await expect(page).toHaveURL(/\/tr\/sozluk$/);
});

for (const locale of ['ar', 'uk']) {
  test(`${locale}: mobile menus, article tables and carousels fit the viewport`, async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    const screenshots = path.join(process.cwd(), 'test-results/localization/previews');
    await mkdir(screenshots, {recursive: true});
    const quantity = published.find((topic) => topic.topicId === 'spc-flooring-quantity-layout');
    for (const route of ['/', '/resources', '/spc-flooring-elite-collection', '/blog/spc-interior-finishes-project-specification', '/glossary', `/blog/${quantity[locale].slug}`].map((route) => localizedPath(locale, route))) {
      await page.goto(route);
      await dismissConsent(page, locale);
      await expect(page.locator('html')).toHaveAttribute('dir', localeDetails[locale].direction);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBeLessThanOrEqual(391);
      await page.screenshot({path: path.join(screenshots, `${route.replaceAll('/', '-') || 'home'}.png`)});
    }
    await page.getByRole('button', {name: messages[locale].Common.openMenu, exact: true}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', {name: messages[locale].Header.navFloors, exact: true})).toBeVisible();
  });
}

test('sitemap includes every language as a standalone URL and alternate', async ({request}) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect(xml).not.toMatch(/https:\/\/kermitfloor\.com\/uk(?:[/<"?]|$)/);
  for (const locale of languages) {
    expect(xml).toContain(`<loc>https://kermitfloor.com${localizedPath(locale, '/')}</loc>`);
    expect(xml).toContain(`hreflang="${locale}"`);
    for (const topic of published) {
      expect(xml).toContain(`<loc>https://kermitfloor.com${localizedPath(locale, `/blog/${topic[locale].slug}`)}</loc>`);
    }
  }
});

test('Ukrainian uses /ukr URLs with uk language metadata and redirects the old prefix', async ({request, page}) => {
  const response = await request.get('/uk/resources?tab=wall_panels', {maxRedirects: 0});
  expect(response.status()).toBe(308);
  const target = new URL(response.headers().location, response.url());
  expect(target.pathname).toBe('/ukr/resources');
  expect(target.search).toBe('?tab=wall_panels');

  const topic = published.find((entry) => entry.topicId === 'spc-manufacturer-buyers-checklist');
  const article = await request.get(`/ukr/blog/${topic.uk.slug}`, {headers: {'Accept-Language': 'tr', Cookie: 'NEXT_LOCALE=tr'}});
  expect(article.status()).toBe(200);
  expect(await article.text()).toContain('lang="uk"');

  await page.goto('/ukr');
  await dismissConsent(page, 'uk');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.locator('head link[rel="alternate"][hreflang="uk"]')).toHaveAttribute('href', 'https://kermitfloor.com/ukr');
  const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs.some((href) => /^\/uk(?:\/|$)/.test(href))).toBe(false);
  await switchLanguage(page, 'en');
  await expect(page).toHaveURL(/\/$/);
  await switchLanguage(page, 'uk');
  await expect(page).toHaveURL(/\/ukr$/);
});

test('translated technical diagram labels fit inside the SVG', async ({page}) => {
  await page.setViewportSize({width: 800, height: 760});
  for (const locale of addedLanguages) {
    await page.goto(`/images/blog/spc-flooring-thickness-wear-layer/${locale}-layer-diagram.svg`);
    const bounds = await page.locator('svg text').evaluateAll((elements) => elements.map((element) => {
      const {x, y, width, height} = element.getBBox();
      return {label: element.textContent, x, y, width, height};
    }));
    expect(bounds.length).toBeGreaterThan(0);
    for (const {label, x, y, width, height} of bounds) {
      expect(x, `${locale}: ${label}`).toBeGreaterThanOrEqual(0);
      expect(x + width, `${locale}: ${label}`).toBeLessThanOrEqual(800);
      expect(y, `${locale}: ${label}`).toBeGreaterThanOrEqual(0);
      expect(y + height, `${locale}: ${label}`).toBeLessThanOrEqual(760);
    }
  }
});
