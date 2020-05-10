module.exports = async (browser, url) => {
  console.log(`scanning ${url}`); 
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitFor(1000);
  await page.click('[data-veloute="hero-view-photos-button"]');
  await page.waitFor(1000);

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

  return pics;
};