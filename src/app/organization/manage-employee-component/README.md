# Manage Employee Component Documentation

## Overview
The Manage Employee Component displays all employees in a paginated table format with sorting and filtering capabilities.

## Features

### 1. **Employee Table Display**
- Shows all employee information: ID, Name, Role, Email, Department, Salary, Joined Date, Status, Account Details
- Responsive table design with hover effects
- Avatar circles with employee initials
- Status badges (Active/Inactive)
- Formatted salary display in INR currency
- Formatted date display

### 2. **Pagination**
- Configurable page sizes: 5, 10, 15, 20 items per page
- Navigation controls: First, Previous, Page Numbers, Next, Last
- Shows current page info: "Showing X to Y of Z entries"
- Responsive pagination on mobile devices

### 3. **Sorting**
- Sort by: Employee Name, Role, Department, Email, Joined Date, Salary
- Ascending order by default
- Dropdown selection for sort field

### 4. **Interactive Features**
- Refresh button to reload data
- Add New Employee button (navigates to create employee)
- Action buttons for each employee: View, Edit, Delete (placeholders)
- Empty state when no employees exist

### 5. **Error Handling**
- Loading states with spinner
- Error messages for failed API calls
- Session timeout handling
- Network connectivity issues

### 6. **Responsive Design**
- Mobile-friendly table layout
- Columns hidden on smaller screens
- Responsive pagination
- Touch-friendly buttons

## API Integration
- **Endpoint**: `GET /api/employees`
- **Parameters**: 
  - `page` (default: 0)
  - `size` (default: 10) 
  - `sortBy` (default: 'employeeName')
- **Authentication**: JWT token from localStorage
- **Response**: Paginated employee list with metadata

## Navigation
- **Route**: `/org-dashboard/manage-employee`
- **Navbar**: Uses reusable `OrgDashboardNavbar`
- **Access**: Organization users only

## Usage
1. Navigate to Manage Employees from organization dashboard
2. View employee list in table format
3. Use pagination to navigate through pages
4. Change page size or sorting as needed
5. Click "Add New Employee" to create new employee
6. Use action buttons for individual employee operations (to be implemented)

## Future Enhancements
- Employee search/filter functionality
- Bulk operations (delete, export)
- Employee details modal
- Edit employee inline
- Export to CSV/Excel
- Employee status toggle