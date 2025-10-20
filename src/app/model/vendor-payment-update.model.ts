export interface VendorPaymentUpdate {
  id: number;
  amount: number;
}

export interface VendorPaymentUpdateResponse {
  vpId: number;
  amount: number;
  status: string;
  vendorId: number;
  vendorName: string;
}