#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 Updating KRYONIX translation files...');

// Translation updates for all missing keys
const translationUpdates = {
  'es.json': {
    modules: {
      analytics: {
        name: "Análisis Avanzado y BI",
        description: "Transforme datos en decisiones inteligentes con nuestro módulo de Business Intelligence."
      },
      scheduling: {
        name: "Programación Inteligente + Facturación",
        description: "Sistema completo de programación automatizada que elimina conflictos y optimiza su agenda."
      },
      omnichannel: {
        name: "Soporte Omnicanal IA",
        description: "Unifique todos los canales de soporte en una sola plataforma inteligente."
      },
      crm: {
        name: "CRM Inteligente y Embudo de Ventas",
        description: "Gestione sus clientes y ventas con IA que nunca pierde una oportunidad."
      },
      email: {
        name: "Marketing por Email Avanzado",
        description: "Campañas inteligentes que llegan en el momento correcto, en el canal correcto, a la persona correcta."
      },
      social: {
        name: "Gestión de Redes Sociales + IA",
        description: "Automatice su presencia digital con IA que crea, publica e interactúa por usted."
      },
      portal: {
        name: "Portal Cliente + Entrenamiento IA",
        description: "Área exclusiva donde sus clientes acceden a todo lo que necesitan de forma autónoma."
      },
      whatsapp: {
        name: "Automatización WhatsApp Business",
        description: "Transforme nuestra plataforma en su propia solución con su marca e identidad visual."
      },
      sms: {
        name: "SMS + Notificaciones Push",
        description: "Comunicación múltiple con sus clientes vía SMS, Push y notificaciones inteligentes."
      }
    },
    packages: {
      starter: { name: "Paquete Starter", description: "Perfecto para empezar" },
      professional: { name: "Paquete Profesional", description: "Mejor costo-beneficio" },
      enterprise: { name: "Paquete Enterprise", description: "Todas las características" }
    },
    forms: {
      name: "Nombre Completo",
      email: "Dirección de Email",
      phone: "Teléfono",
      company: "Empresa",
      position: "Cargo",
      segment: "Segmento de Negocio",
      message: "Mensaje",
      required: "Este campo es obligatorio",
      submit: "Enviar Propuesta",
      sending: "Enviando...",
      success: "¡Enviado con éxito!",
      error: "Error al enviar. Inténtelo de nuevo."
    },
    waitlist: {
      title: "Únete a la Lista de Espera VIP",
      subtitle: "Sé uno de los primeros 1,000 clientes en revolucionar tu negocio con IA"
    }
  },
  'de.json': {
    modules: {
      analytics: {
        name: "Erweiterte Analytik & BI",
        description: "Verwandeln Sie Daten in intelligente Entscheidungen mit unserem Business Intelligence-Modul."
      },
      scheduling: {
        name: "Intelligente Terminplanung + Abrechnung",
        description: "Komplettes automatisiertes Terminplanungssystem, das Konflikte eliminiert und Ihren Terminkalender optimiert."
      },
      omnichannel: {
        name: "Omnichannel KI-Support",
        description: "Vereinigen Sie alle Support-Kanäle in einer einzigen intelligenten Plattform."
      },
      crm: {
        name: "Intelligentes CRM & Verkaufstrichter",
        description: "Verwalten Sie Ihre Kunden und Verkäufe mit KI, die nie eine Gelegenheit verpasst."
      },
      email: {
        name: "Erweiterte E-Mail-Marketing",
        description: "Intelligente Kampagnen, die zur richtigen Zeit, auf dem richtigen Kanal, an die richtige Person gelangen."
      },
      social: {
        name: "Social Media Management + KI",
        description: "Automatisieren Sie Ihre digitale Präsenz mit KI, die für Sie erstellt, veröffentlicht und interagiert."
      },
      portal: {
        name: "Kundenportal + KI-Training",
        description: "Exklusiver Bereich, in dem Ihre Kunden autonom auf alles zugreifen, was sie benötigen."
      },
      whatsapp: {
        name: "WhatsApp Business Automatisierung",
        description: "Verwandeln Sie unsere Plattform in Ihre eigene Lösung mit Ihrer Marke und visuellen Identität."
      },
      sms: {
        name: "SMS + Push-Benachrichtigungen",
        description: "Mehrfache Kommunikation mit Ihren Kunden über SMS, Push und intelligente Benachrichtigungen."
      }
    },
    packages: {
      starter: { name: "Starter-Paket", description: "Perfekt zum Starten" },
      professional: { name: "Professional-Paket", description: "Bestes Preis-Leistungs-Verhältnis" },
      enterprise: { name: "Enterprise-Paket", description: "Alle Funktionen" }
    },
    forms: {
      name: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefon",
      company: "Unternehmen",
      position: "Position",
      segment: "Geschäftsbereich",
      message: "Nachricht",
      required: "Dieses Feld ist erforderlich",
      submit: "Vorschlag einreichen",
      sending: "Senden...",
      success: "Erfolgreich gesendet!",
      error: "Fehler beim Senden. Bitte versuchen Sie es erneut."
    },
    waitlist: {
      title: "Der VIP-Warteliste beitreten",
      subtitle: "Seien Sie einer der ersten 1.000 Kunden, die Ihr Geschäft mit KI revolutionieren"
    }
  },
  'fr.json': {
    modules: {
      analytics: {
        name: "Analytique Avancée & BI",
        description: "Transformez les données en décisions intelligentes avec notre module de Business Intelligence."
      },
      scheduling: {
        name: "Planification Intelligente + Facturation",
        description: "Système complet de planification automatisée qui élimine les conflits et optimise votre agenda."
      },
      omnichannel: {
        name: "Support Omnicanal IA",
        description: "Unifiez tous les canaux de support en une seule plateforme intelligente."
      },
      crm: {
        name: "CRM Intelligent & Entonnoir de Vente",
        description: "Gérez vos clients et ventes avec l'IA qui ne rate jamais une opportunité."
      },
      email: {
        name: "Marketing Email Avancé",
        description: "Campagnes intelligentes qui arrivent au bon moment, sur le bon canal, à la bonne personne."
      },
      social: {
        name: "Gestion Réseaux Sociaux + IA",
        description: "Automatisez votre présence numérique avec l'IA qui crée, publie et engage pour vous."
      },
      portal: {
        name: "Portail Client + Formation IA",
        description: "Zone exclusive où vos clients accèdent à tout ce dont ils ont besoin de manière autonome."
      },
      whatsapp: {
        name: "Automatisation WhatsApp Business",
        description: "Transformez notre plateforme en votre propre solution avec votre marque et identité visuelle."
      },
      sms: {
        name: "SMS + Notifications Push",
        description: "Communication multiple avec vos clients via SMS, Push et notifications intelligentes."
      }
    },
    packages: {
      starter: { name: "Pack Starter", description: "Parfait pour commencer" },
      professional: { name: "Pack Professionnel", description: "Meilleur rapport qualité-prix" },
      enterprise: { name: "Pack Enterprise", description: "Toutes les fonctionnalités" }
    },
    forms: {
      name: "Nom Complet",
      email: "Adresse Email",
      phone: "Téléphone",
      company: "Entreprise",
      position: "Poste",
      segment: "Segment d'Activité",
      message: "Message",
      required: "Ce champ est obligatoire",
      submit: "Soumettre la Proposition",
      sending: "Envoi...",
      success: "Envoyé avec succès!",
      error: "Erreur lors de l'envoi. Veuillez réessayer."
    },
    waitlist: {
      title: "Rejoindre la Liste d'Attente VIP",
      subtitle: "Soyez l'un des 1 000 premiers clients à révolutionner votre entreprise avec l'IA"
    }
  }
};

// Function to update translation file
function updateTranslationFile(filename, updates) {
  const filePath = path.join(__dirname, '..', 'locales', filename);
  
  try {
    // Read existing file
    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Merge with updates
    const updatedData = { ...existingData, ...updates };
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    
    console.log(`✅ Updated ${filename}`);
  } catch (error) {
    console.error(`❌ Error updating ${filename}:`, error.message);
  }
}

// Update all translation files
Object.entries(translationUpdates).forEach(([filename, updates]) => {
  updateTranslationFile(filename, updates);
});

console.log('🎉 Translation update completed!');
console.log('📋 Updated files:');
console.log('   • Spanish (es.json)');
console.log('   • German (de.json)');
console.log('   • French (fr.json)');
console.log('');
console.log('⚠️  Note: Portuguese (pt-br.json) and English (en.json) were updated manually');
