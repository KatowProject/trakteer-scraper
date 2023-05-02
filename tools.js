const baseURL = 'https://trakteer.id/';
const axios = require('axios');

class AxiosResponse {
    constructor({ auth: { xsrfToken, trakteerIdSession } }) {
        this.request = axios.create({
            baseURL,
            headers: {
                cookie: `XSRF-TOKEN=${xsrfToken}; trakteer-sess=${trakteerIdSession}`,
                Referer: baseURL,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36'
            }
        });
    }

    async bypass(url) {
        const bs64 = Buffer.from(url).toString('base64');
        const res = await this.request.get(`https://katowproject.my.id/?q=${bs64}`);

        return res.data;
    }
}

module.exports = AxiosResponse;

// function get(endpoint, options) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const res = await axios.get(baseURL + endpoint, {
//                 headers: {
//                     cookie: `XSRF-TOKEN=${options['XSRF-TOKEN']}; trakteer-sess=${options['trakteer-id-session']}`
//                 }
//             })

//             if (res.status === 200) return resolve(res);
//             else reject(res);
//         } catch (err) {
//             reject(err.message);
//         }
//     });
// }

// function post(json, url) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const res = await axios.post(url, json, {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (res.status === 204) return resolve(res);
//             else reject(res);
//         } catch (err) {
//             reject(err);
//         }
//     });
// }


// module.exports = { get, post };