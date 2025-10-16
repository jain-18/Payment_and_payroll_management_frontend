export interface EmployeeResponse {
  employeeId: number;
  employeeName: string;
  employeeRole: string;
  email: string;
  department: string;
  salary: number;
  joinedDate: string; // Format: YYYY-MM-DD
  active: boolean;
  accountNumber: string;
  ifsc: string;
}