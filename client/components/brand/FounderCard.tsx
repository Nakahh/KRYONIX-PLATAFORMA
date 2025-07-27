// Componente FounderCard - Exibe informações do fundador Vitor Fernandes
// Integração estratégica da foto do fundador na plataforma KRYONIX

import React from "react";
import { cn } from "@/lib/utils";
import { Linkedin, Mail, Globe } from "lucide-react";

interface FounderCardProps {
  variant?: "full" | "compact" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  showSocial?: boolean;
  showTitle?: boolean;
}

export function FounderCard({
  variant = "full",
  size = "md",
  className,
  showSocial = true,
  showTitle = true,
}: FounderCardProps) {
  const sizeConfig = {
    sm: {
      photo: "w-12 h-12",
      text: "text-sm",
      title: "text-xs",
      padding: "p-3",
    },
    md: {
      photo: "w-16 h-16",
      text: "text-base",
      title: "text-sm",
      padding: "p-4",
    },
    lg: {
      photo: "w-20 h-20",
      text: "text-lg",
      title: "text-base",
      padding: "p-6",
    },
  };

  const config = sizeConfig[size];

  const FounderPhoto = () => (
    <div
      className={cn(
        config.photo,
        "rounded-full overflow-hidden ring-3 ring-kryonix-blue/20 shadow-lg",
        "transition-all duration-300 hover:ring-kryonix-blue/40 hover:shadow-xl",
      )}
    >
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Ff3c03838ba934db3a83fe16fb45b6ea7%2F87344dc399db4250bef1180e4c9b1b76?format=webp&width=800"
        alt="Vitor Fernandes - Fundador da KRYONIX"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );

  const FounderInfo = () => (
    <div className="flex-1">
      <h3 className={cn(config.text, "font-semibold text-gray-900")}>
        Vitor Fernandes
      </h3>
      {showTitle && (
        <p className={cn(config.title, "text-gray-600 mt-1")}>
          Fundador & CEO da KRYONIX
        </p>
      )}
      <p className={cn(config.title, "text-gray-500 mt-1")}>
        Especialista em IA e Automação
      </p>
    </div>
  );

  const SocialLinks = () => (
    <div className="flex gap-2 mt-2">
      <a
        href="https://linkedin.com/in/vitor-fernandes"
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-lg bg-gray-100 hover:bg-kryonix-blue hover:text-white transition-all duration-200"
        title="LinkedIn do Vitor Fernandes"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <a
        href="mailto:vitor@kryonix.com.br"
        className="p-1.5 rounded-lg bg-gray-100 hover:bg-kryonix-green hover:text-white transition-all duration-200"
        title="Email do Vitor Fernandes"
      >
        <Mail className="w-4 h-4" />
      </a>
      <a
        href="https://kryonix.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-600 hover:text-white transition-all duration-200"
        title="Site da KRYONIX"
      >
        <Globe className="w-4 h-4" />
      </a>
    </div>
  );

  // Renderização baseada na variante
  switch (variant) {
    case "minimal":
      return (
        <div className={cn("flex items-center gap-3", className)}>
          <FounderPhoto />
          <div>
            <p className={cn(config.text, "font-medium text-gray-900")}>
              Vitor Fernandes
            </p>
            <p className={cn(config.title, "text-gray-500")}>
              Fundador KRYONIX
            </p>
          </div>
        </div>
      );

    case "compact":
      return (
        <div
          className={cn(
            "flex items-center gap-3 bg-white rounded-xl border shadow-sm",
            config.padding,
            "hover:shadow-md transition-all duration-200",
            className,
          )}
        >
          <FounderPhoto />
          <FounderInfo />
        </div>
      );

    case "full":
    default:
      return (
        <div
          className={cn(
            "bg-white rounded-xl border shadow-sm",
            config.padding,
            "hover:shadow-lg transition-all duration-300",
            className,
          )}
        >
          <div className="flex items-start gap-4">
            <FounderPhoto />
            <div className="flex-1">
              <FounderInfo />
              {showSocial && <SocialLinks />}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className={cn(config.title, "text-gray-600 leading-relaxed")}>
              "Criamos a KRYONIX para democratizar a tecnologia de IA e
              automação, permitindo que qualquer empreendedor tenha acesso às
              mesmas ferramentas das grandes empresas."
            </p>
          </div>
        </div>
      );
  }
}

// Componente específico para footer
export function FounderFooter() {
  return (
    <div className="text-center py-8 border-t border-gray-200">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff3c03838ba934db3a83fe16fb45b6ea7%2F87344dc399db4250bef1180e4c9b1b76?format=webp&width=800"
            alt="Vitor Fernandes"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">
            Criado por Vitor Fernandes
          </p>
          <p className="text-xs text-gray-500">Fundador da KRYONIX</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 max-w-md mx-auto">
        Desenvolvido com ❤️ para democratizar a IA e automação para
        empreendedores.
      </p>
    </div>
  );
}

// Componente para página "Sobre" ou "Equipe"
export function FounderHero() {
  return (
    <div className="bg-gradient-to-br from-kryonix-blue/5 to-kryonix-green/5 rounded-2xl p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden ring-4 ring-kryonix-blue/20 shadow-2xl">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff3c03838ba934db3a83fe16fb45b6ea7%2F87344dc399db4250bef1180e4c9b1b76?format=webp&width=800"
            alt="Vitor Fernandes - Fundador da KRYONIX"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Vitor Fernandes
          </h2>
          <p className="text-xl text-kryonix-blue font-medium mb-4">
            Fundador & CEO da KRYONIX
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Especialista em Inteligência Artificial e Automação com mais de 10
            anos de experiência. Vitor criou a KRYONIX com a missão de
            democratizar o acesso à tecnologia de IA para empreendedores e
            pequenas empresas, tornando a automação inteligente acessível e
            eficaz.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a
              href="https://linkedin.com/in/vitor-fernandes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-kryonix-blue text-white rounded-lg hover:bg-kryonix-blue/90 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href="mailto:vitor@kryonix.com.br"
              className="flex items-center gap-2 px-4 py-2 bg-kryonix-green text-white rounded-lg hover:bg-kryonix-green/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contato
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FounderCard;
