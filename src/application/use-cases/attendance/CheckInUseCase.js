const { ValidationError } = require("../../../utils/errors");
const AttendanceRepository = require("../../../infrastructure/db/repositories/AttendanceRepository");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * Check In Use Case
 * Handles employee check-in business logic
 */
class CheckInUseCase {
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute check-in
   * @param {Object} checkInData - Check-in data
   * @returns {Promise<Object>} Check-in result
   */
  async execute(checkInData) {
    try {
      const { employeeId, location, notes } = checkInData;

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

      // Check if already checked in today
      const today = new Date().toISOString().split("T")[0];
      const existingAttendance =
        await this.attendanceRepository.findByEmployeeAndDate(
          employeeId,
          today
        );

      if (existingAttendance && existingAttendance.checkInTime) {
        throw new ValidationError("Employee is already checked in today");
      }

      // Create or update attendance record
      const checkInTime = new Date();
      let attendance;

      if (existingAttendance) {
        // Update existing record
        attendance = await this.attendanceRepository.update(
          existingAttendance.id,
          {
            checkInTime,
            location,
            notes,
            status: "present",
          }
        );
      } else {
        // Create new record
        attendance = await this.attendanceRepository.create({
          employeeId,
          date: today,
          checkInTime,
          location,
          notes,
          type: "regular",
          status: "present",
        });
      }

      return {
        success: true,
        message: "Check-in successful",
        data: {
          attendanceId: attendance.id,
          employeeId: attendance.employeeId,
          checkInTime: attendance.checkInTime,
          date: attendance.date,
          status: attendance.status,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CheckInUseCase;
