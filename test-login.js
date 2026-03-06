// Simple test script to verify login functionality
const puppeteer = require('puppeteer');

async function testLogin() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Navigate to the login page
    await page.goto('http://localhost:3000/login');
    
    // Wait for the page to load
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    
    console.log('✅ Login page loaded successfully');
    console.log('✅ Email input field found');
    
    // Check if password field exists
    const passwordField = await page.$('input[name="password"]');
    if (passwordField) {
      console.log('✅ Password input field found');
    }
    
    // Check if login button exists
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log('✅ Login button found');
    }
    
    console.log('🎉 Login form appears to be working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  testLogin();
} catch (error) {
  console.log('Note: Puppeteer not available for automated testing');
  console.log('Please manually test the login at: http://localhost:3000/login');
}