import puppeteer from 'puppeteer';

const scrapeWebsite = async (url: string) => {
    let browser;
    let page;
    let articles = [];
    let pageNumber = 1;
    let hasNextPage = true;

    try {
        browser = await puppeteer.launch();
        page = await browser.newPage();

        while (hasNextPage) {
            const pageUrl = `${url}/page/${pageNumber}`;

            await page.goto(pageUrl);

            // Wait for the selector to appear
            await page.waitForSelector('.article-card');

            const scrapedArticles = await page.$$eval('.article-card', (elements) => {
                const rows = elements.map((element) => {
                    const title = element.querySelector('h2')?.textContent;
                    const link = element.querySelector('h2 a')?.getAttribute('href');
                    return { title, link };
                });

                return rows;
            });

            articles.push(...scrapedArticles);

            pageNumber++;
            hasNextPage = scrapedArticles.length > 0;
        }

        await browser.close();

        // Save the articles to the database
        // Replace this with your actual database saving logic
        console.log(articles);
        // Your database saving logic goes here

    } catch (error) {
        console.error('An error occurred while scraping:', error);
        page?.close();
        browser?.close();

        //  check for any potentially saved articles and sae them if they  do not exist in the database
    }
};

const ScrapePage = () => {
    const url = 'https://css-tricks.com/category/articles';
    scrapeWebsite(url);

    return <div>Scraping CSS-Tricks...</div>;
};

export default ScrapePage;
