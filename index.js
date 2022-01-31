require('dotenv').config();
const puppeteer = require('puppeteer');

const options = {
  headless: false,
  defaultViewport: null,
  args: ['--window-size=1600,900'],
}

async function login (page) {
  await page.goto('https://dealers.vendascorporativas.com.br');
	await page.type('#usuario_codigo', process.env.LOGIN);
	await page.type('[type="password"]', process.env.PASSWORD);	
	await page.click('#btSubmit');

  const warningPath = 'body > p:nth-child(1) > strong';
  await page.waitForSelector(warningPath);
  let el = await page.$(warningPath);
  let warning = await page.evaluate(el => el.textContent, el);
  
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
  
  // Seleciona Marca
  await page.waitForSelector('#muda_marca > option');
  const changeBrandsName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_marca > option'), el => el.textContent));
  const changeBrandsValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_marca > option'), el => el.value));
  console.log(changeBrandsName, changeBrandsValue);  

  for (let i = 0; i < changeBrandsValue.length; i++) {
    // Navega pelas marcas
    await page.waitForSelector('#muda_marca > option');
    await page.select('select[name="muda_marca"]', changeBrandsValue[i]);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Seleciona família
    await page.waitForSelector('#muda_familia > option');
    const familiesName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_familia > option'), el => el.textContent));
    const familiesValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_familia > option'), el => el.value));
    console.log(familiesName, familiesValue);
    
    for (let i = 0; i < familiesValue.length; i++) {
      // Navega pelas famílias
      await page.waitForSelector('#muda_familia > option');
      await page.select('select[name="muda_familia"]', familiesValue[i]);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Seleciona Versão
      await page.waitForSelector('#muda_versao > option');
      const versionsName = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_versao > option'), el => el.textContent));
      const versionsValue = await page.evaluate(() => Array.from(document.querySelectorAll('#muda_versao > option'), el => el.value));
      console.log(versionsName, versionsValue);
      
      for (let i = 0; i < versionsValue.length; i++) {
        // Navega pelas versões
        await page.waitForSelector('#muda_versao > option');
        await page.select('select[name="muda_versao"]', versionsValue[i]);
        await new Promise(resolve => setTimeout(resolve, 2000));

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
        const paintingName = await page.evaluate(() => Array.from(document.querySelectorAll('#pintura > label'), el => el.textContent));
        const paintingPrice = [...paintingName];
        for (let i = 0; i < paintingName.length; i++) {
          indexSlice = paintingName[i].lastIndexOf('R$');
          paintingName[i] = paintingName[i].slice(0, indexSlice);
        }
      
        for (let i = 0; i < paintingPrice.length; i++) {
          indexSlice = paintingPrice[i].lastIndexOf('R$');
          paintingPrice[i] = parseFloat(paintingPrice[i].slice(indexSlice).replace('R$ ', '').replace('.', '').replace(',', '.'));
        }
        console.log(`Paintings: ${paintingName}`);
        console.log(`Painting Prices: ${paintingPrice}`);
      
        // Preço público - OK
        await page.waitForSelector('#formConfig > ul.precos > li.preco_base > span');
        let publicPrice = await page.evaluate(() => Array.from(document.querySelectorAll('#formConfig > ul.precos > li.preco_base > span'), el => el.textContent.slice(3).replace(".", "").replace(",", ".")));
        publicPrice = parseFloat(publicPrice);
        console.log(`Public Price: ${publicPrice}`);
        
        // Descontos - OK
        await page.waitForSelector('#desconto_faixas > option');
        const discountBands = await page.evaluate(() => Array.from(document.querySelectorAll('#desconto_faixas > option'), el => el.textContent));
        const discountPercentages = await page.evaluate(() => Array.from(document.querySelectorAll('#desconto_faixas > option'), el => parseFloat(el.getAttribute('mytaxa'))));
        console.log(`Discount Bands: ${discountBands}`);
        console.log(`Discount Percentages: ${discountPercentages}`);
      }
    }    
  }

  console.log('Finalizando');
})();