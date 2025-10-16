import { AddressCreateRequest } from './address.model';

export interface VendorRequest {
  vendorName: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  ifsc: string;
  address: AddressCreateRequest;
}