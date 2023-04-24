require('dotenv').config();
import Trakteer from '../src';
const trakteer = new Trakteer();

trakteer.init(process.env.XSRF_TOKEN!, process.env.TRAKTEER_SESSION!);

trakteer.getHistory(1, 5).then((res) => console.log(res)).catch((err) => console.log(err));
