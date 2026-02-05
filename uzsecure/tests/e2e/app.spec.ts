import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should login successfully', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.goto('http://localhost:3000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Logout
        await page.click('button[aria-label="User menu"]');
        await page.click('text=Logout');

        await expect(page).toHaveURL(/login/);
    });
});

test.describe('Report Submission', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('http://localhost:3000/login');
        await page.fill('input[name="email"]', 'researcher@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
    });

    test('should submit a new report', async ({ page }) => {
        await page.goto('http://localhost:3000/programs/test-program');
        await page.click('text=Submit Report');

        await page.fill('input[name="title"]', 'XSS Vulnerability');
        await page.selectOption('select[name="severity"]', 'HIGH');
        await page.fill('textarea[name="description"]', 'Found XSS in search field');

        await page.click('button[type="submit"]');

        await expect(page.locator('text=Report submitted successfully')).toBeVisible();
    });

    test('should auto-save draft', async ({ page }) => {
        await page.goto('http://localhost:3000/programs/test-program');
        await page.click('text=Submit Report');

        await page.fill('input[name="title"]', 'SQL Injection');

        // Wait for auto-save
        await page.waitForTimeout(3000);

        // Reload page
        await page.reload();

        // Check if draft is loaded
        await expect(page.locator('input[name="title"]')).toHaveValue('SQL Injection');
        await expect(page.locator('text=Draft loaded')).toBeVisible();
    });
});

test.describe('Dark Mode', () => {
    test('should toggle dark mode', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Click dark mode button
        await page.click('button[title="Dark mode"]');

        // Check if dark class is applied
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveClass(/dark/);
    });

    test('should persist dark mode preference', async ({ page }) => {
        await page.goto('http://localhost:3000');

        await page.click('button[title="Dark mode"]');
        await page.reload();

        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveClass(/dark/);
    });
});

test.describe('Payment Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.fill('input[name="email"]', 'company@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
    });

    test('should initiate UzCard payment', async ({ page }) => {
        await page.goto('http://localhost:3000/reports/test-report');
        await page.click('text=Pay Bounty');

        await page.click('text=UzCard');
        await page.fill('input[name="amount"]', '50000');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Payment initiated')).toBeVisible();
    });
});

test.describe('CVSS Calculator', () => {
    test('should calculate CVSS score', async ({ page }) => {
        await page.goto('http://localhost:3000/cvss-calculator');

        await page.selectOption('select[name="attackVector"]', 'N');
        await page.selectOption('select[name="attackComplexity"]', 'L');
        await page.selectOption('select[name="privilegesRequired"]', 'N');
        await page.selectOption('select[name="userInteraction"]', 'N');
        await page.selectOption('select[name="confidentiality"]', 'H');

        await page.click('text=Calculate Score');

        await expect(page.locator('text=HIGH')).toBeVisible();
    });
});
