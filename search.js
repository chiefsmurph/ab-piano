const getListingsFromSearch = require('./get-listings-from-search');
const scanListing = require('./scan-listing');
const init = require('./init');

const run = async () => {

  const { browser } = await init();

  // return console.log(
  //   await scanListing(browser, 'https://www.airbnb.com/rooms/14615878?location=Las%20Vegas%2C%20NV%2C%20United%20States&check_in=2020-05-10&check_out=2020-06-30&previous_page_section_name=1000&federated_search_id=8198b337-6396-41dc-a099-254579b531f1')
  // )

  const searchUrl = "https://www.airbnb.com/s/Las-Vegas--NV--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes%2Flts&source=structured_search_input_header&search_type=pagination&ne_lat=39.02017240898619&ne_lng=-111.4872684375&sw_lat=32.658947140009204&sw_lng=-119.5732059375&zoom=7&search_by_map=true&place_id=ChIJ0X31pIK3voARo3mz1ebVzDo&federated_search_session_id=8f744934-d400-4ec7-90ff-9e43f5b5abdf&query=Las%20Vegas%2C%20NV&checkin=2020-05-10&checkout=2020-06-30&price_max=2343&room_types%5B%5D=Entire%20home%2Fapt&amenities%5B%5D=8";
  // const searchUrl = "https://www.airbnb.com/s/Las-Vegas--NV--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes%2Flts&source=structured_search_input_header&search_type=filter_change&ne_lat=52.674218789492706&ne_lng=-82.4172472899865&sw_lat=28.812673793946406&sw_lng=-114.7609972899865&zoom=5&search_by_map=true&place_id=ChIJ0X31pIK3voARo3mz1ebVzDo&query=Las%20Vegas%2C%20NV&checkin=2020-05-10&checkout=2020-06-30&price_max=1004&room_types%5B%5D=Entire%20home%2Fapt&amenities%5B%5D=8";
  const listings = await getListingsFromSearch(browser, searchUrl);

  const analyzed = [];
  let index = 0;
  for (let listing of listings) {
    console.log(`starting ${++index} / ${listings.length}...`);
    const newScan = {
      ...listing,
      ...await scanListing(browser, listing)
    };
    analyzed.push(newScan);
    if (newScan.hasPiano) {
      console.log('\n');
      console.log(`ALERT ALERT ${newScan.airbnb} has a piano!!`);
      console.log(newScan.url);
      console.log('\n');
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const total = analyzed.length;
  const withPiano = analyzed.filter(listing => listing.hasPiano).map(({ airbnbId }) => airbnbId);

  console.log({
    total,
    withPiano
  });
  
  return analyzed;

};


run();