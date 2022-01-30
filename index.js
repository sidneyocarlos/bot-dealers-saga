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
  
  // Seletores de filtro
  await page.waitForSelector('#muda_marca > option');
  const changeBrandsName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_marca > option'), element => element.textContent));
  const changeBrandsValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_marca > option'), element => element.value));
  //console.log(changeBrandsName, changeBrandsValue);

  await page.waitForSelector('#muda_familia > option');
  const familiesName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_familia > option'), element => element.textContent));
  const familiesValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_familia > option'), element => element.value));
  //console.log(familiesName, familiesValue);

  await page.waitForSelector('#muda_versao > option');
  const versionsName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_versao > option'), element => element.textContent));
  const versionsValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_versao > option'), element => element.value));
  //console.log(versionsName, versionsValue);

  // Nome
  await page.waitForSelector('#formConfig > div.veiculo > h2');
  const carTitle = await page.evaluate(() => document.querySelectorAll('#formConfig > div.veiculo > h2'), element => element.textContent);
  //const carTitleValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_versao > option'), element => element.value));
  //console.log(carTitle);

  // Cores e preços adicionais
  await page.waitForSelector('#pintura > label');
  const carPainting = await page.evaluate(() => Array.from(document.querySelectorAll('#pintura > label'), element => element.textContent));
  //const carPaintingValue = await page.evaluate(() => Array.from(document.querySelectorAll('#pintura'), element => element.name));
  //console.log(carPainting);

  // Descontos
  await page.waitForSelector('#desconto_faixas > option');
  const discount = await page.evaluate(() => Array.from(document.querySelectorAll('#desconto_faixas > option'), element => element.textContent));
  const discountValue = await page.evaluate(() => Array.from(document.querySelectorAll('#desconto_faixas > option'), element => element.value));
  //console.log(discount, discountValue);

  // Preço público
  await page.waitForSelector('#formConfig > ul.precos > li.preco_base > span');
  let publicPrice = await page.evaluate(() => Array.from(document.querySelectorAll('#formConfig > ul.precos > li.preco_base > span'), element => element.textContent.slice(3).replace(".", "").replace(",", ".")));
  publicPrice = parseFloat(publicPrice);
  console.log(publicPrice);
  
  console.log('Finalizando');
})();