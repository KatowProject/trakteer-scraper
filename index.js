const data = require('./api');

(async () => {
    console.log(await data.Notifications(true));
})()