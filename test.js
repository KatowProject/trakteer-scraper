const client = require('./index');

const Trakteer = new client({
    'XSRF-TOKEN': 'xsrf',
    'trakteer-id-session': 'trakteer',
    'webhook': 'webhook url'
});


(async () => {
    console.log(await Trakteer.getSaldo());
    console.log(await Trakteer.getOrderDetail('vgxe3x9lnjm3ladb'));
})()