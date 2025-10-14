import { Address } from './address.model';

export interface RegistrationRequest {
    userName: string;
    password: string;
    organizationName: string;
    organizationEmail: string;
    address: Address;
    accountNo: string;
    ifsc: string;
    pancard: File;
    cancelledCheque: File;
    companyRegistrationCertificate: File;
}

export interface RegistrationResponse {
    organizationId: number;
    userName: string;
    organizationName: string;
    organizationEmail: string;
    address: Address;
    accountNo: string;
    ifsc: string;
}

export interface OtpVerificationRequest {
    email: string;
    otp: string;
}