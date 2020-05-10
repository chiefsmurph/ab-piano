const scanPic = require('./scan-pic');
// const uniq = arr => [...new Set(arr)];
const { uniqBy } = require('lodash');

const { getAirbnbIdFromUrl } = require('./utils');
const Listing = require('./models/Listing');

module.exports = async (browser, url) => {


  // actions

  const gotoPicSlideshow = () => page.click('[data-veloute="hero-view-photos-button"]');
  const getPicData = () => page.evaluate(() => ({
    url: document.querySelector('[data-veloute="slideshow-image"]').src,
    description: document.querySelector('[data-veloute="slideshow-modal"] > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)').textContent
  }));
  const nextPic = () => page.click('button[aria-label="Next"]');
  
  const expandReadmore = () => page.evaluate(() => 
    Array.from(document.querySelectorAll('div'))
      .find(el => el.textContent === 'Read more about the space')
      .querySelector('button').click()
  );
  const getTitle = () => page.evaluate(() => document.querySelector('[itemprop="name"] h1').textContent);
  const getDescription = () => page.evaluate(() => 
    Array.from(document.querySelectorAll('#details > div > div')).slice(0, 2).map(node => node.textContent).join('\n\n')
  );


  
  // run

  console.log(`scanning ${url}`);

  const airbnbId = getAirbnbIdFromUrl(url);
  console.log({ airbnbId})
  const foundListing = await Listing.findOne({ airbnbId }).lean({ virtuals: true });
  if (foundListing) {
    return foundListing;
  }



  // load page
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitFor(1000);


  // get basic info
  await expandReadmore();
  await page.waitFor(1000);
  const description = await getDescription();
  const title = await getTitle();

  
  // get pic info
  await gotoPicSlideshow();
  await page.waitFor(6000);


  let pics = [];
  let lastCount = undefined;
  while (lastCount !== pics.length) {
    lastCount = pics.length;
    pics.push();
    pics = [
      ...pics,
      await getPicData()
    ];
    pics = uniqBy(pics, 'url');
    await nextPic();
    console.log({pics})
  }

  await page.close();


  // now scan pics

  let scanned = [];
  for (let { url, description} of pics) {
    scanned = [
      ...scanned,
      {
        url,
        description,
        ...await scanPic(url)
      }
    ];
  }

  const images = scanned.map(({ url, description, classifications }) => {
    const objects = classifications.reduce((inner, { className }) => [
      ...inner,
      ...className.split(', ')
    ], []);
    return {
      url,
      description,
      objects,
    };
  }, []);

  const createdListing = await Listing.create({
    airbnbId,
    url,
    title,
    description,
    images
  });

  return createdListing;

};