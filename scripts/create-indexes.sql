-- Performance Indexes for HR Backend
-- This script should be run after all migrations are complete

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON "Users" ("phoneNumber");
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users" ("email");
CREATE INDEX IF NOT EXISTS idx_users_is_active ON "Users" ("isActive");

-- Employees table indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON "employees" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_employees_email ON "employees" ("email");
CREATE INDEX IF NOT EXISTS idx_employees_status ON "employees" ("status");
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON "employees" ("managerId");
CREATE INDEX IF NOT EXISTS idx_employees_department ON "employees" ("department");

-- Attendance table indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON "attendance" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_attendance_date ON "attendance" ("date");
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON "attendance" ("employeeId", "date");

-- Leaves table indexes
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON "leaves" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_leaves_status ON "leaves" ("status");
CREATE INDEX IF NOT EXISTS idx_leaves_start_date ON "leaves" ("startDate");

-- Branches table indexes
CREATE INDEX IF NOT EXISTS idx_branches_name ON "branches" ("name");
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON "branches" ("isActive");

-- Departments table indexes
CREATE INDEX IF NOT EXISTS idx_departments_name ON "departments" ("name");
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON "departments" ("isActive");

-- Shifts table indexes
CREATE INDEX IF NOT EXISTS idx_shifts_name ON "shifts" ("name");
CREATE INDEX IF NOT EXISTS idx_shifts_is_active ON "shifts" ("isActive");

-- Loans table indexes
CREATE INDEX IF NOT EXISTS idx_loans_employee_id ON "loans" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_loans_status ON "loans" ("status");

-- Payroll table indexes
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON "payroll" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON "payroll" ("month", "year");

-- Performance reviews table indexes
CREATE INDEX IF NOT EXISTS idx_performance_employee_id ON "performance_reviews" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_performance_review_date ON "performance_reviews" ("reviewDate");

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON "sessions" ("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON "sessions" ("expiresAt");

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON "audit_logs" ("userId");
CREATE INDEX IF NOT EXISTS idx_audit_action ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON "audit_logs" ("createdAt");

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Performance indexes created successfully';
END $$; 