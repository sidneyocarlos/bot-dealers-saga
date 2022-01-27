require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
		headless: false,
	});
  const page = await browser.newPage();
  await page.goto('https://dealers.vendascorporativas.com.br/');

	await page.type('#usuario_codigo', process.env.LOGIN);
	await page.type('[type="password"]', process.env.PASSWORD);

  // await browser.close();
})();

// console.log(process.env.LOGIN);
// console.log(process.env.PASSWORD);