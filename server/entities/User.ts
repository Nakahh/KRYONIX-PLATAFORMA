import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import bcrypt from "bcryptjs";
import { Tenant } from "./Tenant";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  TENANT_ADMIN = "TENANT_ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
  VIEWER = "VIEWER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  theme?: "light" | "dark" | "auto";
  notifications?: {
    email?: boolean;
    push?: boolean;
    whatsapp?: boolean;
  };
  dashboard?: {
    layout?: string;
    widgets?: string[];
  };
}

export interface TwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  lastUsed?: Date;
}

@Entity("users")
@Index(["email"], { unique: true })
@Index(["tenantId", "email"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ type: "jsonb", nullable: true })
  preferences?: UserPreferences;

  @Column({ type: "jsonb", default: { enabled: false } })
  twoFactorAuth: TwoFactorAuth;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt?: Date;

  @Column({ type: "inet", nullable: true })
  lastLoginIP?: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: "text", nullable: true })
  emailVerificationToken?: string;

  @Column({ type: "text", nullable: true })
  passwordResetToken?: string;

  @Column({ type: "timestamp", nullable: true })
  passwordResetExpires?: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column("uuid")
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  tenant: Tenant;

  // Password hashing hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith("$2a$")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Instance methods
  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  get has2FAEnabled(): boolean {
    return this.twoFactorAuth.enabled;
  }

  updateLastLogin(ip?: string): void {
    this.lastLoginAt = new Date();
    if (ip) {
      this.lastLoginIP = ip;
    }
  }

  generateEmailVerificationToken(): string {
    this.emailVerificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return this.emailVerificationToken;
  }

  generatePasswordResetToken(): string {
    this.passwordResetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    return this.passwordResetToken;
  }

  verifyEmail(): void {
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = null;
    this.status = UserStatus.ACTIVE;
  }

  // Permission checking methods
  hasPermission(permission: string): boolean {
    const rolePermissions = this.getRolePermissions();
    return (
      rolePermissions.includes(permission) || rolePermissions.includes("*")
    );
  }

  canAccessTenant(tenantId: string): boolean {
    if (this.role === UserRole.SUPER_ADMIN) return true;
    return this.tenantId === tenantId;
  }

  private getRolePermissions(): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: ["*"], // All permissions
      [UserRole.TENANT_ADMIN]: [
        "tenant:read",
        "tenant:update",
        "tenant:manage_users",
        "users:*",
        "whatsapp:*",
        "automation:*",
        "analytics:*",
        "billing:read",
        "integrations:*",
      ],
      [UserRole.MANAGER]: [
        "tenant:read",
        "users:read",
        "users:create",
        "users:update",
        "whatsapp:*",
        "automation:*",
        "analytics:read",
        "billing:read",
        "integrations:read",
      ],
      [UserRole.USER]: [
        "tenant:read",
        "users:read",
        "whatsapp:read",
        "whatsapp:send",
        "automation:read",
        "analytics:read",
        "billing:read",
      ],
      [UserRole.VIEWER]: [
        "tenant:read",
        "users:read",
        "whatsapp:read",
        "automation:read",
        "analytics:read",
      ],
    };

    return permissions[this.role] || [];
  }
}
