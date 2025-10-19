export interface RequestResponse {
  requestId: number;
  requestType: string;
  requestStatus: string;
  requestDate: string;
  totalAmount: number;
  balance: number;
  createdBy: string;
  actionDate: string | null;
  rejectReason: string | null;
}

export interface RequestPageResponse {
  content: RequestResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}