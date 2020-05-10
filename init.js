
const mongoose = require('mongoose');
const { mongoConnectionString } = require('./config');
const puppeteer = require('puppeteer');

module.exports = async () => {
  mongoose.connect(mongoConnectionString, { useNewUrlParser: true });

  const browser = await puppeteer.launch({
    headless: false
  });

  return {
    browser
  };

};