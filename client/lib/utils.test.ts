// Testes unitários para utilities KRYONIX
import { describe, it, expect, vi } from "vitest";
import { cn } from "./utils";
import {
  formatCurrency,
  formatPhone,
  formatCPF,
  formatCEP,
  formatDate,
  isValidCPF,
  isValidEmail,
  isValidPhone,
  generateUUID,
  debounce,
  throttle,
  formatRelativeTime,
  parsePhoneNumber,
  maskSensitiveData,
} from "./brazilian-formatters";

describe("cn (className utility)", () => {
  it("deve combinar classes condicionalmente", () => {
    const result = cn(
      "base-class",
      { "conditional-class": true },
      { "ignored-class": false },
      "additional-class",
    );

    expect(result).toBe("base-class conditional-class additional-class");
  });

  it("deve lidar com classes duplicadas", () => {
    const result = cn("p-4", "p-2", "mb-4");
    expect(result).toBe("p-2 mb-4"); // tailwind-merge remove conflitos
  });

  it("deve lidar com valores undefined e null", () => {
    const result = cn("base", undefined, null, "end");
    expect(result).toBe("base end");
  });
});

describe("formatCurrency", () => {
  it("deve formatar moeda brasileira corretamente", () => {
    expect(formatCurrency(1234.56)).toBe("R$ 1.234,56");
    expect(formatCurrency(0)).toBe("R$ 0,00");
    expect(formatCurrency(10)).toBe("R$ 10,00");
    expect(formatCurrency(1234567.89)).toBe("R$ 1.234.567,89");
  });

  it("deve lidar com números negativos", () => {
    expect(formatCurrency(-100.5)).toBe("-R$ 100,50");
  });

  it("deve lidar com valores muito pequenos", () => {
    expect(formatCurrency(0.01)).toBe("R$ 0,01");
    expect(formatCurrency(0.001)).toBe("R$ 0,00");
  });
});

describe("formatPhone", () => {
  it("deve formatar telefones brasileiros", () => {
    expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
    expect(formatPhone("+5511999999999")).toBe("+55 (11) 99999-9999");
  });

  it("deve lidar com formatos inválidos", () => {
    expect(formatPhone("123")).toBe("123"); // Não formata se muito pequeno
    expect(formatPhone("")).toBe("");
    expect(formatPhone("abc")).toBe("abc"); // Mantém texto inválido
  });

  it("deve remover caracteres especiais antes de formatar", () => {
    expect(formatPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
    expect(formatPhone("11.99999.9999")).toBe("(11) 99999-9999");
  });
});

describe("formatCPF", () => {
  it("deve formatar CPF corretamente", () => {
    expect(formatCPF("12345678900")).toBe("123.456.789-00");
    expect(formatCPF("00000000000")).toBe("000.000.000-00");
  });

  it("deve lidar com CPFs parciais", () => {
    expect(formatCPF("123456789")).toBe("123.456.789");
    expect(formatCPF("123")).toBe("123");
  });

  it("deve remover caracteres não numéricos", () => {
    expect(formatCPF("123.456.789-00")).toBe("123.456.789-00");
    expect(formatCPF("abc123def456")).toBe("123.456");
  });
});

describe("formatCEP", () => {
  it("deve formatar CEP brasileiro", () => {
    expect(formatCEP("01310100")).toBe("01310-100");
    expect(formatCEP("12345678")).toBe("12345-678");
  });

  it("deve lidar com CEPs incompletos", () => {
    expect(formatCEP("01310")).toBe("01310");
    expect(formatCEP("123")).toBe("123");
  });
});

describe("formatDate", () => {
  it("deve formatar datas em formato brasileiro", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    expect(formatDate(date)).toBe("15/01/2024");
  });

  it("deve formatar timestamps", () => {
    const timestamp = new Date("2024-12-25T00:00:00Z").getTime();
    expect(formatDate(timestamp)).toBe("25/12/2024");
  });

  it("deve aceitar strings de data", () => {
    expect(formatDate("2024-03-08")).toBe("08/03/2024");
  });

  it("deve lidar com datas inválidas", () => {
    expect(formatDate("invalid")).toBe("Data inválida");
    expect(formatDate(null as any)).toBe("Data inválida");
  });
});

describe("isValidCPF", () => {
  it("deve validar CPFs válidos", () => {
    expect(isValidCPF("11144477735")).toBe(true);
    expect(isValidCPF("123.456.789-09")).toBe(true);
  });

  it("deve rejeitar CPFs inválidos", () => {
    expect(isValidCPF("00000000000")).toBe(false); // Todos iguais
    expect(isValidCPF("12345678900")).toBe(false); // Dígitos verificadores errados
    expect(isValidCPF("123")).toBe(false); // Muito curto
    expect(isValidCPF("abc")).toBe(false); // Não numérico
  });

  it("deve lidar com CPFs formatados", () => {
    expect(isValidCPF("111.444.777-35")).toBe(true);
    expect(isValidCPF("111 444 777 35")).toBe(true);
  });
});

describe("isValidEmail", () => {
  it("deve validar emails válidos", () => {
    expect(isValidEmail("test@kryonix.com.br")).toBe(true);
    expect(isValidEmail("user.name+tag@example.org")).toBe(true);
    expect(isValidEmail("teste123@gmail.com")).toBe(true);
  });

  it("deve rejeitar emails inválidos", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("deve validar telefones brasileiros válidos", () => {
    expect(isValidPhone("11999999999")).toBe(true);
    expect(isValidPhone("+5511999999999")).toBe(true);
    expect(isValidPhone("(11) 99999-9999")).toBe(true);
  });

  it("deve rejeitar telefones inválidos", () => {
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("abc")).toBe(false);
    expect(isValidPhone("")).toBe(false);
    expect(isValidPhone("00000000000")).toBe(false);
  });
});

describe("generateUUID", () => {
  it("deve gerar UUID válido", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("deve gerar UUIDs únicos", () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});

describe("debounce", () => {
  it("deve atrasar execução da função", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("deve cancelar execução anterior", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("first");
    setTimeout(() => debouncedFn("second"), 50);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("second");
  });
});

describe("throttle", () => {
  it("deve limitar frequência de execução", async () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 150));
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe("formatRelativeTime", () => {
  it("deve formatar tempo relativo em português", () => {
    const now = Date.now();

    expect(formatRelativeTime(now - 30000)).toBe("há 30 segundos");
    expect(formatRelativeTime(now - 300000)).toBe("há 5 minutos");
    expect(formatRelativeTime(now - 3600000)).toBe("há 1 hora");
    expect(formatRelativeTime(now - 86400000)).toBe("há 1 dia");
  });

  it("deve lidar com tempo futuro", () => {
    const future = Date.now() + 3600000;
    expect(formatRelativeTime(future)).toBe("em 1 hora");
  });
});

describe("parsePhoneNumber", () => {
  it("deve extrair informações do telefone brasileiro", () => {
    const result = parsePhoneNumber("+5511999999999");

    expect(result).toEqual({
      countryCode: "55",
      areaCode: "11",
      number: "999999999",
      formatted: "+55 (11) 99999-9999",
      isValid: true,
      isMobile: true,
    });
  });

  it("deve identificar telefone fixo", () => {
    const result = parsePhoneNumber("1133334444");

    expect(result.isMobile).toBe(false);
    expect(result.isValid).toBe(true);
  });

  it("deve lidar com números inválidos", () => {
    const result = parsePhoneNumber("123");

    expect(result.isValid).toBe(false);
  });
});

describe("maskSensitiveData", () => {
  it("deve mascarar CPF", () => {
    expect(maskSensitiveData("12345678900", "cpf")).toBe("123.***.***-**");
  });

  it("deve mascarar email", () => {
    expect(maskSensitiveData("test@kryonix.com.br", "email")).toBe(
      "t***@kryonix.com.br",
    );
  });

  it("deve mascarar telefone", () => {
    expect(maskSensitiveData("11999999999", "phone")).toBe("(11) ****-*999");
  });

  it("deve mascarar dados genéricos", () => {
    expect(maskSensitiveData("sensitive-data", "generic")).toBe("sen***-data");
  });
});

// Testes de integração entre funções
describe("Integração entre formatadores", () => {
  it("deve formatar e validar CPF consistentemente", () => {
    const cpf = "11144477735";
    const formatted = formatCPF(cpf);
    const isValid = isValidCPF(formatted);

    expect(formatted).toBe("111.444.777-35");
    expect(isValid).toBe(true);
  });

  it("deve formatar e validar telefone consistentemente", () => {
    const phone = "11999999999";
    const formatted = formatPhone(phone);
    const isValid = isValidPhone(formatted);

    expect(formatted).toBe("(11) 99999-9999");
    expect(isValid).toBe(true);
  });

  it("deve trabalhar com dados brasileiros reais", () => {
    // Teste com dados típicos brasileiros
    const data = {
      cpf: "12345678900",
      phone: "11999999999",
      cep: "01310100",
      currency: 1299.9,
    };

    expect(formatCPF(data.cpf)).toBe("123.456.789-00");
    expect(formatPhone(data.phone)).toBe("(11) 99999-9999");
    expect(formatCEP(data.cep)).toBe("01310-100");
    expect(formatCurrency(data.currency)).toBe("R$ 1.299,90");
  });
});

// Testes de performance
describe("Performance dos utilitários", () => {
  it("deve formatar muitos CPFs rapidamente", () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      formatCPF("12345678900");
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Menos de 100ms para 1000 formatações
  });

  it("deve validar muitos emails rapidamente", () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      isValidEmail("test@kryonix.com.br");
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50); // Menos de 50ms para 1000 validações
  });
});

// Testes de edge cases
describe("Edge cases e robustez", () => {
  it("deve lidar com entrada nula ou undefined", () => {
    expect(formatCPF(null as any)).toBe("");
    expect(formatPhone(undefined as any)).toBe("");
    expect(isValidEmail(null as any)).toBe(false);
  });

  it("deve lidar com strings muito longas", () => {
    const longString = "a".repeat(1000);
    expect(() => formatCPF(longString)).not.toThrow();
    expect(() => isValidEmail(longString)).not.toThrow();
  });

  it("deve lidar com caracteres especiais", () => {
    expect(formatCPF("123.456.789-00")).toBe("123.456.789-00");
    expect(formatPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
  });

  it("deve ser resistente a ataques de injeção", () => {
    const maliciousInput = '<script>alert("xss")</script>';
    expect(formatCPF(maliciousInput)).toBe("");
    expect(isValidEmail(maliciousInput)).toBe(false);
  });
});
