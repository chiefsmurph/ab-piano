const getListingsFromSearchPage = page =>
  page.evaluate(() => 
    Array.from(
      document.querySelectorAll('[itemprop="itemListElement"] a[data-check-info-section="true"]')
    ).map(node => node.href)
  );

const nextSelector = '[data-id="SearchResultsPagination"] li:last-of-type a';
const gotoNextPage = page =>
  page.evaluate(nextSelector => 
    document.querySelector(nextSelector).click(),
    nextSelector
  );

const scan = async (browser, url, limit = Number.POSITIVE_INFINITY) => {

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  let allResults = [];
  let more = true;
  do {
    allResults = [
      ...allResults,
      ...await getListingsFromSearchPage(page)
    ];
    console.log(JSON.stringify({ allResults, count: allResults.length }, null, 2));

    more = await page.$(nextSelector) !== null;
    if (more) {
      await page.waitFor(3000);
      await gotoNextPage(page);
      await page.waitFor(3000);
    }
  } while (more && allResults.length < limit)



  await page.close();

  return allResults;
};

module.exports = scan;