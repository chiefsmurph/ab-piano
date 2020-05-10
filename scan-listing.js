const scanPic = require('./scan-pic');
const uniq = arr => [...new Set(arr)];
module.exports = async (browser, url) => {

  console.log(`scanning ${url}`); 
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitFor(1000);
  await page.click('[data-veloute="hero-view-photos-button"]');
  await page.waitFor(6000);

  const getPicUrl = () => page.evaluate(() => document.querySelector('[data-veloute="slideshow-image"]').src);
  const nextPic = () => page.click('button[aria-label="Next"]');


  let pics = [];
  let lastCount = undefined;
  while (lastCount !== pics.length) {
    lastCount = pics.length;
    pics.push();
    pics = [
      ...new Set([
        ...pics,
        await getPicUrl()
      ])
    ];
    await nextPic();
    console.log({pics})
  }

  await page.close();

  let scanned = [];
  for (let pic of pics) {
    scanned = [
      ...scanned,
      await scanPic(pic)
    ];
  }

  const allObjects = uniq(scanned.reduce((acc, picScan) => {
    const { url, classifications } = picScan;
    const objects = classifications.reduce((inner, { className }) => [
      ...inner,
      ...className.split(', ')
    ], []);
    return [
      ...acc,
      ...objects
    ]
  }, []));

  return {
    scanned,
    allObjects,
    hasPiano: allObjects.includes('piano')
  };
};