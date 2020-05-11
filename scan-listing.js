const scanPic = require('./scan-pic');
// const uniq = arr => [...new Set(arr)];
const { uniqBy } = require('lodash');

const { getAirbnbIdFromUrl } = require('./utils');
const Listing = require('./models/Listing');
const mapLimit = require('promise-map-limit');

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

  const getAllPics = async () => {
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
    }
    return pics;
  }


  
  // run

  console.log(`scanning ${url}`);

  const airbnbId = getAirbnbIdFromUrl(url);
  // console.log({ airbnbId})
  const foundListing = await Listing.findOne({ airbnbId }).lean({ virtuals: true });
  if (foundListing) {
    console.log(`found ${airbnbId} in cache`);
    return foundListing;
  }



  // load page
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitFor(1000);


  // get basic info
  try {
    await expandReadmore();
    await page.waitFor(1000);
  } catch (e) {}
  const description = await getDescription();
  const title = await getTitle();

  
  // get pic info
  let pics = [];
  try {
    pics = await getAllPics();
  } catch (e) {
    console.error(e);
  }

  await page.close();

  console.log(`found ${pics.length} pics`);

  // now scan pics

  let index = 0;
  const scanned = await mapLimit(pics, 3, async ({ url, description }) => {
    console.log(`scanning ${++index} of ${pics.length}`);
    return {
      url,
      description,
      ...await scanPic(url)
    };
  });

  const images = scanned.map(({ url, description, classifications }) => {
    const seenScore = Math.round((classifications.find(({ className }) => className.includes('piano')) || {}).probability * 100) || 0;
    return {
      url,
      description,
      seenScore,
    };
  }, []);

  const createdListing = await Listing.create({
    airbnbId,
    url,
    title,
    description,
    images
  });

  console.log(`done scanning ${title}`);
  console.log(`overall seen score: ${createdListing.overallSeenScore}`)
  await new Promise(resolve => setTimeout(resolve, 5000));

  return createdListing;

};