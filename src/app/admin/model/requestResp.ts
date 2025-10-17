export interface RequestResp {
    requestId: number;
    requestType: string;
    requestStatus: string;
    requestDate: string; // ISO date string format
    totalAmount: number;
    balance: number;
    createdBy: string;
    actionDate: string; // ISO date string format
    rejectReason: string;
}