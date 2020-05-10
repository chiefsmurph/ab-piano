const puppeteer = require('puppeteer');
const getListingsFromSearch = require('./get-listings-from-search');
const scanListing = require('./scan-listing');


const run = async () => {

  const browser = await puppeteer.launch({
    headless: false
  });

  // const searchUrl = "https://www.airbnb.com/s/Las-Vegas--NV--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes%2Flts&source=structured_search_input_header&search_type=pagination&ne_lat=39.02017240898619&ne_lng=-111.4872684375&sw_lat=32.658947140009204&sw_lng=-119.5732059375&zoom=7&search_by_map=true&place_id=ChIJ0X31pIK3voARo3mz1ebVzDo&federated_search_session_id=8f744934-d400-4ec7-90ff-9e43f5b5abdf&query=Las%20Vegas%2C%20NV&checkin=2020-05-10&checkout=2020-06-30&price_max=2343&room_types%5B%5D=Entire%20home%2Fapt&amenities%5B%5D=8";
  // const listings = await getListingsFromSearch(browser, searchUrl);

  // const analyzed = [];
  // for (let listing of listings) {
  //   analyzed.push({
  //     ...listing,
  //     ...await scanListing(browser, listing)
  //   });
  // }


  console.log(
    await scanListing(browser, 'https://www.airbnb.com/rooms/14615878?location=Las%20Vegas%2C%20NV%2C%20United%20States&check_in=2020-05-10&check_out=2020-06-30&previous_page_section_name=1000&federated_search_id=131c7330-2578-4099-a177-23918469a344')
  )



  return analyzed;

};


run();