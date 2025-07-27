#!/usr/bin/env node

/**
 * KRYONIX Stripe Setup Script
 *
 * Este script configura automaticamente os produtos e preços no Stripe
 * para os planos do KRYONIX: Starter, Professional e Enterprise.
 *
 * Uso:
 *   1. Configure sua STRIPE_SECRET_KEY no .env
 *   2. Execute: node scripts/setup-stripe.js
 *   3. Copie os IDs gerados para seu .env
 */

import Stripe from "stripe";
import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

const plans = [
  {
    name: "KRYONIX Starter",
    description:
      "Perfeito para pequenos negócios que estão começando com automação WhatsApp",
    price: 2990, // R$ 29.90 em centavos
    currency: "brl",
    interval: "month",
    trial_period_days: 7,
    features: [
      "1 instância WhatsApp",
      "1.000 mensagens/mês",
      "5 regras de automação",
      "2 membros da equipe",
      "3 fluxos de chatbot",
      "10.000 chamadas API/mês",
      "5GB armazenamento",
      "Backup semanal",
      "SSL incluído",
    ],
  },
  {
    name: "KRYONIX Professional",
    description:
      "Ideal para empresas em crescimento com necessidades avançadas de automação",
    price: 8990, // R$ 89.90 em centavos
    currency: "brl",
    interval: "month",
    trial_period_days: 14,
    features: [
      "5 instâncias WhatsApp",
      "10.000 mensagens/mês",
      "25 regras de automação",
      "10 membros da equipe",
      "15 fluxos de chatbot",
      "100.000 chamadas API/mês",
      "50GB armazenamento",
      "Integrações personalizadas",
      "Suporte prioritário",
      "Analytics avançado",
      "Domínio personalizado",
      "Backup diário",
      "SSL incluído",
    ],
  },
  {
    name: "KRYONIX Enterprise",
    description:
      "Solução completa para grandes empresas com recursos ilimitados",
    price: 29990, // R$ 299.90 em centavos
    currency: "brl",
    interval: "month",
    trial_period_days: 30,
    features: [
      "WhatsApp instâncias ilimitadas",
      "Mensagens ilimitadas",
      "Automações ilimitadas",
      "Membros da equipe ilimitados",
      "Chatbots ilimitados",
      "API calls ilimitadas",
      "500GB armazenamento",
      "Integrações personalizadas",
      "Suporte prioritário 24/7",
      "White label completo",
      "Analytics avançado",
      "Domínio personalizado",
      "Backup em tempo real",
      "SSL incluído",
      "Manager dedicado",
    ],
  },
];

async function createProduct(planData) {
  try {
    console.log(`\n🔄 Criando produto: ${planData.name}...`);

    // Criar produto
    const product = await stripe.products.create({
      name: planData.name,
      description: planData.description,
      metadata: {
        type: "subscription",
        plan_level: planData.name.split(" ")[1].toLowerCase(), // starter, professional, enterprise
      },
    });

    console.log(`✅ Produto criado: ${product.id}`);

    // Criar preço
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: planData.price,
      currency: planData.currency,
      recurring: {
        interval: planData.interval,
        trial_period_days: planData.trial_period_days,
      },
      metadata: {
        features: JSON.stringify(planData.features),
      },
    });

    console.log(`✅ Preço criado: ${price.id}`);

    return {
      productId: product.id,
      priceId: price.id,
      name: planData.name,
      level: planData.name.split(" ")[1].toLowerCase(),
    };
  } catch (error) {
    console.error(`❌ Erro ao criar produto ${planData.name}:`, error.message);
    throw error;
  }
}

async function setupWebhookEndpoint() {
  try {
    console.log("\n🔄 Configurando webhook endpoint...");

    const webhook = await stripe.webhookEndpoints.create({
      url: "https://your-domain.com/api/billing/webhook", // Substitua pela sua URL
      enabled_events: [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_succeeded",
        "invoice.payment_failed",
        "customer.created",
        "customer.updated",
      ],
      description: "KRYONIX Billing Webhook",
    });

    console.log(`✅ Webhook criado: ${webhook.id}`);
    console.log(`🔑 Webhook secret: ${webhook.secret}`);

    return webhook;
  } catch (error) {
    console.error("❌ Erro ao criar webhook:", error.message);
    throw error;
  }
}

async function main() {
  console.log("🚀 KRYONIX - Configuração do Stripe");
  console.log("=====================================\n");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY não encontrada no .env");
    console.error(
      "Por favor, configure sua chave secreta do Stripe no arquivo .env",
    );
    process.exit(1);
  }

  try {
    const results = [];

    // Criar produtos e preços
    for (const plan of plans) {
      const result = await createProduct(plan);
      results.push(result);
    }

    // Configurar webhook (opcional)
    let webhook = null;
    try {
      webhook = await setupWebhookEndpoint();
    } catch (error) {
      console.log("\n⚠️  Webhook não configurado (opcional)");
    }

    // Gerar variáveis de ambiente
    console.log("\n📋 VARIÁVEIS DE AMBIENTE GERADAS");
    console.log("==================================");
    console.log("Copie e cole estas variáveis no seu arquivo .env:\n");

    results.forEach((result) => {
      const level = result.level.toUpperCase();
      console.log(`STRIPE_${level}_PRODUCT_ID=${result.productId}`);
      console.log(`STRIPE_${level}_PRICE_ID=${result.priceId}`);
    });

    if (webhook) {
      console.log(`\nSTRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    }

    console.log("\n✅ Configuração concluída com sucesso!");
    console.log("\n📚 PRÓXIMOS PASSOS:");
    console.log("1. Copie as variáveis acima para seu .env");
    console.log("2. Atualize a URL do webhook no Stripe Dashboard");
    console.log("3. Configure seu domínio de produção");
    console.log("4. Teste os fluxos de pagamento");
    console.log("5. Configure o Stripe Customer Portal");
  } catch (error) {
    console.error("\n❌ Erro durante a configuração:", error.message);
    process.exit(1);
  }
}

// Executar script apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as setupStripe };
