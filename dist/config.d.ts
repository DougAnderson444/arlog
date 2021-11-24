declare const _default: {
    networks: {
        DEV_NET: {
            host: string;
            port: number;
            protocol: string;
            timeout: number;
            logging: boolean;
            name: string;
            mine: () => Promise<void>;
        };
        LOCAL_TEST_NET: {
            host: string;
            port: number;
            protocol: string;
            timeout: number;
            logging: boolean;
            name: string;
            mine: (arlog: any) => Promise<void>;
            drop: (arlog: any, address: any, amt?: string) => Promise<any>;
        };
        REDSTONE_NET: {
            host: string;
            port: number;
            protocol: string;
            timeout: number;
            logging: boolean;
            name: string;
            mine: () => Promise<void>;
        };
        MAIN_NET: {
            host: string;
            port: number;
            protocol: string;
            name: string;
        };
    };
};
export default _default;
export declare const MAX_REQUEST = 100;
