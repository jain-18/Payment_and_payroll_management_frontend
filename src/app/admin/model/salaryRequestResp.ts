export interface SalaryRequestResp {
    requestId: number;            // Maps to Java Long
    requestStatus: string;        // Maps to Java String
    requestDate: Date;           // Maps to Java LocalDate
    createdBy: string;          // Maps to Java String
    requestType: string;        // Maps to Java String
    totalAmount: number;       // Maps to Java BigDecimal
}