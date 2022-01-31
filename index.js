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

  const selector = 'body > p:nth-child(1) > strong';
  await page.waitForSelector(selector);
  let element = await page.$(selector);
  let warning = await page.evaluate(el => el.textContent, element);
  
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
  */

  // Cabeçalho - OK
  await page.waitForSelector('#formConfig > div.veiculo > h2');
  let versionName = await page.$eval('#formConfig > div.veiculo > h2', el => el.textContent);
  let versionNameSlicePrice = versionName.indexOf('R$');
  versionName = versionName.slice(0, versionNameSlicePrice).replace('\n', ' ').replace('  ', ' ');

  await page.waitForSelector('#formConfig > div.veiculo > h2 > span.codigo');
  const versionCode = await page.$eval('#formConfig > div.veiculo > h2 > span.codigo', el => el.textContent.replace('(', '').replace(')', ''));

  const versionYear = parseInt(versionName.slice(-4));
  console.log(`Nome: ${versionName} | Code: ${versionCode} | Year: ${versionYear}`);

  // Preços adicionais de cores - OK
  await page.waitForSelector('#pintura > label');
  const paintingName = await page.evaluate(() => Array.from(document.querySelectorAll('#pintura > label'), element => element.textContent));
  for (let i = 0; i < paintingName.length; i++) {
    indexSlice = paintingName[i].lastIndexOf('R$');
    paintingName[i] = paintingName[i].slice(0, indexSlice);

    indexSlice = paintingName[i].lastIndexOf(')');
    startName = paintingName[i].slice(indexSlice + 1);
    
    indexSlice = paintingName[i].lastIndexOf(')');
    endName = paintingName[i].slice(0, indexSlice + 1);
    
    paintingName[i] = `${startName} - ${endName}`;
  }

  const paintingPrice = await page.evaluate(() => Array.from(document.querySelectorAll('#pintura > label'), element => element.getAttribute('name')));
  for (let i = 0; i < paintingPrice.length; i++) {
    indexSlice = paintingPrice[i].lastIndexOf(';');
    paintingPrice[i] = parseFloat(paintingPrice[i].slice(indexSlice + 1));
  }
  console.log(`Paintings: ${paintingName}`);
  console.log(`Painting Prices: ${paintingPrice}`);

  // Preço público - OK
  await page.waitForSelector('#formConfig > ul.precos > li.preco_base > span');
  let publicPrice = await page.evaluate(() => Array.from(document.querySelectorAll('#formConfig > ul.precos > li.preco_base > span'), element => element.textContent.slice(3).replace(".", "").replace(",", ".")));
  publicPrice = parseFloat(publicPrice);
  console.log(`Public Price: ${publicPrice}`);
  
  // Descontos - OK
  await page.waitForSelector('#desconto_faixas > option');
  const discountBands = await page.evaluate(() => Array.from(document.querySelectorAll('#desconto_faixas > option'), element => element.textContent));
  const discountPercentages = await page.evaluate(() => Array.from(document.querySelectorAll('#desconto_faixas > option'), element => parseFloat(element.getAttribute('mytaxa'))));
  console.log(`Discount Bands: ${discountBands}`);
  console.log(`Discount Percentages: ${discountPercentages}`);

  console.log('Finalizando');
})();