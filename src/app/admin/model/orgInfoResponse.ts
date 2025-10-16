import { AddressCreateRequest } from './addressCreateRequest';
import { AccountDto } from './accountDto';
import { DocumentDto } from './documentDto';

export interface OrgInfoResponse {
    organizationId: number;
    organizationName: string;
    organizationEmail: string;
    address: AddressCreateRequest;
    account: AccountDto;
    document: DocumentDto;
    isActive: boolean;
}