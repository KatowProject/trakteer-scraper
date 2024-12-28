import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join as pjoin } from 'path';
import Axios from './tools';
import { load } from 'cheerio';
import { OrderDetailResponse, SaldoResponse } from './types';

class Trakteer {
    private ready: boolean = false;
    private axios: Axios | null = null;
    private notificationInterval: NodeJS.Timer | null = null;
    private notificationEnabled: boolean = false;
    private notificationWebhookUrl: string | null = null;
    protected XSRF_TOKEN: string | null = null;
    protected TRAKTEER_SESSION: string | null = null;
    protected Proxy: string | null = null;
    protected TIME_NOTIFICATION: number | null = null;
    protected WEBHOOK_URL: string | null = null;

    async getSaldo(): Promise<SaldoResponse | undefined> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        try {
            const res = await this.axios?.get('manage/dashboard');
            const data = res?.data;

            const $ = load(data);
            const saldo = $('.col-xs-12').eq(0).find('.head').text().trim();
            const currentSaldo = $('.col-xs-12').eq(1).find('.head').text().trim();
            const donationLength = $('.col-xs-12').eq(2).find('.head').text().trim();
            const withdrawAmount = $('.col-xs-12').eq(3).find('.head').text().trim();
            const supporterActive = $('.col-xs-12').eq(4).find('.head').text().trim();

            const parseValue = (value: string) => parseInt(value.match(/\d+/g)?.join('') || value);

            return {
                saldo: parseValue(saldo),
                current_donation: parseValue(currentSaldo),
                donation_length: parseValue(donationLength),
                withdraw_amount: parseValue(withdrawAmount),
                supporter_active: parseValue(supporterActive)
            };
        } catch (err) {
            throw err;
        }
    }

    async getHistory(page: number = 1, length: number = 25): Promise<any> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        try {
            const res = await this.axios?.get('manage/balance/fetch', {
                type: 'all',
                'columns[0][data]': 'created_at',
                'order[0][dir]': 'desc',
                start: page === 1 ? 0 : (page * length) - length,
                length
            });

            const data = res?.data;
            for (const [index, value] of data.data.entries()) {
                const $ = load(value.jumlah);

                const jumlah = $('span').text().replace(/(\r\n|\n|\r|\?)/gm, "").trim();
                const description = value.description.replace(/(\r\n|\n|\r)/gm, "").replace(/&#039;/g, "'");

                value.description = description;
                value.jumlah = jumlah;

                data.data[index] = value;
            }
            return data;
        } catch (err) {
            throw err;
        }
    }

    async getDonaturData(page: number = 1, length: number = 25): Promise<any> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        try {
            const res = await this.axios?.get('manage/tip-received/support-message/fetch', {
                'columns[0][data]': 'created_at',
                'order[0][column]': 0,
                'order[0][dir]': 'desc',
                start: page === 1 ? 0 : (page * length) - length,
                length
            });

            return res?.data;
        } catch (err) {
            throw err;
        }
    }

    async getSupporter(page: number = 1, length: number = 25): Promise<any> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        try {
            const res = await this.axios?.get('manage/my-supporters/users/fetch', {
                'columns[4][data]': 'last_supported_at',
                'order[0][column]': 4,
                'order[0][dir]': 'desc',
                start: page === 1 ? 0 : (page * length) - length,
                length
            });

            const data = res?.data;
            const arr = data.data.map((value: any) => {
                const _ava = load(value.ava);
                const ava = _ava('img').attr('src');

                const arr_alias: Array<any> = [];
                const _alias = load(value.alias);
                _alias('li').each((i, el) => {
                    const name = _alias(el).text().trim().replace(/(\r\n|\n|\r)/gm, "");
                    arr_alias.push(name);
                });

                const _isActive = load(value.is_active);
                const lastIsActived = _isActive('small').text().trim().replace(/(\r\n|\n|\r)/gm, "");
                _isActive('small').remove();
                const isActive = _isActive('div').text().trim().replace(/(\r\n|\n|\r)/gm, "");

                return {
                    reference_id: value.reference_id,
                    supporter_name: value.supporter_name.split('_!!!_'),
                    sum: value.sum,
                    last_supported_at: value.last_supported_at,
                    ava,
                    alias: arr_alias,
                    is_active: !!isActive,
                    last_is_actived: lastIsActived || null
                };
            });

            return arr;
        } catch (err) {
            throw err;
        }
    }

    async getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        try {
            const res = await this.axios?.get(`manage/tip-received/${orderId}`);
            const data = res?.data;
            const $ = load(data);

            const orderID = orderId;
            const tanggal = $('tbody').find('tr:contains("Tanggal")').find('td').text().trim();
            const nama = $('tbody').find('tr:contains("Nama")').find('td').text().replace(/\s+|&nbsp;/g, '');
            const unit = {
                length: $('tbody').find('tr:contains("Unit")').find('td').text().trim(),
                image: $('tbody').find('tr:contains("Unit")').find('td').find('img').attr('src')!
            }
            const nominal = $('tbody').find('tr:contains("Nominal")').find('td').text().trim();
            const message = $('.block').text().trim();

            return {
                orderId: orderID,
                tanggal,
                nama,
                unit,
                nominal,
                message
            };
        } catch (err) {
            throw err;
        }
    }

    async getLeaderboard(): Promise<any> {
        try {
            const res = await this.axios?.get('manage/my-supporters');
            const data = res?.data;
            const $ = load(data);

            const arr: Array<any> = [];
            const main = $('#my-top-supporters').find('.row');
            main.find('.mb-20').each((i, el) => {
                const title = $(el).find('.title').text().trim();

                const arr_supporter: Array<any> = [];
                $(el).find('.supporter').each((j, ele) => {
                    $('.prevname').remove();
                    const name = $(ele).find('.name').find('span').text().trim().replace(/\s+|&nbsp;/g, '');
                    const unit = $(ele).find('.unit').text().trim();

                    arr_supporter.push({
                        name,
                        unit
                    });
                });

                arr.push({
                    title,
                    supporter: arr_supporter
                });
            });

            return arr;
        } catch (err) {
            throw err;
        }
    }

    webhookNotification(enable: boolean, webhookUrl: string, timeout: number): void {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        if (!enable) {
            this.notificationEnabled = false;
            this.notificationWebhookUrl = null;
            if (this.notificationInterval) clearInterval(this.notificationInterval as NodeJS.Timeout);

            console.log('Trakteer webhook notification disabled');
            return;
        }

        if (!timeout) throw new Error('Timeout is required');
        if (!webhookUrl) throw new Error('Webhook URL is required');
        if (this.notificationInterval) clearInterval(this.notificationInterval as NodeJS.Timeout);

        this.notificationInterval = setInterval(this.fetchNotification.bind(this), timeout);
        this.notificationEnabled = true;
        this.notificationWebhookUrl = webhookUrl;
    }

    private async fetchNotification(): Promise<void> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        if (!this.notificationEnabled) return;
        if (!this.notificationWebhookUrl) throw new Error('Webhook URL is required');

        const path = './data/last-donatur.json';
        if (!existsSync(pjoin(__dirname, path))) {
            mkdirSync(pjoin(__dirname, './data'), { recursive: true });
            writeFileSync(pjoin(__dirname, path), JSON.stringify({ id: null }));
        }
        const lastDonatur = readFileSync(pjoin(__dirname, path), 'utf-8');
        const lastDonaturJson = JSON.parse(lastDonatur);

        const donaturs = await this.getDonaturData(1, 2);
        const donatur = donaturs.data ? donaturs.data[0] : null;
        if (!donatur) return;

        if (lastDonaturJson.id === donatur.id) return;
        lastDonaturJson.id = donatur.id;

        try {
            await this.axios?.self.post(this.notificationWebhookUrl, { content: JSON.stringify(donatur) }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            writeFileSync(pjoin(__dirname, path), JSON.stringify(lastDonaturJson));
            console.log('Trakteer webhook notification sent');
        } catch (err: any) {
            console.log(`Trakteer webhook notification failed: ${err.message}`);
        }
    }

    init(xsrfToken: string, trakteerSession: string, proxy?: string): void {
        if (!xsrfToken) throw new Error('xsrfToken is required');
        if (!trakteerSession) throw new Error('trakteerSession is required');

        this.XSRF_TOKEN = xsrfToken;
        this.TRAKTEER_SESSION = trakteerSession;
        this.axios = new Axios({ XSRF_TOKEN: this.XSRF_TOKEN, TRAKTEER_SESSION: this.TRAKTEER_SESSION }, proxy);

        this.ready = true;
    }
}

export default Trakteer;