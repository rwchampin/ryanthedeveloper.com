// manager.js
import PuppeteerManager from './puppeteer-manager';

class Manager {
  platform: any;
  username: any;
  password: any;
  platformUrls: any;
  puppeteer: any;
  constructor(platform, username, password, platformUrls) {
    this.platform = platform;
    this.username = username;
    this.password = password;
    this.platformUrls = platformUrls;
    this.puppeteer = new PuppeteerManager();
  }

  async goToLogin() {
    await this.puppeteer.createBrowser();
    await this.puppeteer.createPage();
    await this.puppeteer.navigateTo(this.platformUrls.login);
  }

  async verifyPage(expectedElement) {
    const html = await this.puppeteer.getPageHtml();
    return html.includes(expectedElement);
  }

  async performAction(action, selectors) {
    const { usernameSelector, passwordSelector, submitSelector } = selectors;

    await this.puppeteer.typeWithDelay(usernameSelector, this.username);
    await this.puppeteer.typeWithDelay(passwordSelector, this.password);
    await this.puppeteer.humanDelay();
    await this.puppeteer.moveMouseAndClick(submitSelector);
    await this.puppeteer.page.waitForNavigation({ waitUntil: 'networkidle2' });
  }

  async verifyAction(action) {
    const html = await this.puppeteer.getPageHtml();
    return !html.includes('login');
  }
}

export default Manager;