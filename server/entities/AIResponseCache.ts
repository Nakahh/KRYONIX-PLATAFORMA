import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";
import { AIServiceType } from "./AIServiceUsage";

@Entity("ai_response_cache")
@Index(["cacheKey"], { unique: true })
@Index(["tenantId", "expiresAt"])
@Index(["serviceType", "expiresAt"])
export class AIResponseCache {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column({ length: 255, unique: true })
  cacheKey: string;

  @Column({
    type: "enum",
    enum: AIServiceType,
  })
  serviceType: AIServiceType;

  @Column({ length: 100 })
  modelName: string;

  @Column({ length: 64 })
  inputHash: string;

  @Column({ type: "jsonb" })
  responseData: any;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: "integer", default: 0 })
  hitCount: number;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  // Helper methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  incrementHitCount(): void {
    this.hitCount += 1;
  }

  getCacheAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getCacheAgeMinutes(): number {
    return Math.floor(this.getCacheAge() / (1000 * 60));
  }

  getTimeToExpiry(): number {
    return this.expiresAt.getTime() - Date.now();
  }

  getTimeToExpiryMinutes(): number {
    return Math.floor(this.getTimeToExpiry() / (1000 * 60));
  }
}
