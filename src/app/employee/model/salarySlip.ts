export interface SalarySlip {
    slipId: number;
    employeeName: string;
    organizationName: string;
    basicSalary: number;
    hra: number; // House Rent Allowance
    da: number; // Dearness Allowance
    pf: number; // Provident Fund
    otherAllowances: number;
    netSalary: number;
    periodMonth: number; // 1-12 representing months
    periodYear: number; // Full year (e.g., 2025)
}