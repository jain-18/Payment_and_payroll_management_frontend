export interface VendorRequestResp {
    requestId: number;           
    requestStatus: string;         
    requestDate: Date;            
    createdBy: string;           
    requestType: string;     
    to: string;                 
    totalAmount: number;       
}
