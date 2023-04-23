import Axios from './tools';
import { load } from 'cheerio';
import { SaldoResponse } from './types';

class Trakteer {
    public axios: Axios;

    constructor() {
        this.axios = new Axios();
    }

    getSaldo(): Promise<SaldoResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.axios.get('manage/dashboard');
                const data = res.data

                const $ = load(data);
                const saldo = $('.col-xs-12').eq(0).find('.head').text().trim();
                const currentSaldo = $('.col-xs-12').eq(1).find('.head').text().trim();

                return resolve({
                    saldo: saldo,
                    current_donation: currentSaldo
                });

            } catch (err) {
                return reject(err);
            }
        });
    }
}

export default Trakteer;