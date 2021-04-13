const axios = require('axios');
const db = require('quick.db');
const fs = require('fs');
const $ = require('cheerio');

const baseURL = 'https://trakteer.id/';
const { time, cookie } = require('./config.json');

const tools = {
    get: function (endpoint) {
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
}

const getData = async () => {

    const point = fs.readFileSync('endpoint.txt', 'utf8');
    const res = await tools.get(point);
    const donet = res.data.data;

    const list = [];
    donet.forEach((a, i) => {

        const donatur = {
            createdAt: a.created_at,
            supporter: a.supporter.split('<')[0],
            support_message: a.support_message === '-' ? '-' : $(a.support_message).text().split('\n')[0],
            unit: [
                a.quantity,
                $(a.unit).attr('src')
            ],
            nominal: [
                $(a.nominal).find('tr:nth-of-type(1) td:nth-of-type(3)').text(),
                $(a.nominal).find('tr:nth-of-type(2) td:nth-of-type(3)').text(),
                $(a.nominal).find('tr:nth-of-type(3) td:nth-of-type(3)').text(),
                $(a.nominal).find('tr:nth-of-type(4) th.text-left:nth-of-type(3)').text()
            ]
        }

        list.push(donatur);
    })

    return list;

}

const getSaldo = async () => {

    const res = await tools.get('manage/tip-received');
    const response = $(res.data).find('span.text-primary').text();

    return response;

}


const notify = async (boolean) => {

    if (boolean == false) return;
    const donaturData = await getData();
    const dbDonet = db.get('data');
    if (!db) db.set('data', donaturData);
    if (donaturData.length > dbDonet.length) {
        const json = {
            "content": "tengtong ada donatur masuk!",
            "embeds": [
                {
                    "title": "Donasi Trakteer ",
                    "color": 11826264,
                    "footer": {
                        "icon_url": "https://cdn.discordapp.com/emojis/827038555896938498.png",
                        "text": "1 Koin = Rp 10.000,00.-"
                    },
                    "fields": [
                        {
                            "name": "Donatur",
                            "value": donaturData[0].supporter
                        },
                        {
                            "name": "Unit Donasi",
                            "value": `<:santai:827038555896938498> ${donaturData[0].unit[0]} Koin`
                        },
                        {
                            "name": "Pesan Dukungan",
                            "value": donaturData[0].support_message
                        },
                        {
                            "name": "Durasi Role",
                            "value": `${parseInt(donaturData[0].unit[0]) * 28} hari`
                        }
                    ]
                },
            ]
        }

        await axios.post('https://discord.com/api/webhooks/831477522612092948/sFFcUD6B0RclwXc4tnKY_WG_6Th20rZr9A_jQ2M-fwgIRI52SX15cYBt_-NtTtjhO7cF', json, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        db.set('data', donaturData);
    } else false;
}

const Notifications = (boolean) => {
    if (boolean === true) setInterval(notify, time);
    else return;
}


module.exports = { getData, getSaldo, Notifications };