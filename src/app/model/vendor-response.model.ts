import { AddressCreateRequest } from './address.model';

export interface VendorResponse {
  vendorId: number;
  vendorName: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  ifsc: string;
  organizationId: number;
  address: AddressCreateRequest;
  active: boolean;
}