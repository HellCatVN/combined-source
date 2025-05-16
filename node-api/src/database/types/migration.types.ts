import { Types } from 'mongoose';
import { Role, Permission } from '../../plugins/authz/interface/authz.interface';
import { IUserDocument } from '../../plugins/users/interfaces/users.interface';

export interface IMigrationContext {
  oldRoles: string[];
  newRoles: Map<string, Types.ObjectId>;
  errors: MigrationError[];
  processed: number;
  skipped: number;
  updated: number;
}

export interface MigrationError {
  userId: string;
  oldRole: string;
  error: string;
  timestamp: Date;
}

export interface RoleMappingConfig {
  [key: string]: {
    name: string;
    description: string;
    permissions: Permission[];
    isSystem?: boolean;
  };
}

export interface ISeedContext {
  created: number;
  skipped: number;
  errors: SeedError[];
}

export interface SeedError {
  role: string;
  error: string;
  timestamp: Date;
}

export interface LogMessage {
  type: 'info' | 'warn' | 'error';
  message: string;
  metadata?: any;
}

export interface Logger {
  info: (message: string, metadata?: any) => void;
  warn: (message: string, metadata?: any) => void;
  error: (message: string, metadata?: any) => void;
}