import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const readme = await readFile(new URL('../../README.md', import.meta.url), 'utf8');
const css = await readFile(new URL('../dist/style.css', import.meta.url), 'utf8');
const links = [
  'mailto:shuklaabhay075@gmail.com',
  'https://www.linkedin.com/in/abhays02/',
  'https://g.dev/abhays02',
  'https://www.instagram.com/abhays02/',
  'https://github.com/abhays02',
];

test('profile and portfolio expose the same social and contact destinations', () => {
  const contact = html.split('id="contact"')[1].split('</section>')[0];
  for (const link of links) {
    assert(contact.includes(`href="${link}"`), link);
    assert(readme.includes(link), link);
  }
  assert(contact.includes('class="contact-cta"'));
  assert.equal((contact.match(/target="_blank" rel="noopener"/g) || []).length, 4);
  assert(contact.includes('href="Abhay-Shukla-Resume.pdf" download'));
});

test('README raised buttons exist and have accessible labels', async () => {
  for (const name of ['portfolio', 'contact', 'linkedin', 'gdev', 'instagram']) {
    const path = `assets/button-${name}.svg`;
    assert(readme.includes(`src="${path}"`));
    const svg = await readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
    assert(svg.includes('aria-labelledby="title"'));
    assert(svg.includes('<title id="title">'));
  }
});

test('elevated cards cover keyboard, press, mobile, and reduced-motion states', () => {
  for (const rule of [
    '.contact-cards>a:focus-visible',
    '.contact-cards>a:active',
    '.contact-cta:focus-visible',
    '.contact-cta:active',
    'grid-template-columns:repeat(2,minmax(0,1fr))',
    '@media(prefers-reduced-motion:reduce){.contact-cards',
  ]) assert(css.includes(rule), rule);
});
