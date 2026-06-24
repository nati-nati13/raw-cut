import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';

const OUT = 'C:/Users/NATIA/Desktop/raw-cut/test-screenshots';
if (!existsSync(OUT)) mkdirSync(OUT);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const email = `pw_${Date.now()}@test.com`;

// 1. Homepage
await page.goto('http://localhost:3000');
await page.screenshot({ path: `${OUT}/01_home.png` });
console.log('✅ 01 home:', page.url());

// 2. Register page
await page.goto('http://localhost:3000/register');
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/02_register.png` });

// 3. Fill + submit register
await page.fill('#name', 'Playwright User');
await page.fill('#email', email);
await page.fill('#password', 'secure123');
await page.screenshot({ path: `${OUT}/03_register_filled.png` });
await page.click('button[type=submit]');
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/04_after_register.png` });
console.log('✅ 04 after register:', page.url());

// 4. Login
await page.goto('http://localhost:3000/login');
await page.waitForTimeout(500);
await page.fill('#email', email);
await page.fill('#password', 'secure123');
await page.screenshot({ path: `${OUT}/05_login_filled.png` });
await page.click('button[type=submit]');
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/06_after_login.png` });
console.log('✅ 06 after login:', page.url());

// 5. Account page
await page.goto('http://localhost:3000/account');
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/07_account.png`, fullPage: true });
console.log('✅ 07 account:', page.url());

// 6. Wrong password test
await ctx.clearCookies();
await page.goto('http://localhost:3000/login');
await page.fill('#email', email);
await page.fill('#password', 'wrongpass');
await page.click('button[type=submit]');
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/08_wrong_password.png` });
console.log('🔍 08 wrong password:', page.url());

await browser.close();
console.log('DONE. Screenshots:', OUT);
