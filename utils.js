module.exports = {
  getAirbnbIdFromUrl: url => url.split('/').pop().split('?')[0]
};