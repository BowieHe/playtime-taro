export interface PhoneInfo {
    phoneNumber: string;
    purePhoneNumber: string;
    countryCode: string;
    watermark: {
        timestamp: number;
        appid: string;
    };
}

export interface PhoneResponse {
    errmsg: string;
    errcode: number;
    phone_info: PhoneInfo;
}

export interface LoginRes {
    errcode: number;
    errmsg: string;
    session_key: string;
    openid: string;
    unionid: string;
}
