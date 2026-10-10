import {readFileSync} from 'node:fs';

export const LOCALE_DETAILS = JSON.parse(readFileSync(new URL('../../src/i18n/locales.json', import.meta.url), 'utf8'));
export const SUPPORTED_LOCALES = Object.keys(LOCALE_DETAILS);
