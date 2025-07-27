import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent } from "../ui/card";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  Github,
  Chrome,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiClient } from "../../lib/api-client";

/**
 * Formulário de Registro Brasileiro
 * KRYONIX - Mobile-first com validações específicas BR
 */

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  company: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    company: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  // Validações brasileiras
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    };
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (
    field: keyof RegisterFormData,
    value: string | boolean,
  ) => {
    if (field === "phone" && typeof value === "string") {
      value = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "Senha é obrigatória";
    else if (!validatePassword(formData.password).isValid) {
      newErrors.password = "Senha não atende aos critérios de segurança";
    }

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    if (!formData.phone.trim()) newErrors.phone = "Telefone é obrigatório";
    else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Telefone inválido. Use o formato (11) 99999-9999";
    }

    if (!formData.company.trim())
      newErrors.company = "Nome da empresa é obrigatório";

    if (!formData.acceptTerms)
      newErrors.acceptTerms = "Aceite dos termos é obrigatório";
    if (!formData.acceptPrivacy)
      newErrors.acceptPrivacy =
        "Aceite da política de privacidade é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Erro no Formulário",
        description: "Por favor, corrija os campos destacados.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
        acceptMarketing: formData.acceptMarketing,
        metadata: {
          source: "web_registration",
          acceptedTermsAt: new Date().toISOString(),
          acceptedPrivacyAt: new Date().toISOString(),
        },
      });

      toast({
        title: "Conta Criada com Sucesso! 🎉",
        description: "Verifique seu email para ativar a conta.",
      });

      // Redirect to email verification
      navigate("/auth/verify-email", {
        state: { email: formData.email },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao criar conta. Tente novamente.";
      toast({
        title: "Erro no Registro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthRegister = async (provider: "google" | "github") => {
    try {
      window.location.href = `/api/auth/oauth/${provider}?redirect=/auth/complete-profile`;
    } catch (error) {
      toast({
        title: "Erro na Autenticação",
        description: "Tente novamente ou use o formulário manual.",
        variant: "destructive",
      });
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="space-y-6">
      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-base"
          onClick={() => handleOAuthRegister("google")}
        >
          <Chrome className="w-5 h-5 mr-3" />
          Continuar com Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-base"
          onClick={() => handleOAuthRegister("github")}
        >
          <Github className="w-5 h-5 mr-3" />
          Continuar com GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            ou registre-se com email
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`pl-10 h-12 ${errors.name ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`pl-10 h-12 ${errors.email ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={`pl-10 h-12 ${errors.phone ? "border-red-500" : ""}`}
              disabled={isLoading}
              maxLength={15}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Empresa */}
        <div className="space-y-2">
          <Label htmlFor="company">Nome da Empresa *</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="company"
              type="text"
              placeholder="Sua empresa ou projeto"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className={`pl-10 h-12 ${errors.company ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
          </div>
          {errors.company && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.company}
            </p>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite uma senha forte"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`pr-10 h-12 ${errors.password ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <Card className="p-3 bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="font-medium text-gray-700">
                  Critérios de Senha:
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <div
                    className={`flex items-center ${passwordValidation.minLength ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordValidation.minLength ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Pelo menos 8 caracteres
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasUpper ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordValidation.hasUpper ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Letra maiúscula
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasLower ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordValidation.hasLower ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Letra minúscula
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordValidation.hasNumber ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Número
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasSpecial ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordValidation.hasSpecial ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Caractere especial
                  </div>
                </div>
              </div>
            </Card>
          )}

          {errors.password && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className={`pr-10 h-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) =>
                handleInputChange("acceptTerms", checked)
              }
              className="mt-1"
            />
            <div className="text-sm">
              <label htmlFor="acceptTerms" className="text-gray-700">
                Aceito os{" "}
                <Link to="/terms" className="text-emerald-600 hover:underline">
                  Termos de Uso
                </Link>{" "}
                da plataforma KRYONIX *
              </label>
              {errors.acceptTerms && (
                <p className="text-red-600 mt-1">{errors.acceptTerms}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="acceptPrivacy"
              checked={formData.acceptPrivacy}
              onCheckedChange={(checked) =>
                handleInputChange("acceptPrivacy", checked)
              }
              className="mt-1"
            />
            <div className="text-sm">
              <label htmlFor="acceptPrivacy" className="text-gray-700">
                Aceito a{" "}
                <Link
                  to="/privacy"
                  className="text-emerald-600 hover:underline"
                >
                  Política de Privacidade
                </Link>{" "}
                e o tratamento dos meus dados conforme LGPD *
              </label>
              {errors.acceptPrivacy && (
                <p className="text-red-600 mt-1">{errors.acceptPrivacy}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="acceptMarketing"
              checked={formData.acceptMarketing}
              onCheckedChange={(checked) =>
                handleInputChange("acceptMarketing", checked)
              }
              className="mt-1"
            />
            <label htmlFor="acceptMarketing" className="text-sm text-gray-700">
              Aceito receber comunicações de marketing e novidades da KRYONIX
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Criando sua conta...
            </>
          ) : (
            "Criar Minha Conta"
          )}
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-emerald-600 hover:underline font-medium"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
