export interface EmployeeUpdateRequest {
  employeeName?: string;
  employeeRole?: string;
  email?: string;
  department?: string;
  salary?: number;
  joinedDate?: string; // Format: YYYY-MM-DD
  accountNumber?: string;
  ifsc?: string;
}