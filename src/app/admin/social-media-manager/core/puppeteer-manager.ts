// puppeteer-manager.js
import puppeteer from 'puppeteer';

class PuppeteerManager {
  browser: any;
  page: any;
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async createBrowser() {
    this.browser = await puppeteer.launch({ headless: false });
  }

  async createPage() {
    if (!this.browser) await this.createBrowser();
    this.page = await this.browser.newPage();
  }

  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
  }

  async typeWithDelay(selector, text) {
    for (const char of text) {
      await this.page.type(selector, char, { delay: this.randomDelay() });
    }
  }

  randomDelay() {
    return Math.floor(Math.random() * 200) + 50;
  }

  async moveMouseAndClick(selector) {
    const box = await this.page.$eval(selector, (el) => el.getBoundingClientRect());
    await this.page.mouse.move(box.x, box.y);
    await this.page.mouse.click(box.x, box.y);
  }

  async getPageHtml() {
    return await this.page.content();
  }

  async humanDelay(min = 500, max = 1500) {
    await this.page.waitForTimeout(Math.floor(Math.random() * (max - min)) + min);
  }
}

export default PuppeteerManager;