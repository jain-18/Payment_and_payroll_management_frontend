export interface VendorPaymentResponse {
  vpId: number;
  amount: number;
  vendorId: number;
  vendorName: string;
  status: string;
  requestId?: number;
}