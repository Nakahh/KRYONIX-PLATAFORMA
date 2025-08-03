#!/bin/bash

# Cores modernas
BOLD='\033[1m'
RESET='\033[0m'
BLUE='\033[1;34m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
PURPLE='\033[1;35m'
WHITE='\033[1;37m'
BRIGHT_BLUE='\033[1;94m'
BRIGHT_GREEN='\033[1;92m'
BRIGHT_CYAN='\033[1;96m'
BRIGHT_YELLOW='\033[1;93m'
GRAY='\033[90m'
LIGHT_GRAY='\033[37m'
DIM='\033[2m'

# Função de progresso moderna
show_progress() {
    local step=$1
    local total=$2
    local description="$3"
    local progress=$((step * 100 / total))
    local bar_width=70
    local filled=$((progress * bar_width / 100))
    local empty=$((bar_width - filled))
    
    # Limpar linhas anteriores se não for a primeira vez
    if [ $step -gt 1 ]; then
        printf "\033[8A\033[J"  # Move 8 linhas para cima e limpa até o final
    fi
    
    # Header moderno com cantos arredondados
    printf "${BOLD}${BRIGHT_BLUE}╭"
    printf "─%.0s" $(seq 1 $((bar_width + 24)))
    printf "╮${RESET}\n"
    
    # Linha do título
    printf "${BOLD}${BRIGHT_BLUE}│${RESET} ${BOLD}${WHITE}KRYONIX INSTALLER${RESET} "
    local title_padding=$((bar_width + 6))
    printf "%*s" $title_padding ""
    printf "${BOLD}${BRIGHT_BLUE}│${RESET}\n"
    
    # Separador
    printf "${BOLD}${BRIGHT_BLUE}├"
    printf "─%.0s" $(seq 1 $((bar_width + 24)))
    printf "┤${RESET}\n"
    
    # Linha principal da barra
    printf "${BOLD}${BRIGHT_BLUE}│${RESET} "
    
    # Barra de progresso com efeito visual moderno
    if [ $filled -gt 0 ]; then
        # Usar diferentes intensidades para criar efeito visual
        for i in $(seq 1 $filled); do
            local intensity=$((i * 100 / filled))
            if [ $intensity -gt 80 ]; then
                printf "${BOLD}${BRIGHT_CYAN}█${RESET}"
            elif [ $intensity -gt 60 ]; then
                printf "${BOLD}${CYAN}█${RESET}"
            elif [ $intensity -gt 40 ]; then
                printf "${BOLD}${BLUE}█${RESET}"
            else
                printf "${DIM}${BLUE}█${RESET}"
            fi
        done
        
        # Seta animada no final (se não estiver completo)
        if [ $progress -lt 100 ]; then
            case $((step % 3)) in
                0) printf "${BOLD}${BRIGHT_YELLOW}▶${RESET}" ;;
                1) printf "${BOLD}${YELLOW}▷${RESET}" ;;
                2) printf "${BOLD}${BRIGHT_YELLOW}▶${RESET}" ;;
            esac
            filled=$((filled + 1))
            empty=$((empty - 1))
        fi
    fi
    
    # Barra vazia com padrão pontilhado
    if [ $empty -gt 0 ]; then
        printf "${DIM}${GRAY}"
        for i in $(seq 1 $empty); do
            if [ $((i % 3)) -eq 0 ]; then
                printf "·"
            else
                printf "░"
            fi
        done
        printf "${RESET}"
    fi
    
    # Status e porcentagem
    printf " ${BOLD}${BRIGHT_BLUE}│${RESET} ${BOLD}${WHITE}%3d%%${RESET} " "$progress"
    
    # Indicador de status giratório ultra moderno
    case $((step % 8)) in
        0) printf "${BRIGHT_YELLOW}⠋${RESET}" ;;
        1) printf "${BRIGHT_YELLOW}⠙${RESET}" ;;
        2) printf "${BRIGHT_YELLOW}⠹${RESET}" ;;
        3) printf "${BRIGHT_YELLOW}⠸${RESET}" ;;
        4) printf "${BRIGHT_YELLOW}⠼${RESET}" ;;
        5) printf "${BRIGHT_YELLOW}⠴${RESET}" ;;
        6) printf "${BRIGHT_YELLOW}⠦${RESET}" ;;
        7) printf "${BRIGHT_YELLOW}⠧${RESET}" ;;
    esac
    
    printf " ${BOLD}${BRIGHT_BLUE}│${RESET}\n"
    
    # Linha de informação da etapa
    printf "${BOLD}${BRIGHT_BLUE}│${RESET} ${BOLD}${PURPLE}Etapa ${step}/${total}:${RESET} %-*s ${BOLD}${BRIGHT_BLUE}│${RESET}\n" $((bar_width + 8)) "$description"
    
    # Rodapé
    printf "${BOLD}${BRIGHT_BLUE}╰"
    printf "─%.0s" $(seq 1 $((bar_width + 24)))
    printf "╯${RESET}\n"
    
    # Status detalhado embaixo
    printf "\n${BOLD}${BRIGHT_CYAN}⚡ Status:${RESET} "
    case $progress in
        0-20) printf "${YELLOW}Inicializando...${RESET}" ;;
        21-40) printf "${BRIGHT_BLUE}Configurando ambiente...${RESET}" ;;
        41-60) printf "${PURPLE}Instalando dependências...${RESET}" ;;
        61-80) printf "${CYAN}Compilando aplicação...${RESET}" ;;
        81-99) printf "${BRIGHT_GREEN}Finalizando instalação...${RESET}" ;;
        100) printf "${BOLD}${BRIGHT_GREEN}✅ CONCLUÍDO COM SUCESSO!${RESET}" ;;
    esac
    printf "\n"
    
    # Efeito visual final se completo
    if [ $step -eq $total ]; then
        printf "\n${BOLD}${BRIGHT_GREEN}"
        printf "🎉━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🎉\n"
        printf "                        INSTALAÇÃO KRYONIX FINALIZADA                        \n"
        printf "🎉━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🎉${RESET}\n\n"
    else
        # Pequena pausa para animação suave
        sleep 0.2
    fi
}

# Demo das barras de progresso
clear
echo -e "${BOLD}${BRIGHT_BLUE}🚀 DEMO BARRA DE PROGRESSO KRYONIX ULTRA MODERNA 🚀${RESET}\n"

steps=(
    "Configurando ambiente Docker"
    "Baixando código mais recente"
    "Instalando dependências"
    "Validando configurações"
    "Construindo aplicação"
    "Implantando stack Docker"
    "Configurando webhooks"
    "Finalizando instalação"
)

for i in $(seq 1 8); do
    show_progress $i 8 "${steps[$((i-1))]}"
    sleep 1
done

echo -e "${BOLD}${GREEN}✅ Demo concluída! Sua barra de progresso está pronta!${RESET}"
