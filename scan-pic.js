var https = require('https');
var fs = require('fs');
const classify = require('./classify');

const downloadFile = (url, dest) =>
  new Promise(resolve => {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);  // close() is async, call cb after close completes.
      });
    });
  });
module.exports = async url => {
  // url.splice(4, 1);
  const filename = [
    'pics',
    url.split('/').pop().split('?')[0]
  ].join('/');
  await downloadFile(url, filename);
  // console.log(`done downloading ${url}`);

  const classifications = await classify(filename);

  const mentionsPiano = JSON.stringify(classifications).includes('piano');
  !mentionsPiano && fs.unlinkSync(filename);

  return {
    url,
    classifications
  };
};