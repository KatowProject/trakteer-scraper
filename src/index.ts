import Axios from './tools';
import { load } from 'cheerio';
import { OrderDetailResponse, SaldoResponse } from './types';

class Trakteer {
    private ready: Boolean;
    private axios: Axios | undefined;
    protected XSRF_TOKEN: String | undefined;
    protected TRAKTEER_SESSION: String | undefined;

    constructor() {
        this.ready = false;
    }

    getSaldo(): Promise<SaldoResponse> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.axios?.get('manage/dashboard');
                const data = res?.data

                const $ = load(data);
                const saldo = $('.col-xs-12').eq(0).find('.head').text().trim();
                const currentSaldo = $('.col-xs-12').eq(1).find('.head').text().trim();
                const donationLength = $('.col-xs-12').eq(2).find('.head').text().trim();
                const withdrawAmount = $('.col-xs-12').eq(3).find('.head').text().trim();
                const supporterActive = $('.col-xs-12').eq(4).find('.head').text().trim();

                const saldoRegex = saldo.match(/\d+/g);
                const currentSaldoRegex = currentSaldo.match(/\d+/g);
                const donationLengthRegex = donationLength.match(/\d+/g);
                const withdrawAmountRegex = withdrawAmount.match(/\d+/g);
                const supporterActiveRegex = supporterActive.match(/\d+/g);

                return resolve({
                    saldo: saldoRegex ? parseInt(saldoRegex.join('')) : parseInt(saldo),
                    current_donation: currentSaldoRegex ? parseInt(currentSaldoRegex.join('')) : parseInt(currentSaldo),
                    donation_length: donationLengthRegex ? parseInt(donationLengthRegex.join('')) : parseInt(donationLength),
                    withdraw_amount: withdrawAmountRegex ? parseInt(withdrawAmountRegex.join('')) : parseInt(withdrawAmount),
                    supporter_active: supporterActiveRegex ? parseInt(supporterActiveRegex.join('')) : parseInt(supporterActive)
                });

            } catch (err) {
                return reject(err);
            }
        });
    }

    getHistory(page: number = 1, length: number = 25): Promise<any> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        return new Promise(async (resolve, reject) => {
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
                return resolve(data);
            } catch (err) {
                return reject(err);
            }
        });
    }

    getDonaturData(page: number = 1, length: number = 25): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.axios?.get('manage/tip-received/support-message/fetch', {
                    'columns[0][data]': 'created_at',
                    'order[0][column]': 0,
                    'order[0][dir]': 'desc',
                    start: page === 1 ? 0 : (page * length) - length,
                    length
                });

                const data = res?.data;

                return resolve(data);
            } catch (err) {
                return reject(err);
            }
        });
    }

    getOrderDetail(orderId: String): Promise<OrderDetailResponse> {
        if (!this.ready) throw new Error('Trakteer is not initialized yet, please call init() method first');
        return new Promise(async (resolve, reject) => {
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

                return resolve({
                    orderId: orderID,
                    tanggal,
                    nama,
                    unit,
                    nominal,
                    message
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    init(xsrfToken: String, trakteerSession: String): void {
        if (!xsrfToken) throw new Error('xsrfToken is required');
        if (!trakteerSession) throw new Error('trakteerSession is required');

        this.XSRF_TOKEN = xsrfToken;
        this.TRAKTEER_SESSION = trakteerSession;
        this.axios = new Axios({ XSRF_TOKEN: this.XSRF_TOKEN, TRAKTEER_SESSION: this.TRAKTEER_SESSION });

        this.ready = true;
    }
}

export default Trakteer;