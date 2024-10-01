import puppeteer from 'puppeteer';

export class MediumManager {
    private medium: any;

    constructor() {
        this.medium = null;
    }

    async getPosts() {
        // get posts from Medium
    }

    async post(content: string) {
        // post content to Medium
        await this.mediumPostAutomation(content);
    }

    async launch(options:any) {
        return puppeteer.launch(options);
    }

    async mediumPostAutomation(content: string) {
        const browser = await this.launch({ headless: false }); // Set to true for production
        const page = await browser.newPage();

        try {
            // Find and click the sign-in button
            const signInButton = await page.waitForSelector('a[href="https://medium.com/m/signin"]');
            await signInButton?.click();
            await this.waitRandomTime(2, 5);

            // Look for OAuth buttons and click Google if it exists
            const googleSignInButton = await page.$('button[data-testid="google-sign-in-button"]');
            if (googleSignInButton) {
                await googleSignInButton.click();
                await this.waitRandomTime(3, 6);

                // Handle Google sign-in process here
                // Note: This part might be tricky due to security measures and may require manual intervention

                // For demonstration, we'll assume we're signed in successfully
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
            } else {
                console.log('Google sign-in button not found. Manual sign-in may be required.');
                // Handle alternative sign-in methods or throw an error
            }

            // Click 'Write' button
            const writeButton = await page.waitForSelector('a[href="/new-story"]');
            await writeButton?.click();
            await this.waitRandomTime(2, 4);

            // Paste content
            await page.keyboard.type(content);
            await this.waitRandomTime(1, 2);

            // Format the text (example operations)
            await page.evaluate(() => {
                const paragraphs = document.querySelectorAll('p');
                paragraphs.forEach((p, index) => {
                    if (index === 0) {
                        // Make first paragraph a title
                        p.innerHTML = `<h1>${p.innerHTML}</h1>`;
                    } else if (index % 3 === 0) {
                        // Make every third paragraph bold
                        p.innerHTML = `<strong>${p.innerHTML}</strong>`;
                    }

                    // Add links to certain words (example)
                    p.innerHTML = p.innerHTML.replace(/technology/g, '<a href="https://en.wikipedia.org/wiki/Technology">technology</a>');
                });
            });

            console.log('Post drafted and formatted successfully');

            // Note: We're not publishing the post automatically as that would require more complex interactions

        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            await browser.close();
        }
    }

    // Reusable function for random wait time
    async waitRandomTime(minSeconds: number, maxSeconds: number) {
        const seconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}