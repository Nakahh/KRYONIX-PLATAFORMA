import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { User } from "../entities/User";
import { Tenant } from "../entities/Tenant";
import { getDataSource } from "../db/connection";
import { twoFactorService } from "./two-factor";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  permissions: string[];
  lastLogin: Date;
}

export class AuthService {
  private userRepository: Repository<User> | null;
  private tenantRepository: Repository<Tenant> | null;

  constructor() {
    const dataSource = getDataSource();
    if (dataSource) {
      this.userRepository = dataSource.getRepository(User);
      this.tenantRepository = dataSource.getRepository(Tenant);
    } else {
      this.userRepository = null;
      this.tenantRepository = null;
    }
  }

  /**
   * Autenticação com email e senha
   */
  async login(
    email: string,
    password: string,
  ): Promise<{
    user: UserSession;
    tokens: AuthTokens;
  } | null> {
    try {
      if (!this.userRepository) {
        // Modo sem banco - aceitar qualquer credencial para desenvolvimento
        if (process.env.NODE_ENV === "development") {
          const fakeUser: UserSession = {
            id: "dev-user-id",
            email: email,
            name: "Dev User",
            role: "admin",
            tenantId: "dev-tenant",
            permissions: ["admin"],
            lastLogin: new Date(),
          };

          const tokens = this.generateTokens(fakeUser);
          return { user: fakeUser, tokens };
        }
        return null;
      }

      // Buscar usuário com tenant
      const user = await this.userRepository.findOne({
        where: { email, isActive: true },
        relations: ["tenant"],
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return null;
      }

      // Atualizar último login
      await this.userRepository.update(user.id, {
        lastLogin: new Date(),
        loginCount: user.loginCount + 1,
      });

      // Gerar tokens
      const tokens = this.generateTokens(user);

      // Criar sessão do usuário
      const userSession: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        permissions: this.getUserPermissions(user.role),
        lastLogin: new Date(),
      };

      return { user: userSession, tokens };
    } catch (error) {
      console.error("Erro no login:", error);
      return null;
    }
  }

  /**
   * Registro de novo usuário
   */
  async register(userData: {
    name: string;
    email: string;
    password: string;
    companyName?: string;
    phone?: string;
    role?: string;
  }): Promise<{
    user: UserSession;
    tokens: AuthTokens;
  } | null> {
    try {
      if (!this.userRepository || !this.tenantRepository) {
        // Modo sem banco - criar usuário fake para desenvolvimento
        if (process.env.NODE_ENV === "development") {
          const fakeUser: UserSession = {
            id: "dev-user-" + Date.now(),
            email: userData.email,
            name: userData.name,
            role: userData.role || "TENANT_ADMIN",
            tenantId: "dev-tenant",
            permissions: ["admin"],
            lastLogin: new Date(),
          };

          const tokens = this.generateTokens(fakeUser);
          return { user: fakeUser, tokens };
        }
        return null;
      }

      // Verificar se email já existe
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("Email já cadastrado");
      }

      // Criar tenant se for admin
      let tenant: Tenant | null = null;
      if (userData.role === "TENANT_ADMIN" || !userData.role) {
        tenant = this.tenantRepository.create({
          name: userData.companyName || `${userData.name} - Empresa`,
          subdomain: this.generateSubdomain(userData.email),
          plan: "starter",
          isActive: true,
        });
        await this.tenantRepository.save(tenant);
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Criar usuário
      const user = this.userRepository.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role || "TENANT_ADMIN",
        tenantId: tenant?.id,
        isActive: true,
        emailVerified: false,
        loginCount: 0,
      });

      await this.userRepository.save(user);

      // Login automático após registro
      return this.login(userData.email, userData.password);
    } catch (error) {
      console.error("Erro no registro:", error);
      return null;
    }
  }

  /**
   * OAuth Login (Google, GitHub, etc)
   */
  async oauthLogin(
    provider: string,
    profile: any,
  ): Promise<{
    user: UserSession;
    tokens: AuthTokens;
    isNewUser: boolean;
  } | null> {
    try {
      const email = profile.email || profile.emails?.[0]?.value;

      if (!email) {
        throw new Error("Email não fornecido pelo OAuth");
      }

      // Buscar usuário existente
      let user = await this.userRepository.findOne({
        where: { email },
        relations: ["tenant"],
      });

      let isNewUser = false;

      if (!user) {
        // Criar novo usuário via OAuth
        const registerResult = await this.register({
          name: profile.displayName || profile.name || "Usuário OAuth",
          email,
          password: this.generateRandomPassword(),
          companyName: `${profile.displayName} - Empresa`,
          role: "TENANT_ADMIN",
        });

        if (!registerResult) {
          return null;
        }

        isNewUser = true;
        return { ...registerResult, isNewUser };
      }

      // Login do usuário existente
      const tokens = this.generateTokens(user);

      // Atualizar último login
      await this.userRepository.update(user.id, {
        lastLogin: new Date(),
        loginCount: user.loginCount + 1,
      });

      const userSession: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        permissions: this.getUserPermissions(user.role),
        lastLogin: new Date(),
      };

      return { user: userSession, tokens, isNewUser };
    } catch (error) {
      console.error("Erro no OAuth login:", error);
      return null;
    }
  }

  /**
   * Verificar e atualizar token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "refresh-secret",
      ) as any;

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId, isActive: true },
      });

      if (!user) {
        return null;
      }

      return this.generateTokens(user);
    } catch (error) {
      console.error("Erro ao atualizar token:", error);
      return null;
    }
  }

  /**
   * Validar código 2FA
   */
  async validateTwoFactorCode(userId: string, code: string): Promise<boolean> {
    try {
      const validation = await twoFactorService.validateTwoFactorCode(
        userId,
        code,
      );
      return validation.isValid;
    } catch (error) {
      console.error("Erro ao validar 2FA:", error);
      return false;
    }
  }

  /**
   * Validar token de acesso
   */
  async validateToken(token: string): Promise<UserSession | null> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret",
      ) as any;

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId, isActive: true },
        relations: ["tenant"],
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        permissions: this.getUserPermissions(user.role),
        lastLogin: user.lastLogin || new Date(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Logout - invalidar tokens
   */
  async logout(userId: string): Promise<boolean> {
    try {
      // Atualizar último logout
      await this.userRepository.update(userId, {
        lastLogout: new Date(),
      });

      // TODO: Implementar blacklist de tokens se necessário
      return true;
    } catch (error) {
      console.error("Erro no logout:", error);
      return false;
    }
  }

  /**
   * Gerar tokens JWT
   */
  private generateTokens(user: User | UserSession): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || "refresh-secret",
      { expiresIn: "7d" },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutos em segundos
    };
  }

  /**
   * Obter permissões por role
   */
  private getUserPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      SUPER_ADMIN: [
        "read:all",
        "write:all",
        "delete:all",
        "manage:tenants",
        "manage:users",
        "manage:billing",
        "manage:system",
      ],
      TENANT_ADMIN: [
        "read:tenant",
        "write:tenant",
        "manage:users",
        "manage:integrations",
        "manage:workflows",
        "manage:bots",
        "view:analytics",
      ],
      TENANT_USER: [
        "read:tenant",
        "write:limited",
        "use:bots",
        "view:analytics",
      ],
      TENANT_VIEWER: ["read:tenant", "view:analytics"],
    };

    return permissions[role] || permissions.TENANT_VIEWER;
  }

  /**
   * Gerar subdomínio único
   */
  private generateSubdomain(email: string): string {
    const baseSubdomain = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 10);

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseSubdomain}${randomSuffix}`;
  }

  /**
   * Gerar senha aleatória para OAuth
   */
  private generateRandomPassword(): string {
    return (
      Math.random().toString(36).slice(-12) +
      Math.random().toString(36).toUpperCase().slice(-4)
    );
  }
}

export const authService = new AuthService();
