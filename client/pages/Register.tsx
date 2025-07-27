import React from "react";
import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";

/**
 * Página de Registro
 * KRYONIX - Autenticação brasileira mobile-first
 */

export default function Register() {
  return (
    <AuthLayout
      title="Criar Conta"
      subtitle="Junte-se a milhares de empreendedores brasileiros que já transformaram seus negócios com KRYONIX"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
