// Example backend error responses that will now be handled properly:

// 1. Email already exists:
// Status: 400 or 409
// Response: "Email already exists"
// Result: Shows "Email already exists. Please use a different email address." and highlights email field

// 2. Account number already exists:
// Status: 400 or 409  
// Response: "Account number already exists"
// Result: Shows "Account number already exists. Please use a different account number." and highlights account number field

// 3. Validation errors:
// Status: 400
// Response: "Employee name must contain only alphabets and spaces"
// Result: Shows the exact backend message and highlights the relevant field

// 4. Multiple validation errors:
// The component will show the first error it encounters and highlight the appropriate field

// 5. Generic backend errors:
// Any other backend error message will be displayed as-is to the user

// Usage Example:
// When user tries to create employee with duplicate email:
// Backend returns: "Email already exists"
// Frontend shows: 
// - Main error message: "Email already exists. Please use a different email address."
// - Email field highlighted in red
// - Field-specific error: "This email is already registered"
// - Error clears when user starts typing in email field