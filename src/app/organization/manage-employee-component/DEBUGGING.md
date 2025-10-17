# Debug Guide for Manage Employee Loading Issues

## Problem
Sometimes the manage employee component gets stuck on "Loading employees..." even when:
- Page is reloaded
- Refresh button is clicked
- User navigates away and comes back
- User logs out and logs back in

## Debugging Steps Added

### 1. Enhanced Console Logging
- **Component Initialization**: Logs when component starts and token validation
- **API Calls**: Logs every API request with parameters and URL
- **Token Validation**: Detailed token debugging with format checks
- **Response Handling**: Logs successful responses and detailed error information

### 2. Debug Buttons (Temporary)
During loading state, you'll see:
- **Debug State**: Click to see current component state in console
- **Force Stop & Retry**: Resets all loading states and retries

When there's an error:
- **Try Again**: Manually retry the API call
- **Debug**: Check component and token state

### 3. Timeout Protection
- **30-second timeout**: Prevents infinite loading
- **Automatic cleanup**: Clears timeouts on component destroy
- **Force retry**: Manual method to reset stuck states

### 4. Enhanced Token Validation
- **Format checking**: Ensures JWT has 3 parts (header.payload.signature)
- **Empty string check**: Catches empty tokens
- **Expiration validation**: Checks if token is still valid
- **Detailed logging**: Shows token info without exposing sensitive data

## How to Debug

### Step 1: Open Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Clear console (Ctrl+L)

### Step 2: Navigate to Manage Employees
1. Go to `/org-dashboard/manage-employee`
2. Watch console for debug output

### Step 3: Look for These Patterns

#### ✅ **Normal Flow**
```
=== Manage Employee Component Initialized ===
=== Token Debug Info ===
Token exists: true
Token is valid: true
=== Loading Employees ===
Employee Service - Making API call to: http://localhost:8080/api/employees?page=0&size=10&sortBy=employeeName
=== Employee API Response ===
✅ Employees loaded successfully
```

#### ❌ **Token Issues**
```
=== Token Debug Info ===
Token exists: false
OR
⚠️ Token is empty string
OR
⚠️ Token does not have proper JWT format
OR
Token is expired: true
```

#### ❌ **API Issues**
```
=== Employee API Error ===
Error status: 401/403/0/500
```

#### ❌ **Stuck Loading**
```
=== Loading Employees ===
(No response after 30 seconds)
Loading timeout - force stopping
```

### Step 4: Use Debug Buttons
If stuck on loading:
1. Click "Debug State" to see current state
2. Click "Force Stop & Retry" to reset
3. Check console for detailed information

### Step 5: Check Network Tab
1. Go to Network tab in Developer Tools
2. Look for `/api/employees` requests
3. Check if request is made and what response is received

## Common Issues & Solutions

### Issue 1: Token Missing/Invalid
**Symptoms**: Immediate redirect to login or 401 errors
**Solution**: Re-login to get fresh token

### Issue 2: API Not Responding
**Symptoms**: Request hangs, timeout triggered
**Solution**: Check if backend is running on localhost:8080

### Issue 3: CORS Issues
**Symptoms**: Error status 0, "Cannot connect to server"
**Solution**: Ensure backend has proper CORS configuration

### Issue 4: Component State Stuck
**Symptoms**: isLoading=true forever
**Solution**: Use "Force Stop & Retry" button

## Temporary Debug Features
The debug buttons are temporary and should be removed in production. They help identify:
- Current component loading states
- Token validity and content
- API call parameters and responses
- Component lifecycle issues