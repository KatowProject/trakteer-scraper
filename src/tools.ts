import { baseURL, XSRF_TOKEN, TRAKTEER_SESSION } from "./config.json";
import axios, { AxiosInstance, AxiosResponse } from "axios";

class AxiosRequest {
    public request: AxiosInstance;

    constructor() {
        if (!baseURL) throw new Error("baseURL is not defined");
        if (!XSRF_TOKEN) throw new Error("XSRF_TOKEN is not defined");
        if (!TRAKTEER_SESSION) throw new Error("TRAKTEER_SESSION is not defined");

        this.request = axios.create({
            baseURL: baseURL,
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://trakteer.id/",
                "cookie": `XSRF-TOKEN=${XSRF_TOKEN}; trakteer-sess=${TRAKTEER_SESSION}`
            }
        });
    }

    get(endpoint: string, params: Object = {}): Promise<AxiosResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.request.get(endpoint, { params: params });
                return resolve(response);
            } catch (err) {
                return reject(err);
            }
        });
    }
}

export default AxiosRequest;