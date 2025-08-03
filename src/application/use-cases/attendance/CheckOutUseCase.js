const { ValidationError } = require("../../../utils/errors");
const AttendanceRepository = require("../../../infrastructure/db/repositories/AttendanceRepository");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * Check Out Use Case
 * Handles employee check-out business logic
 */
class CheckOutUseCase {
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute check-out
   * @param {Object} checkOutData - Check-out data
   * @returns {Promise<Object>} Check-out result
   */
  async execute(checkOutData) {
    try {
      const { employeeId, location, notes } = checkOutData;

      // Validate required fields
      if (!employeeId) {
        throw new ValidationError("Employee ID is required");
      }

      // Check if employee exists and is active
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        throw new ValidationError("Employee not found");
      }

      if (!employee.isActive) {
        throw new ValidationError("Employee is not active");
      }

      // Find today's attendance record
      const today = new Date().toISOString().split("T")[0];
      const attendance = await this.attendanceRepository.findByEmployeeAndDate(
        employeeId,
        today
      );

      if (!attendance) {
        throw new ValidationError("No check-in record found for today");
      }

      if (!attendance.checkInTime) {
        throw new ValidationError("Employee has not checked in today");
      }

      if (attendance.checkOutTime) {
        throw new ValidationError("Employee has already checked out today");
      }

      // Calculate working hours
      const checkOutTime = new Date();
      const checkInTime = new Date(attendance.checkInTime);
      const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours

      // Determine status based on working hours
      let status = "present";
      if (totalHours < 4) {
        status = "half_day";
      } else if (totalHours < 8) {
        status = "early_departure";
      }

      // Update attendance record
      const updatedAttendance = await this.attendanceRepository.update(
        attendance.id,
        {
          checkOutTime,
          location,
          notes,
          totalHours: parseFloat(totalHours.toFixed(2)),
          status,
        }
      );

      return {
        success: true,
        message: "Check-out successful",
        data: {
          attendanceId: updatedAttendance.id,
          employeeId: updatedAttendance.employeeId,
          checkInTime: updatedAttendance.checkInTime,
          checkOutTime: updatedAttendance.checkOutTime,
          totalHours: updatedAttendance.totalHours,
          status: updatedAttendance.status,
          date: updatedAttendance.date,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CheckOutUseCase;
