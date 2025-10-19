export interface SalaryRequestOfMonth {
    slipId: number;           // Maps to Java Long
    employeeId: number;       // Maps to Java Long
    salary: number;           // Maps to Java BigDecimal
    employee: string;         // Maps to Java String (Employee name)
    status: string;           // Maps to Java String
    periodMonth: number;      // Maps to Java Integer
    periodYear: number;       // Maps to Java Integer
}