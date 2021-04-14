const TrakteerScrap = require('./index');

const trakteer = new TrakteerScrap();

const test = async () => {
    console.log(await trakteer.Notifications(true))
}
test()