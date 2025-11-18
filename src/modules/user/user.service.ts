import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { UserRole } from '../../enums/user-role.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Set default role to APPLICANT if not provided
    if (!createUserDto.role) {
      createUserDto.role = UserRole.APPLICANT;
    }
    
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const oldApplicationStatus = user.applicationStatus;
    Object.assign(user, updateUserDto);
    
    // Only change role to USER when application status is being updated to APPROVED
    // But don't override explicitly provided roles
    if (updateUserDto.applicationStatus === 'approved' && updateUserDto.role === undefined) {
      // Check if user is an admin - if so, don't change their role
      const isAdmin = user.role === UserRole.SUPER_ADMIN || 
                     user.role === UserRole.COMPANY_ADMIN;
      
      // Only change role if the user is not an admin
      if (!isAdmin) {
        user.role = UserRole.USER;
      }
    }
    
    const updatedUser = await this.userRepository.save(user);
    
    // // Send email notification if application status changed
    // if (oldApplicationStatus !== user.applicationStatus && 
    //     (user.applicationStatus === 'approved' || user.applicationStatus === 'rejected')) {
      
    //   try {
    //     await this.mailService.sendApplicationStatusEmail(
    //       user.email,
    //       user.name,
    //       user.applicationStatus === 'approved',
    //       user.applicationStatus === 'rejected' ? 'Application did not meet requirements' : undefined
    //     );
    //   } catch (error) {
    //     console.error('Failed to send application status email:', error);
    //     // Don't throw error as we don't want to fail the update if email fails
    //   }
    // }
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findByApplicationStatus(status: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { applicationStatus: status as any },
      order: { createdAt: 'DESC' },
    });
  }
  
  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findOne(id);
    user.role = role;
    return await this.userRepository.save(user);
  }
}