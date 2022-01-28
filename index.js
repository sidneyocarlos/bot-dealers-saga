require('dotenv').config();
const puppeteer = require('puppeteer');
const SITE_URL = 'https://dealers.vendascorporativas.com.br';

const options = {
  headless: false,
  defaultViewport: null,
  args: ['--window-size=1600,900'],
}

async function login (page) {
  await page.goto(SITE_URL);
	await page.type('#usuario_codigo', process.env.LOGIN);
	await page.type('[type="password"]', process.env.PASSWORD);	
	await page.click('#btSubmit');

  const selector = 'body > p:nth-child(1) > strong'
  await page.waitForSelector(selector)
  let element = await page.$(selector)
  let warning = await page.evaluate(el => el.textContent, element)
  
  await new Promise(resolve => setTimeout(resolve, 500));

  if (warning == 'Atenção!') {
    console.log('Idenficado login duplicado. Refazendo login...');
    login(page);
  }
}

;(async () => {
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();

	await login(page);

  await page.waitForSelector('#header > header > nav > ul > li:nth-child(2) > a');
  await page.click('#header > header > nav > ul > li:nth-child(2) > a');

  /*
  {
    brand: {
      name: 'Volkswagen',
      value: 'vw',

      family: {
        name: 'GOL',
        value: 'f-GOL',

        version: {
          name: 'GOL 1.0 MPI (5U7TA4-2)',
          value: 'v-5U7TA4-2-2022',
        }

        version: {
          name: 'GOL 1.6 (5U7TE4-2)',
          value: 'v-5U7TE4-2-2022',
        }

        version: {
          name: 'GOL 1.6 MSI (5U7TS2-2)',
          value: 'v-5U7TS2-2-2022',
        }
      }

      family: {
        name: 'GOL',
        value: 'f-GOL',

        version: {
          name: 'GOL 1.0 MPI (5U7TA4-2)',
          value: 'v-5U7TA4-2-2022',
        }

        version: {
          name: 'GOL 1.6 (5U7TE4-2)',
          value: 'v-5U7TE4-2-2022',
        }

        version: {
          name: 'GOL 1.6 MSI (5U7TS2-2)',
          value: 'v-5U7TS2-2-2022',
        }
      }
    }
  }
  */
  
  
  await page.waitForSelector('#muda_marca > option');
  const changeBrandsName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_marca > option'), element => element.textContent));
  const changeBrandsValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_marca > option'), element => element.value));
  console.log(changeBrandsName, changeBrandsValue);

  await page.waitForSelector('#muda_familia > option');
  const familiesName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_familia > option'), element => element.textContent));
  const familiesValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_familia > option'), element => element.value));
  console.log(familiesName, familiesValue);

  await page.waitForSelector('#muda_familia > option');
  const versionsName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_versao > option'), element => element.textContent));
  const versionsValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_versao > option'), element => element.value));
  console.log(versionsName, versionsValue);
  
  console.log('Finalizando');
})();