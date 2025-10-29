import { plainToInstance } from 'class-transformer';
import { UserRole } from 'src/enums/user-role.enum';
import {
  TestAdminResponseDto,
  TestUserResponseDto,
} from 'src/modules/test/dto/test-response.dto';

/**
 * Utility class for serializing responses based on user role
 */
export class SerializerUtil {
  /**
   * Serialize test response based on user role
   */
  static serializeTest(test: any, userRole: UserRole) {
    if (
      userRole === UserRole.SUPER_ADMIN ||
      userRole === UserRole.COMPANY_ADMIN
    ) {
      return plainToInstance(TestAdminResponseDto, test, {
        excludeExtraneousValues: true,
      });
    } else {
      return plainToInstance(TestUserResponseDto, test, {
        excludeExtraneousValues: true,
      });
    }
  }

  /**
   * Serialize array of tests based on user role
   */
  static serializeTests(tests: any[], userRole: UserRole) {
    return tests.map((test) => this.serializeTest(test, userRole));
  }

  /**
   * Check if user is admin
   */
  static isAdmin(userRole: UserRole): boolean {
    return (
      userRole === UserRole.SUPER_ADMIN || userRole === UserRole.COMPANY_ADMIN
    );
  }
}
