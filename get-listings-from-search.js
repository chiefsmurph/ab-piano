const getListingsFromSearchPage = page =>
  page.evaluate(() => 
    Array.from(
      document.querySelectorAll('[itemprop="itemListElement"] a')
    ).map(node => node.href)
  );

const gotoNextPage = page =>
  page.evaluate(() => 
    document.querySelector('[data-id="SearchResultsPagination"] li:last-of-type a').click()
  );

const scan = async (browser, url, limit = 20) => {

  const page = await browser.newPage();
  await page.goto(url);

  let allResults = [];
  while (allResults.length < limit) {
    allResults = [
      ...allResults,
      ...await getListingsFromSearchPage(page)
    ];
    console.log(JSON.stringify({ allResults, count: allResults.length }, null, 2));
    await page.waitFor(3000);
    await gotoNextPage(page);
    await page.waitFor(3000);
  }



  await page.close();

  return allResults;
};

module.exports = scan;