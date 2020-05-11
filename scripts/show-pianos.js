const init = require('../init');
const Listing = require('../models/Listing');

(async () => {

  await init();
  const withPianos = await Listing.find({
    maxSeenScore: {
      $gt: 0
    }
  });
  console.log(JSON.stringify({withPianos}, null, 2))
})();