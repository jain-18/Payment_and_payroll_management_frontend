import { AddressCreateRequest } from "./addressCreateRequest";

export interface OrganizationResponse {
    organizationId: number;
    organizationName: string;
    organizationEmail: string;
    address: AddressCreateRequest;
    active: boolean;  // Changed from isActive to match API response
}