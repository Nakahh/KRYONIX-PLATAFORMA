/**
 * Validadores brasileiros completos
 * Inclui CPF, CNPJ, CEP, telefones e outras validações específicas do Brasil
 */

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  message?: string;
  details?: any;
}

export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao: string;
  data_abertura: string;
  cnae_principal: {
    codigo: string;
    descricao: string;
  };
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  telefones?: string[];
  email?: string;
}

export interface BankData {
  code: string;
  name: string;
  fullName: string;
  ispb: string;
}

// ===== VALIDADORES DE DOCUMENTOS =====

/**
 * Valida CPF brasileiro
 */
export function validateCPF(cpf: string): ValidationResult {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return { isValid: false, message: "CPF deve ter 11 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return {
      isValid: false,
      message: "CPF não pode ter todos os dígitos iguais",
    };
  }

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = resto < 2 ? 0 : resto;

  if (dv1 !== parseInt(cleanCPF.charAt(9))) {
    return { isValid: false, message: "CPF inválido" };
  }

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = resto < 2 ? 0 : resto;

  if (dv2 !== parseInt(cleanCPF.charAt(10))) {
    return { isValid: false, message: "CPF inválido" };
  }

  return {
    isValid: true,
    formatted: formatCPF(cleanCPF),
    message: "CPF válido",
  };
}

/**
 * Valida CNPJ brasileiro
 */
export function validateCNPJ(cnpj: string): ValidationResult {
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  if (cleanCNPJ.length !== 14) {
    return { isValid: false, message: "CNPJ deve ter 14 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return {
      isValid: false,
      message: "CNPJ não pode ter todos os dígitos iguais",
    };
  }

  // Validação primeiro dígito
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;

  if (dv1 !== parseInt(cleanCNPJ.charAt(12))) {
    return { isValid: false, message: "CNPJ inválido" };
  }

  // Validação segundo dígito
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;

  if (dv2 !== parseInt(cleanCNPJ.charAt(13))) {
    return { isValid: false, message: "CNPJ inválido" };
  }

  return {
    isValid: true,
    formatted: formatCNPJ(cleanCNPJ),
    message: "CNPJ válido",
  };
}

/**
 * Valida CEP brasileiro
 */
export function validateCEP(cep: string): ValidationResult {
  const cleanCEP = cep.replace(/\D/g, "");

  if (cleanCEP.length !== 8) {
    return { isValid: false, message: "CEP deve ter 8 dígitos" };
  }

  if (/^0{8}$/.test(cleanCEP)) {
    return { isValid: false, message: "CEP inválido" };
  }

  return {
    isValid: true,
    formatted: formatCEP(cleanCEP),
    message: "CEP válido",
  };
}

/**
 * Busca endereço por CEP via ViaCEP
 */
export async function getAddressByCEP(
  cep: string,
): Promise<ValidationResult & { data?: AddressData }> {
  const validation = validateCEP(cep);
  if (!validation.isValid) {
    return validation;
  }

  const cleanCEP = cep.replace(/\D/g, "");

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();

    if (data.erro) {
      return { isValid: false, message: "CEP não encontrado" };
    }

    return {
      isValid: true,
      formatted: formatCEP(cleanCEP),
      message: "Endereço encontrado",
      data: data as AddressData,
    };
  } catch (error) {
    return { isValid: false, message: "Erro ao consultar CEP" };
  }
}

/**
 * Consulta dados da empresa por CNPJ via API da Receita Federal
 */
export async function getCNPJData(
  cnpj: string,
): Promise<ValidationResult & { data?: CNPJData }> {
  const validation = validateCNPJ(cnpj);
  if (!validation.isValid) {
    return validation;
  }

  const cleanCNPJ = cnpj.replace(/\D/g, "");

  try {
    // Usando API pública da BrasilAPI
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`,
    );
    const data = await response.json();

    if (data.message) {
      return { isValid: false, message: data.message };
    }

    return {
      isValid: true,
      formatted: formatCNPJ(cleanCNPJ),
      message: "Empresa encontrada",
      data: {
        cnpj: data.cnpj,
        razao_social: data.company_name || data.razao_social,
        nome_fantasia: data.trade_name || data.nome_fantasia,
        situacao: data.registration_status || data.situacao,
        data_abertura: data.founded || data.data_abertura,
        cnae_principal: {
          codigo: data.main_activity?.id || data.cnae_principal?.codigo || "",
          descricao:
            data.main_activity?.text || data.cnae_principal?.descricao || "",
        },
        endereco: {
          logradouro: data.street || data.endereco?.logradouro || "",
          numero: data.number || data.endereco?.numero || "",
          complemento:
            data.additional_address_details || data.endereco?.complemento || "",
          bairro: data.neighborhood || data.endereco?.bairro || "",
          municipio: data.city || data.endereco?.municipio || "",
          uf: data.state || data.endereco?.uf || "",
          cep: data.zip_code || data.endereco?.cep || "",
        },
        telefones: data.phones || data.telefones || [],
        email: data.email || "",
      },
    };
  } catch (error) {
    return { isValid: false, message: "Erro ao consultar CNPJ" };
  }
}

// ===== VALIDADORES DE TELEFONE =====

/**
 * Valida telefone brasileiro (celular ou fixo)
 */
export function validateBrazilianPhone(phone: string): ValidationResult {
  const cleanPhone = phone.replace(/\D/g, "");

  // Remove código do país se presente
  const phoneWithoutCountry =
    cleanPhone.startsWith("55") && cleanPhone.length > 11
      ? cleanPhone.substring(2)
      : cleanPhone;

  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (phoneWithoutCountry.length !== 10 && phoneWithoutCountry.length !== 11) {
    return { isValid: false, message: "Telefone deve ter 10 ou 11 dígitos" };
  }

  // Verifica DDD válido (11-99)
  const ddd = phoneWithoutCountry.substring(0, 2);
  const validDDDs = [
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19", // SP
    "21",
    "22",
    "24", // RJ
    "27",
    "28", // ES
    "31",
    "32",
    "33",
    "34",
    "35",
    "37",
    "38", // MG
    "41",
    "42",
    "43",
    "44",
    "45",
    "46", // PR
    "47",
    "48",
    "49", // SC
    "51",
    "53",
    "54",
    "55", // RS
    "61", // DF
    "62",
    "64", // GO
    "63", // TO
    "65",
    "66", // MT
    "67", // MS
    "68", // AC
    "69", // RO
    "71",
    "73",
    "74",
    "75",
    "77", // BA
    "79", // SE
    "81",
    "87", // PE
    "82", // AL
    "83", // PB
    "84", // RN
    "85",
    "88", // CE
    "86",
    "89", // PI
    "91",
    "93",
    "94", // PA
    "92",
    "97", // AM
    "95", // RR
    "96", // AP
    "98",
    "99", // MA
  ];

  if (!validDDDs.includes(ddd)) {
    return { isValid: false, message: "DDD inválido" };
  }

  // Para celular, o terceiro dígito deve ser 9
  if (
    phoneWithoutCountry.length === 11 &&
    phoneWithoutCountry.charAt(2) !== "9"
  ) {
    return { isValid: false, message: "Celular deve começar com 9 após o DDD" };
  }

  // Para fixo, o terceiro dígito não pode ser 9
  if (
    phoneWithoutCountry.length === 10 &&
    phoneWithoutCountry.charAt(2) === "9"
  ) {
    return { isValid: false, message: "Telefone fixo não pode começar com 9" };
  }

  return {
    isValid: true,
    formatted: formatBrazilianPhone(phoneWithoutCountry),
    message:
      phoneWithoutCountry.length === 11
        ? "Celular válido"
        : "Telefone fixo válido",
  };
}

// ===== FORMATADORES =====

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "");
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, "");
  return clean.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatBrazilianPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");

  if (clean.length === 10) {
    // Telefone fixo: (11) 3333-4444
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (clean.length === 11) {
    // Celular: (11) 99999-4444
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR");
}

// ===== DADOS AUXILIARES =====

export const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
];

export const BRAZILIAN_BANKS: BankData[] = [
  {
    code: "001",
    name: "Banco do Brasil",
    fullName: "Banco do Brasil S.A.",
    ispb: "00000000",
  },
  {
    code: "033",
    name: "Santander",
    fullName: "Banco Santander (Brasil) S.A.",
    ispb: "90400888",
  },
  {
    code: "104",
    name: "Caixa Econômica",
    fullName: "Caixa Econômica Federal",
    ispb: "00360305",
  },
  {
    code: "237",
    name: "Bradesco",
    fullName: "Banco Bradesco S.A.",
    ispb: "60746948",
  },
  {
    code: "341",
    name: "Itaú",
    fullName: "Itaú Unibanco S.A.",
    ispb: "60701190",
  },
  {
    code: "260",
    name: "Nu Pagamentos",
    fullName: "Nu Pagamentos S.A.",
    ispb: "18236120",
  },
  {
    code: "290",
    name: "PagSeguro",
    fullName: "PagSeguro Digital Ltd.",
    ispb: "08561701",
  },
  {
    code: "336",
    name: "Banco C6",
    fullName: "Banco C6 S.A.",
    ispb: "31872495",
  },
  {
    code: "077",
    name: "Banco Inter",
    fullName: "Banco Inter S.A.",
    ispb: "00416968",
  },
  {
    code: "212",
    name: "Banco Original",
    fullName: "Banco Original S.A.",
    ispb: "92874270",
  },
];

// ===== VALIDADORES ESPECÍFICOS =====

/**
 * Valida chave PIX
 */
export function validatePixKey(
  key: string,
  type: "cpf" | "cnpj" | "email" | "phone" | "random",
): ValidationResult {
  switch (type) {
    case "cpf":
      return validateCPF(key);
    case "cnpj":
      return validateCNPJ(key);
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(key),
        formatted: key.toLowerCase(),
        message: emailRegex.test(key) ? "Email válido" : "Email inválido",
      };
    case "phone":
      return validateBrazilianPhone(key);
    case "random":
      const randomKeyRegex =
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      return {
        isValid: randomKeyRegex.test(key),
        formatted: key.toLowerCase(),
        message: randomKeyRegex.test(key)
          ? "Chave aleatória válida"
          : "Chave aleatória inválida",
      };
    default:
      return { isValid: false, message: "Tipo de chave PIX inválido" };
  }
}

/**
 * Detecta tipo de chave PIX automaticamente
 */
export function detectPixKeyType(
  key: string,
): "cpf" | "cnpj" | "email" | "phone" | "random" | "unknown" {
  const clean = key.replace(/\D/g, "");

  if (clean.length === 11 && !key.includes("@")) {
    return "cpf";
  }

  if (clean.length === 14 && !key.includes("@")) {
    return "cnpj";
  }

  if (key.includes("@")) {
    return "email";
  }

  if (clean.length === 10 || clean.length === 11) {
    return "phone";
  }

  if (
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)
  ) {
    return "random";
  }

  return "unknown";
}

/**
 * Valida horário comercial brasileiro
 */
export function isBrazilianBusinessHours(date: Date = new Date()): boolean {
  const brazilTime = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );
  const hour = brazilTime.getHours();
  const day = brazilTime.getDay();

  // Segunda a sexta, 8h às 18h
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
}

/**
 * Verifica se é feriado nacional brasileiro
 */
export function isBrazilianHoliday(date: Date = new Date()): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Feriados fixos
  const fixedHolidays = [
    "01/01", // Confraternização Universal
    "04/21", // Tiradentes
    "05/01", // Dia do Trabalhador
    "09/07", // Independência do Brasil
    "10/12", // Nossa Senhora Aparecida
    "11/02", // Finados
    "11/15", // Proclamação da República
    "12/25", // Natal
  ];

  const dateString = `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;

  if (fixedHolidays.includes(dateString)) {
    return true;
  }

  // Aqui poderiam ser adicionados feriados móveis (Carnaval, Páscoa, etc.)
  // que requerem cálculos mais complexos

  return false;
}

export default {
  validateCPF,
  validateCNPJ,
  validateCEP,
  validateBrazilianPhone,
  validatePixKey,
  detectPixKeyType,
  getAddressByCEP,
  getCNPJData,
  formatCPF,
  formatCNPJ,
  formatCEP,
  formatBrazilianPhone,
  formatCurrency,
  formatDate,
  formatDateTime,
  isBrazilianBusinessHours,
  isBrazilianHoliday,
  BRAZILIAN_STATES,
  BRAZILIAN_BANKS,
};
