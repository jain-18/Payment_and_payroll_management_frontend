import { AddressCreateRequest } from './address.model';

export interface AccountUpdate {
  accountNumber?: string;
  ifsc?: string;
}

export interface OrganizationUpdateRequest {
  organizationName?: string;
  organizationEmail?: string;
  address?: AddressCreateRequest;
  account?: AccountUpdate;
  pancard?: File;
  cancelledCheque?: File;
  companyRegistrationCertificate?: File;
}