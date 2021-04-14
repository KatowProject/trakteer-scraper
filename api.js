const db = require('quick.db');
const fs = require('fs');
const $ = require('cheerio');
const tools = require('./tools');
class Trakteer {

    constructor() {
        this.config = require('./config.json');
    }

    getData() {
        return new Promise(async (resolve, reject) => {
            try {

                const point = fs.readFileSync('endpoint.txt', 'utf8');
                const res = await tools.get(point);
                const donet = res.data.data;

                const list = [];
                donet.forEach((a, i) => {

                    const donatur = {
                        createdAt: a.created_at,
                        supporter: a.supporter.split('<')[0],
                        support_message: a.support_message === '-' ? '-' : $(a.support_message).text().trim().split('\n'),
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

                resolve(list);

            } catch (e) {

                reject(e);

            }

        });

    }

    getTotalBalance() {
        return new Promise(async (resolve, reject) => {

            try {

                const res = await tools.get('manage/tip-received');
                const response = $(res.data).find('span.text-primary').text();

                resolve(response);

            } catch (e) {

                reject(e);

            }

        });
    }

    Notifications(boolean) {

        const interval = setInterval(this.notify, this.config.time);
        interval.method = this;
        if (boolean === true) interval;
        else clearInterval(interval);

    }

    async notify(boolean) {

        if (boolean == false) return;
        const donaturData = await this.method.getData();
        const dbDonet = db.get('data');
        if (!db) db.set('data', donaturData);
        if (donaturData.length == dbDonet.length) {

            const msg = donaturData[0].support_message;
            msg.pop();

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
                                "value": msg.join(' ')
                            },
                            {
                                "name": "Durasi Role",
                                "value": `${parseInt(donaturData[0].unit[0]) * 28} hari`
                            }
                        ]
                    },
                ]
            }

            await tools.post(this.method.config.webhook, json, {
                'Content-Type': 'application/json'
            })

            db.set('data', donaturData);
        } else false;

    }

}





module.exports = Trakteer;