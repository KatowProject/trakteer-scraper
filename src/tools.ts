import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";

class AxiosRequest {
    public request: AxiosInstance;
    public self = axios;
    private BASE_URL: string = "https://trakteer.id/";

    constructor(auth: { XSRF_TOKEN: string, TRAKTEER_SESSION: string }, proxy?: string) {
        const headers = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://trakteer.id/",
            "cookie": `XSRF-TOKEN=${auth.XSRF_TOKEN}; trakteer-sess=${auth.TRAKTEER_SESSION}`
        };

        const config = {
            baseURL: this.BASE_URL,
            timeout: 10000,
            headers,
            ...(proxy && { httpAgent: new HttpProxyAgent(proxy), httpsAgent: new HttpsProxyAgent(proxy) })
        };

        this.request = axios.create(config);
    }

    async get(endpoint: string, params: Object = {}): Promise<AxiosResponse | undefined> {
        try {
            const response = await this.request.get(endpoint, { params });
            return response;
        } catch (err) {
            throw err;
        }
    }
}

export default AxiosRequest;