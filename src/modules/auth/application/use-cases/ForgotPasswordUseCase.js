const crypto = require("crypto");
const { ValidationError } = require("../../../utils/errors");
const UserRepository = require("../../../infrastructure/db/repositories/UserRepository");
const config = require("../../../config");

/**
 * Forgot Password Use Case
 * Handles password reset request business logic
 */
class ForgotPasswordUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Execute forgot password
   * @param {string} phoneNumber - Phone number
   * @param {string} email - Email address
   * @returns {Promise<Object>} Forgot password result
   */
  async execute(phoneNumber, email) {
    try {
      // Validate input
      if (!phoneNumber && !email) {
        throw new ValidationError("Phone number or email is required");
      }

      let user = null;

      // Find user by phone number or email
      if (phoneNumber) {
        user = await this.userRepository.findByPhone(phoneNumber);
      } else if (email) {
        user = await this.userRepository.findByEmail(email);
      }

      if (!user) {
        // Return success even if user not found for security
        return {
          success: true,
          message:
            "If a user with this phone number/email exists, a reset link will be sent",
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: true,
          message:
            "If a user with this phone number/email exists, a reset link will be sent",
        };
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const resetTokenExpiresAt = new Date();
      resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1); // 1 hour expiry

      // Update user with reset token
      await this.userRepository.update(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: resetTokenExpiresAt,
      });

      // Send reset notification (SMS/Email)
      await this.sendPasswordResetNotification(user, resetToken);

      return {
        success: true,
        message:
          "If a user with this phone number/email exists, a reset link will be sent",
        data: {
          resetTokenExpiresAt,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate reset token
   * @returns {string} Reset token
   */
  generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Send password reset notification
   * @param {Object} user - User object
   * @param {string} resetToken - Reset token
   * @returns {Promise<void>}
   */
  async sendPasswordResetNotification(user, resetToken) {
    try {
      // TODO: Implement actual SMS/Email sending
      // This is a placeholder implementation that can be replaced with:
      // - Twilio SMS service
      // - Nodemailer for email
      // - AWS SES for email
      // - Other notification services

      const resetLink = `${config.server.frontendUrl}/reset-password?token=${resetToken}`;

      // Send SMS notification
      if (user.phoneNumber) {
        await this.sendSMSNotification(user.phoneNumber, resetLink);
      }

      // Send email notification
      if (user.email) {
        await this.sendEmailNotification(user.email, resetLink);
      }

      console.log(`Password reset notification sent to user ${user.id}`);
    } catch (error) {
      console.error("Error sending password reset notification:", error);
      throw new Error("Failed to send password reset notification");
    }
  }

  /**
   * Send SMS notification
   * @param {string} phoneNumber - Phone number
   * @param {string} resetLink - Password reset link
   * @returns {Promise<void>}
   */
  async sendSMSNotification(phoneNumber, resetLink) {
    try {
      // TODO: Implement actual SMS sending
      // This is a placeholder implementation

      const message = `Your password reset link: ${resetLink}. Valid for 15 minutes.`;

      console.log(`SMS to ${phoneNumber}: ${message}`);

      // For development, log the message
      if (process.env.NODE_ENV === "development") {
        console.log(`📱 Development SMS to ${phoneNumber}: ${message}`);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send SMS notification");
    }
  }

  /**
   * Send email notification
   * @param {string} email - Email address
   * @param {string} resetLink - Password reset link
   * @returns {Promise<void>}
   */
  async sendEmailNotification(email, resetLink) {
    try {
      // TODO: Implement actual email sending
      // This is a placeholder implementation

      const subject = "Password Reset Request";
      const message = `
        Hello,
        
        You have requested a password reset for your HR account.
        
        Click the following link to reset your password:
        ${resetLink}
        
        This link is valid for 15 minutes.
        
        If you didn't request this reset, please ignore this email.
        
        Best regards,
        HR System Team
      `;

      console.log(`Email to ${email}: ${subject}`);
      console.log(`Email content: ${message}`);

      // For development, log the email
      if (process.env.NODE_ENV === "development") {
        console.log(`📧 Development Email to ${email}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${message}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email notification");
    }
  }
}

module.exports = ForgotPasswordUseCase;
