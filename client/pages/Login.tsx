import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Chrome, Github, Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useLogin, useUser } from "../hooks/use-api";
import AuthLayout from "../components/auth/AuthLayout";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: user } = useUser();
  const loginMutation = useLogin();

  const oauthError = searchParams.get("error");
  const oauthSuccess = searchParams.get("success");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle OAuth success/error messages
  useEffect(() => {
    if (oauthSuccess === "true") {
      navigate("/dashboard");
    }
  }, [oauthSuccess, navigate]);

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    loginMutation.mutate(
      { email: formData.email, password: formData.password },
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
      },
    );
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    window.location.href = `/api/auth/oauth/${provider}?redirect=/dashboard`;
  };

  const isFormValid = formData.email && formData.password;

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Faça login para continuar automatizando seu negócio brasileiro"
    >
      <div className="space-y-6">
        {/* OAuth Error Alert */}
        {oauthError && (
          <Alert variant="destructive">
            <AlertDescription>
              {oauthError === "access_denied"
                ? "Acesso negado. Tente novamente."
                : "Erro na autenticação. Tente novamente."}
            </AlertDescription>
          </Alert>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleOAuthLogin("google")}
            disabled={loginMutation.isPending}
          >
            <Chrome className="w-5 h-5 mr-3" />
            Continuar com Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => handleOAuthLogin("github")}
            disabled={loginMutation.isPending}
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
              ou entre com seu email
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10 h-12"
                disabled={loginMutation.isPending}
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Senha</Label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-emerald-600 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 pr-10 h-12"
                disabled={loginMutation.isPending}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginMutation.isPending}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                handleInputChange("rememberMe", checked)
              }
            />
            <Label htmlFor="rememberMe" className="text-sm text-gray-700">
              Manter-me conectado por 30 dias
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            disabled={!isFormValid || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando na plataforma...
              </>
            ) : (
              "Entrar no KRYONIX"
            )}
          </Button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-emerald-600 hover:underline font-medium"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </form>

        {/* Quick Demo Access */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-800 mb-2">
              🚀 Experimente sem compromisso
            </p>
            <p className="text-xs text-emerald-700">
              Teste todas as funcionalidades gratuitamente por 14 dias
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
