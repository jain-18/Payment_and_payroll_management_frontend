export interface AllRequest {
    requestId: number;
    requestStatus: string;
    requestType: string;
    createdBy: string;
    to: string;
    requestDate: Date;
    totalAmount: number;
}