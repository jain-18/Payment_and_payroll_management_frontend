import { OrganizationResponse } from './organizationResponse';

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}