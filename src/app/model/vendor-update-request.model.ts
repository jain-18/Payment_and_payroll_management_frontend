import { AddressCreateRequest } from './address.model';

export interface VendorUpdateRequest {
  vendorName?: string;
  email?: string;
  phoneNumber?: string;
  accountNumber?: string;
  ifsc?: string;
  address?: AddressCreateRequest;
}