-- Database initialization script for HR Backend
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create custom functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON "Users" ("phoneNumber");
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users" ("email");
CREATE INDEX IF NOT EXISTS idx_users_is_active ON "Users" ("isActive");

CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON "employees" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_employees_email ON "employees" ("email");
CREATE INDEX IF NOT EXISTS idx_employees_status ON "employees" ("status");

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON "attendance" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_attendance_date ON "attendance" ("date");

CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON "leaves" ("employeeId");
CREATE INDEX IF NOT EXISTS idx_leaves_status ON "leaves" ("status");

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE coolnet_hrms TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$; 