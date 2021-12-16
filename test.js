const client = require('./index');

const Trakteer = new client({
    'XSRF-TOKEN': '',
    'trakteer-id-session': '',
    'webhook': 'webhook url'
});


(async () => {
    console.log(await Trakteer.getHistory());
})()