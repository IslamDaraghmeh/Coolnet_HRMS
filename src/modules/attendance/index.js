/**
 * Attendance Module Index
 * Exports all attendance-related functionality
 */

// Domain
const Attendance = require('./domain/entities/Attendance');
const IAttendanceRepository = require('./domain/interfaces/IAttendanceRepository');

// Application Use Cases
const CreateAttendanceUseCase = require('./application/use-cases/CreateAttendanceUseCase');
const UpdateAttendanceUseCase = require('./application/use-cases/UpdateAttendanceUseCase');
const GetAttendanceUseCase = require('./application/use-cases/GetAttendanceUseCase');
const ListAttendancesUseCase = require('./application/use-cases/ListAttendancesUseCase');
const DeleteAttendanceUseCase = require('./application/use-cases/DeleteAttendanceUseCase');

// Infrastructure
const AttendanceRepository = require('./infrastructure/repositories/AttendanceRepository');

// Presentation
const attendanceRoutes = require('./presentation/routes/attendance');
const attendanceValidators = require('./presentation/validators/attendance');

module.exports = {
  // Domain Entities
  Attendance,
  IAttendanceRepository,
  
  // Application Use Cases
  CreateAttendanceUseCase,
  UpdateAttendanceUseCase,
  GetAttendanceUseCase,
  ListAttendancesUseCase,
  DeleteAttendanceUseCase,
  
  // Infrastructure
  AttendanceRepository,
  
  // Presentation
  attendanceRoutes,
  attendanceValidators,
}; 