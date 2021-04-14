const baseURL = 'https://trakteer.id/';
const { cookie } = require('./config.json');
const axios = require('axios');

function get(endpoint) {
    return new Promise(async (resolve, reject) => {
        try {

            const res = await axios.get(baseURL + endpoint, {
                headers: {
                    cookie
                }
            })

            if (res.status === 200) return resolve(res);
            else reject(res);

        } catch (err) {
            reject(err.message);
        }
    });
}

function post(webhook, data, headers) {
    return new Promise(async (resolve, reject) => {
        try {

            const res = await axios.post(webhook, data, {
                headers
            })

            if (res.status === 200) return resolve(res);
            else reject(res);

        } catch (err) {

            reject(err);
        }
    })
}


module.exports = { get, post };