require('dotenv').config();
import Trakteer from '../src';
const trakteer = new Trakteer();

trakteer.init(process.env.XSRF_TOKEN!, process.env.TRAKTEER_SESSION!);

// trakteer.getHistory(1, 10).then((res) => console.log(res)).catch((err) => console.log(err));
// trakteer.getDonaturData(1, 10).then((res) => console.log(res)).catch((err) => console.log(err));
trakteer.getOrderDetail('l0865ygnx6j5bgme').then((res) => console.log(res)).catch((err) => console.log(err));
