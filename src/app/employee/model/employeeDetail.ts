export interface EmployeeDetail {
    employeeId: number;
    employeeName: string;
    email: string;
    employeeRole: string;
    department: string;
    salary: number;
    joinedDate: string; // ISO date string format (YYYY-MM-DD)
    accountNumber: string;
    ifsc: string;
    organizationName: string;
    active: boolean;
}