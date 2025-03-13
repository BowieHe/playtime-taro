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
  errMsg: string;
  errCode: number;
  phoneInfo: PhoneInfo;
}
