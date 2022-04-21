import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElLoading } from 'element-plus';
import type { LoadingInstance } from 'element-plus/lib/components/loading/src/loading';

interface RequestInterceptor<T = AxiosResponse> {
    requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig;
    requestInterceptorCatch?: (error: any) => any;
    responseInterceptor?: (res: T) => T;
    responseInterceptorCatch?: (error: any) => any;
}

interface ZyRequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
    interceptors?: RequestInterceptor<T>;
    showLoading?: boolean;
}

class ZyRequest {
    instance: AxiosInstance;
    interceptors?: RequestInterceptor;
    loading?: LoadingInstance;
    showLoading?: boolean;
    constructor(config: ZyRequestConfig) {
        // 保证每次都是一个新的实例
        this.instance = axios.create(config);
        this.interceptors = config.interceptors;
        this.showLoading = config.showLoading ?? false;
        // 每个实例都有自己的拦截器
        this.instance.interceptors.request.use(
            this.interceptors?.requestInterceptor,
            this.interceptors?.requestInterceptorCatch
        );
        this.instance.interceptors.response.use(
            this.interceptors?.responseInterceptor,
            this.interceptors?.responseInterceptorCatch
        );

        // 统一的拦截器（公共的，写死的）
        this.instance.interceptors.request.use(
            (config) => {
                if (this.showLoading) {
                    this.loading = ElLoading.service({
                        lock: true,
                        background: 'rgba(0, 0, 0, .5)',
                        text: '加载中...'
                    });
                }
                return config;
            },
            (error) => {
                return error;
            }
        );
        this.instance.interceptors.response.use(
            (res) => {
                this.loading?.close();
                return res.data;
            },
            (error) => {
                this.loading?.close();
                return error;
            }
        );
    }
    request<T>(config: ZyRequestConfig<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            if (config.interceptors?.requestInterceptor) {
                config = config.interceptors.requestInterceptor(config);
            }
            // ???
            if (config.showLoading === false) {
                this.showLoading = false;
            }

            this.instance
                .request<any, T>(config)
                .then((res) => {
                    if (config.interceptors?.responseInterceptor) {
                        res = config.interceptors.responseInterceptor(res);
                    }
                    // ???
                    this.showLoading = true;

                    resolve(res);
                })
                .catch((err) => {
                    // ???
                    this.showLoading = true;
                    reject(err);
                });
        });
    }
    get<T>(config: ZyRequestConfig<T>): Promise<T> {
        return this.request<T>({ ...config, method: 'GET' });
    }
    post<T>(config: ZyRequestConfig<T>): Promise<T> {
        return this.request<T>({ ...config, method: 'POST' });
    }
    delete<T>(config: ZyRequestConfig<T>): Promise<T> {
        return this.request<T>({ ...config, method: 'DELETE' });
    }
    patch<T>(config: ZyRequestConfig<T>): Promise<T> {
        return this.request<T>({ ...config, method: 'PATCH' });
    }
}

export default ZyRequest;
