const axios = require('axios').default;
const cheerio = require('cheerio');
const AdmZip = require('adm-zip');

const url = 'https://addons.mozilla.org/en-US/firefox/addon/i-dont-care-about-cookies/versions/';

axios(url).then(async (response) => {
    const $ = cheerio.load(response.data);
    const url = $('a[href^="https://addons.mozilla.org/firefox/downloads"]').attr('href');

    const x = await axios(url, {
        responseType: 'arraybuffer'
    }).then(x => x.data)

    const unzipper = new AdmZip(x);
    unzipper.extractAllTo(__dirname + '/../extension', true);
}).catch(console.error);