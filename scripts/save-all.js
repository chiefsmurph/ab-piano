const init = require('../init');
const Listing = require('../models/Listing');

(async () => {

  await init();
  const listings = await Listing.find({});
  console.log({listings})
  for (let listing of listings) {
    await listing.save();
    console.log(listing);
  }
})();