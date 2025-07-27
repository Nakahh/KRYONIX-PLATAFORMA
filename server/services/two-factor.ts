import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { getDataSource } from '../db/connection';
import { User } from '../entities/User';

/**
 * 🔐 MÓDULO 11 - SISTEMA 2FA PARA BRASIL
 * Autenticação de dois fatores com Google Authenticator
 * Interface em português, otimizado para usuários brasileiros
 */

export interface TwoFactorSetup {
  secret: string;
  manualEntryKey: string;
  qrCodeUrl: string;
  backupCodes: string[];
  instructions: {
    title: string;
    steps: string[];
    apps: {
      name: string;
      android: string;
      ios: string;
    }[];
    manual: {
      title: string;
      description: string;
      key: string;
    };
  };
}

export interface TwoFactorValidation {
  isValid: boolean;
  message: string;
  remainingAttempts?: number;
}

export class TwoFactorService {
  private readonly serviceName = 'KRYONIX';
  private readonly issuer = 'kryonix.com.br';

  /**
   * 🎯 Gerar configuração 2FA para usuário brasileiro
   */
  async generateTwoFactorSetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    try {
      // Gerar secret
      const secret = speakeasy.generateSecret({
        name: `${this.serviceName} (${userEmail})`,
        issuer: this.issuer,
        length: 20
      });

      // Gerar códigos de backup
      const backupCodes = this.generateBackupCodes();

      // Gerar QR Code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      return {
        secret: secret.base32,
        manualEntryKey: secret.base32,
        qrCodeUrl,
        backupCodes,
        instructions: {
          title: 'Configure a Autenticação de Dois Fatores',
          steps: [
            '1. Baixe um app autenticador no seu celular',
            '2. Escaneie o código QR abaixo com o app',
            '3. Digite o código de 6 dígitos que aparece no app',
            '4. Guarde os códigos de backup em local seguro',
            '5. Clique em "Ativar 2FA" para finalizar'
          ],
          apps: [
            {
              name: 'Google Authenticator',
              android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
              ios: 'https://apps.apple.com/br/app/google-authenticator/id388497605'
            },
            {
              name: 'Microsoft Authenticator',
              android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator',
              ios: 'https://apps.apple.com/br/app/microsoft-authenticator/id983156458'
            },
            {
              name: 'Authy',
              android: 'https://play.google.com/store/apps/details?id=com.authy.authy',
              ios: 'https://apps.apple.com/br/app/authy/id494168017'
            }
          ],
          manual: {
            title: 'Configuração Manual',
            description: 'Se não conseguir escanear o QR Code, digite esta chave manualmente no seu app:',
            key: secret.base32
          }
        }
      };

    } catch (error) {
      console.error('Erro ao gerar setup 2FA:', error);
      throw new Error('Não foi possível configurar a autenticação de dois fatores');
    }
  }

  /**
   * 🔑 Ativar 2FA para o usuário
   */
  async enableTwoFactor(
    userId: string, 
    secret: string, 
    verificationCode: string,
    backupCodes: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validar o código fornecido
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: verificationCode,
        window: 1 // Permite 1 período antes/depois para compensar clock skew
      });

      if (!isValid) {
        return {
          success: false,
          message: 'Código inválido. Verifique se o código está correto e tente novamente.'
        };
      }

      // Salvar no banco de dados
      const dataSource = getDataSource();
      const userRepository = dataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado.'
        };
      }

      // Criptografar e salvar secret
      user.twoFactorSecret = this.encryptSecret(secret);
      user.twoFactorEnabled = true;
      user.twoFactorBackupCodes = this.encryptBackupCodes(backupCodes);
      user.twoFactorActivatedAt = new Date();

      await userRepository.save(user);

      console.log(`[2FA] Ativado para usuário ${user.email}`);

      return {
        success: true,
        message: 'Autenticação de dois fatores ativada com sucesso! Sua conta está mais segura agora.'
      };

    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
      return {
        success: false,
        message: 'Erro interno. Tente novamente em alguns minutos.'
      };
    }
  }

  /**
   * ✅ Validar código 2FA
   */
  async validateTwoFactorCode(
    userId: string, 
    code: string
  ): Promise<TwoFactorValidation> {
    try {
      const dataSource = getDataSource();
      const userRepository = dataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return {
          isValid: false,
          message: '2FA não configurado para este usuário.'
        };
      }

      // Descriptografar secret
      const secret = this.decryptSecret(user.twoFactorSecret);

      // Verificar se é um código de backup
      if (code.length === 8 && code.match(/^[A-Z0-9]{8}$/)) {
        return this.validateBackupCode(user, code);
      }

      // Validar código TOTP normal
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code.replace(/\s/g, ''), // Remover espaços
        window: 1
      });

      if (isValid) {
        return {
          isValid: true,
          message: 'Código válido.'
        };
      } else {
        return {
          isValid: false,
          message: 'Código inválido ou expirado. Verifique o código no seu app autenticador.'
        };
      }

    } catch (error) {
      console.error('Erro ao validar código 2FA:', error);
      return {
        isValid: false,
        message: 'Erro na validação. Tente novamente.'
      };
    }
  }

  /**
   * 🔄 Desativar 2FA
   */
  async disableTwoFactor(
    userId: string, 
    currentPassword: string,
    verificationCode?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const dataSource = getDataSource();
      const userRepository = dataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado.'
        };
      }

      // Verificar senha atual
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Senha atual incorreta.'
        };
      }

      // Se 2FA está ativo, verificar código
      if (user.twoFactorEnabled && verificationCode) {
        const validation = await this.validateTwoFactorCode(userId, verificationCode);
        if (!validation.isValid) {
          return {
            success: false,
            message: 'Código 2FA inválido.'
          };
        }
      }

      // Desativar 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.twoFactorBackupCodes = null;
      user.twoFactorActivatedAt = null;

      await userRepository.save(user);

      console.log(`[2FA] Desativado para usuário ${user.email}`);

      return {
        success: true,
        message: 'Autenticação de dois fatores desativada. Recomendamos reativar para manter sua conta segura.'
      };

    } catch (error) {
      console.error('Erro ao desativar 2FA:', error);
      return {
        success: false,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }

  /**
   * 📋 Gerar novos códigos de backup
   */
  async generateNewBackupCodes(
    userId: string,
    verificationCode: string
  ): Promise<{ success: boolean; backupCodes?: string[]; message: string }> {
    try {
      // Validar código 2FA atual
      const validation = await this.validateTwoFactorCode(userId, verificationCode);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Código 2FA inválido.'
        };
      }

      // Gerar novos códigos
      const newBackupCodes = this.generateBackupCodes();

      // Salvar no banco
      const dataSource = getDataSource();
      const userRepository = dataSource.getRepository(User);

      await userRepository.update(userId, {
        twoFactorBackupCodes: this.encryptBackupCodes(newBackupCodes)
      });

      return {
        success: true,
        backupCodes: newBackupCodes,
        message: 'Novos códigos de backup gerados. Guarde-os em local seguro!'
      };

    } catch (error) {
      console.error('Erro ao gerar códigos de backup:', error);
      return {
        success: false,
        message: 'Erro ao gerar códigos. Tente novamente.'
      };
    }
  }

  /**
   * 🔧 Métodos privados
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = this.generateRandomCode(8);
      codes.push(code);
    }
    return codes;
  }

  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private validateBackupCode(user: any, code: string): TwoFactorValidation {
    try {
      if (!user.twoFactorBackupCodes) {
        return {
          isValid: false,
          message: 'Códigos de backup não disponíveis.'
        };
      }

      const backupCodes = this.decryptBackupCodes(user.twoFactorBackupCodes);
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex === -1) {
        return {
          isValid: false,
          message: 'Código de backup inválido.'
        };
      }

      // Remover código usado (one-time use)
      backupCodes.splice(codeIndex, 1);
      
      // Salvar códigos atualizados
      const dataSource = getDataSource();
      const userRepository = dataSource.getRepository(User);
      userRepository.update(user.id, {
        twoFactorBackupCodes: this.encryptBackupCodes(backupCodes)
      });

      return {
        isValid: true,
        message: `Código de backup válido. Restam ${backupCodes.length} códigos.`
      };

    } catch (error) {
      console.error('Erro ao validar código de backup:', error);
      return {
        isValid: false,
        message: 'Erro na validação do código de backup.'
      };
    }
  }

  private encryptSecret(secret: string): string {
    // TODO: Implementar criptografia real
    return Buffer.from(secret).toString('base64');
  }

  private decryptSecret(encryptedSecret: string): string {
    // TODO: Implementar descriptografia real
    return Buffer.from(encryptedSecret, 'base64').toString();
  }

  private encryptBackupCodes(codes: string[]): string {
    // TODO: Implementar criptografia real
    return Buffer.from(JSON.stringify(codes)).toString('base64');
  }

  private decryptBackupCodes(encryptedCodes: string): string[] {
    // TODO: Implementar descriptografia real
    return JSON.parse(Buffer.from(encryptedCodes, 'base64').toString());
  }
}

export const twoFactorService = new TwoFactorService();
