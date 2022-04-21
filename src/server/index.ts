import ZyRequest from './request';
import { BASE_URL, TIME_OUT } from './request/config';

export default new ZyRequest({
    baseURL: BASE_URL,
    timeout: TIME_OUT,
    interceptors: {
        requestInterceptor(config) {
            const token = '';
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }
    },
    showLoading: false
});
