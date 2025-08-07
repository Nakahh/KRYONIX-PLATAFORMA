# 💡 PARTE 34 - RECOMENDAÇÕES INTELIGENTES
*Agentes Responsáveis: Especialista IA + Frontend + UX/UI + Analista BI*

---

## 🎯 **OBJETIVOS DA PARTE 34**
Implementar sistema avançado de recomendações inteligentes que analisa comportamento do usuário, sugere ações, otimizações e próximos passos personalizados na plataforma KRYONIX SaaS.

---

## 🛠️ **STACK TÉCNICA**
```yaml
IA Engine: Dify AI + Ollama
Behavior Tracking: PostgreSQL + Redis
Recommendation Engine: Python scikit-learn
Real-time: WebSocket + Server-Sent Events
Analytics: Metabase integration
Frontend: React + TypeScript
```

---

## 👥 **AGENTES ESPECIALIZADOS ATUANDO**

### 🧠 **Especialista IA** - Líder da Parte
**Responsabilidades:**
- Algoritmos de recomendação
- Machine learning models
- Content-based filtering
- Collaborative filtering

### 🎨 **UX/UI Designer**
**Responsabilidades:**
- Interface de recomendações
- User experience optimization
- Tooltip e hints design
- Notification system

### 💻 **Frontend Specialist**
**Responsabilidades:**
- Recommendation components
- Real-time updates
- Interactive suggestions
- User feedback collection

### 📊 **Analista BI**
**Responsabilidades:**
- Performance metrics
- A/B testing
- Recommendation effectiveness
- User engagement tracking

---

## 📋 **SISTEMA DE RECOMENDAÇÕES**

### **34.1 - Recommendation Engine Core**
```python
# src/ml/recommendation_engine.py
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import NMF
from typing import List, Dict, Any
import json
from datetime import datetime, timedelta

class IntelligentRecommendationEngine:
    def __init__(self):
        self.content_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.collaborative_model = NMF(n_components=50, random_state=42)
        self.user_behavior_weights = {
            'feature_usage': 0.3,
            'time_spent': 0.25,
            'success_rate': 0.2,
            'recent_activity': 0.15,
            'user_goals': 0.1
        }
        
    def analyze_user_behavior(self, user_id: str) -> Dict[str, Any]:
        """Analisar comportamento completo do usuário"""
        # Coletar dados de comportamento
        behavior_data = self.get_user_behavior_data(user_id)
        
        # Calcular métricas de engajamento
        engagement_score = self.calculate_engagement_score(behavior_data)
        
        # Identificar padrões de uso
        usage_patterns = self.identify_usage_patterns(behavior_data)
        
        # Detectar objetivos do usuário
        user_goals = self.detect_user_goals(behavior_data)
        
        # Identificar pontos de fricção
        friction_points = self.detect_friction_points(behavior_data)
        
        return {
            'engagement_score': engagement_score,
            'usage_patterns': usage_patterns,
            'user_goals': user_goals,
            'friction_points': friction_points,
            'skill_level': self.assess_skill_level(behavior_data),
            'preferred_features': self.get_preferred_features(behavior_data),
            'optimal_usage_time': self.get_optimal_usage_time(behavior_data)
        }
    
    def generate_personalized_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """Gerar recomendações personalizadas para o usuário"""
        user_analysis = self.analyze_user_behavior(user_id)
        
        recommendations = []
        
        # Recomendações baseadas em objetivos
        goal_recommendations = self.get_goal_based_recommendations(user_analysis['user_goals'])
        recommendations.extend(goal_recommendations)
        
        # Recomendações de features não utilizadas
        feature_recommendations = self.get_feature_recommendations(user_id, user_analysis)
        recommendations.extend(feature_recommendations)
        
        # Recomendações de otimização
        optimization_recommendations = self.get_optimization_recommendations(user_analysis)
        recommendations.extend(optimization_recommendations)
        
        # Recomendações de workflow
        workflow_recommendations = self.get_workflow_recommendations(user_id)
        recommendations.extend(workflow_recommendations)
        
        # Recomendações de treinamento
        training_recommendations = self.get_training_recommendations(user_analysis)
        recommendations.extend(training_recommendations)
        
        # Ordenar por prioridade e relevância
        scored_recommendations = self.score_recommendations(recommendations, user_analysis)
        
        return sorted(scored_recommendations, key=lambda x: x['score'], reverse=True)[:10]
    
    def get_goal_based_recommendations(self, user_goals: List[str]) -> List[Dict[str, Any]]:
        """Recomendações baseadas nos objetivos detectados do usuário"""
        recommendations = []
        
        goal_mapping = {
            'automation': [
                {
                    'type': 'feature',
                    'title': 'Configure N8N Workflows',
                    'description': 'Automatize tarefas repetitivas com workflows visuais',
                    'action_url': '/n8n-setup',
                    'priority': 'high',
                    'category': 'automation',
                    'estimated_time': '15 minutos',
                    'difficulty': 'intermediate'
                },
                {
                    'type': 'integration',
                    'title': 'Conecte suas Ferramentas',
                    'description': 'Integre WhatsApp, Email e outras ferramentas',
                    'action_url': '/integrations',
                    'priority': 'high',
                    'category': 'automation'
                }
            ],
            'analytics': [
                {
                    'type': 'dashboard',
                    'title': 'Configure Dashboards Personalizados',
                    'description': 'Crie dashboards com métricas importantes para você',
                    'action_url': '/dashboard-builder',
                    'priority': 'medium',
                    'category': 'analytics'
                }
            ],
            'communication': [
                {
                    'type': 'chatbot',
                    'title': 'Crie seu Primeiro Chatbot',
                    'description': 'Configure atendimento automático 24/7',
                    'action_url': '/typebot-builder',
                    'priority': 'high',
                    'category': 'communication'
                }
            ]
        }
        
        for goal in user_goals:
            if goal in goal_mapping:
                recommendations.extend(goal_mapping[goal])
        
        return recommendations
    
    def get_feature_recommendations(self, user_id: str, user_analysis: Dict) -> List[Dict[str, Any]]:
        """Recomendar features não utilizadas baseado no perfil do usuário"""
        unused_features = self.get_unused_features(user_id)
        user_skill_level = user_analysis['skill_level']
        
        feature_recommendations = []
        
        for feature in unused_features:
            if self.is_feature_suitable(feature, user_skill_level, user_analysis):
                recommendation = {
                    'type': 'feature_discovery',
                    'title': f'Explore: {feature["name"]}',
                    'description': feature['description'],
                    'action_url': feature['url'],
                    'priority': self.calculate_feature_priority(feature, user_analysis),
                    'category': feature['category'],
                    'benefits': feature['benefits'],
                    'tutorial_available': feature.get('has_tutorial', False)
                }
                feature_recommendations.append(recommendation)
        
        return feature_recommendations
    
    def get_optimization_recommendations(self, user_analysis: Dict) -> List[Dict[str, Any]]:
        """Recomendações para otimizar uso atual"""
        recommendations = []
        
        # Analisar pontos de fricção
        for friction in user_analysis['friction_points']:
            if friction['type'] == 'slow_workflow':
                recommendations.append({
                    'type': 'optimization',
                    'title': 'Acelere seu Workflow',
                    'description': f'Detectamos lentidão em: {friction["area"]}',
                    'action_url': f'/optimize/{friction["area"]}',
                    'priority': 'medium',
                    'category': 'performance',
                    'potential_time_saved': friction.get('time_lost', '5 minutos/dia')
                })
            
            elif friction['type'] == 'repeated_actions':
                recommendations.append({
                    'type': 'automation_suggestion',
                    'title': 'Automatize Ações Repetitivas',
                    'description': f'Automatize: {friction["action"]}',
                    'action_url': '/automation-builder',
                    'priority': 'high',
                    'category': 'efficiency'
                })
        
        # Sugestões baseadas em padrões de uso
        if user_analysis['engagement_score'] < 0.5:
            recommendations.append({
                'type': 'engagement',
                'title': 'Maximize seu Potencial',
                'description': 'Descubra features que podem revolucionar seu trabalho',
                'action_url': '/feature-tour',
                'priority': 'high',
                'category': 'engagement'
            })
        
        return recommendations
    
    def get_workflow_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """Recomendar workflows baseado em usuários similares"""
        similar_users = self.find_similar_users(user_id)
        
        # Coletar workflows populares entre usuários similares
        popular_workflows = self.get_popular_workflows_for_similar_users(similar_users)
        
        recommendations = []
        for workflow in popular_workflows:
            recommendations.append({
                'type': 'workflow_template',
                'title': f'Workflow: {workflow["name"]}',
                'description': workflow['description'],
                'action_url': f'/workflows/import/{workflow["id"]}',
                'priority': 'medium',
                'category': 'workflow',
                'success_rate': workflow['success_rate'],
                'used_by': f'{workflow["user_count"]} usuários similares'
            })
        
        return recommendations
    
    def score_recommendations(self, recommendations: List[Dict], user_analysis: Dict) -> List[Dict]:
        """Pontuar recomendações baseado no perfil do usuário"""
        for rec in recommendations:
            score = 0.5  # Base score
            
            # Ajustar baseado na prioridade
            priority_weights = {'high': 0.3, 'medium': 0.2, 'low': 0.1}
            score += priority_weights.get(rec.get('priority', 'low'), 0.1)
            
            # Ajustar baseado no skill level
            if rec.get('difficulty') == user_analysis.get('skill_level'):
                score += 0.2
            
            # Ajustar baseado em objetivos do usuário
            if rec.get('category') in user_analysis.get('user_goals', []):
                score += 0.2
            
            # Ajustar baseado em engagement
            if user_analysis.get('engagement_score', 0) < 0.5 and rec.get('type') == 'engagement':
                score += 0.3
            
            rec['score'] = min(1.0, score)
        
        return recommendations

    def track_recommendation_interaction(self, user_id: str, recommendation_id: str, action: str):
        """Rastrear interações com recomendações para melhorar o sistema"""
        interaction_data = {
            'user_id': user_id,
            'recommendation_id': recommendation_id,
            'action': action,  # 'viewed', 'clicked', 'dismissed', 'completed'
            'timestamp': datetime.now(),
            'session_id': self.get_current_session_id(user_id)
        }
        
        # Salvar no banco para análise futura
        self.save_recommendation_interaction(interaction_data)
        
        # Atualizar modelo em tempo real se necessário
        if action == 'completed':
            self.update_recommendation_success_rate(recommendation_id)

class RecommendationTypes:
    """Tipos de recomendação disponíveis"""
    
    FEATURE_DISCOVERY = "feature_discovery"
    WORKFLOW_OPTIMIZATION = "workflow_optimization"
    AUTOMATION_SUGGESTION = "automation_suggestion"
    TRAINING_CONTENT = "training_content"
    INTEGRATION_SUGGESTION = "integration_suggestion"
    PERFORMANCE_IMPROVEMENT = "performance_improvement"
    USER_ENGAGEMENT = "user_engagement"
    GOAL_ACHIEVEMENT = "goal_achievement"
```

### **34.2 - Real-time Recommendations Service**
```typescript
// src/services/RecommendationsService.ts
import RedisService from './RedisService';
import { EventService } from './EventService';

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  actionUrl: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  score: number;
  metadata: any;
  expiresAt?: Date;
  conditions?: string[];
}

interface UserContext {
  userId: string;
  currentPage: string;
  sessionDuration: number;
  actionsPerformed: string[];
  skillLevel: string;
  goals: string[];
}

export class RecommendationsService {
  private static readonly CACHE_TTL = 30 * 60; // 30 minutos
  private static readonly MAX_RECOMMENDATIONS = 10;

  // Obter recomendações personalizadas
  static async getPersonalizedRecommendations(userId: string): Promise<Recommendation[]> {
    const cacheKey = `recommendations:${userId}`;
    
    // Verificar cache
    const cached = await RedisService.getJSON<Recommendation[]>(cacheKey);
    if (cached) {
      return this.filterActiveRecommendations(cached);
    }

    // Gerar novas recomendações
    const recommendations = await this.generateRecommendations(userId);
    
    // Cache com TTL
    await RedisService.setJSON(cacheKey, recommendations, this.CACHE_TTL);
    
    return recommendations;
  }

  // Obter recomendações contextuais baseadas na página atual
  static async getContextualRecommendations(
    userId: string,
    context: UserContext
  ): Promise<Recommendation[]> {
    const allRecommendations = await this.getPersonalizedRecommendations(userId);
    
    // Filtrar por contexto
    const contextualRecs = allRecommendations.filter(rec => 
      this.isRecommendationRelevantForContext(rec, context)
    );

    // Adicionar recomendações específicas da página
    const pageSpecificRecs = await this.getPageSpecificRecommendations(context.currentPage, userId);
    
    // Combinar e pontuar
    const combined = [...contextualRecs, ...pageSpecificRecs];
    
    return this.rankRecommendations(combined, context).slice(0, 5);
  }

  // Gerar recomendações via Python ML
  private static async generateRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      const response = await fetch('/api/ml/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      return data.recommendations.map(this.mapPythonRecommendation);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(userId);
    }
  }

  // Recomendações específicas por página
  private static async getPageSpecificRecommendations(
    page: string,
    userId: string
  ): Promise<Recommendation[]> {
    const pageRecommendations: Record<string, () => Promise<Recommendation[]>> = {
      '/dashboard': () => this.getDashboardRecommendations(userId),
      '/n8n': () => this.getN8NRecommendations(userId),
      '/typebot': () => this.getTypebotRecommendations(userId),
      '/analytics': () => this.getAnalyticsRecommendations(userId),
      '/integrations': () => this.getIntegrationRecommendations(userId),
    };

    const getRecommendations = pageRecommendations[page];
    return getRecommendations ? await getRecommendations() : [];
  }

  // Recomendações para Dashboard
  private static async getDashboardRecommendations(userId: string): Promise<Recommendation[]> {
    const userStats = await this.getUserStats(userId);
    const recommendations: Recommendation[] = [];

    // Se usuário tem poucos widgets
    if (userStats.widgetCount < 3) {
      recommendations.push({
        id: 'add-widgets',
        type: 'dashboard_optimization',
        title: '📊 Adicione Widgets Úteis',
        description: 'Customize seu dashboard com métricas importantes',
        actionUrl: '/dashboard/widgets',
        priority: 'medium',
        category: 'customization',
        score: 0.8,
        metadata: { widgetSuggestions: ['revenue', 'users', 'performance'] }
      });
    }

    // Se não configurou alertas
    if (!userStats.hasAlerts) {
      recommendations.push({
        id: 'setup-alerts',
        type: 'monitoring_setup',
        title: '🔔 Configure Alertas Inteligentes',
        description: 'Receba notificações sobre métricas importantes',
        actionUrl: '/dashboard/alerts',
        priority: 'high',
        category: 'monitoring',
        score: 0.9,
        metadata: { alertTypes: ['performance', 'errors', 'usage'] }
      });
    }

    return recommendations;
  }

  // Recomendações para N8N
  private static async getN8NRecommendations(userId: string): Promise<Recommendation[]> {
    const workflows = await this.getUserWorkflows(userId);
    const recommendations: Recommendation[] = [];

    if (workflows.length === 0) {
      recommendations.push({
        id: 'first-workflow',
        type: 'getting_started',
        title: '🔄 Crie seu Primeiro Workflow',
        description: 'Comece com templates prontos para usar',
        actionUrl: '/n8n/templates',
        priority: 'high',
        category: 'automation',
        score: 1.0,
        metadata: { 
          templates: ['email-automation', 'data-sync', 'notifications'],
          difficulty: 'beginner'
        }
      });
    } else {
      // Sugerir otimizações para workflows existentes
      const inefficientWorkflows = workflows.filter(w => w.performance < 0.7);
      
      if (inefficientWorkflows.length > 0) {
        recommendations.push({
          id: 'optimize-workflows',
          type: 'optimization',
          title: '⚡ Otimize seus Workflows',
          description: 'Alguns workflows podem ser melhorados',
          actionUrl: '/n8n/optimize',
          priority: 'medium',
          category: 'performance',
          score: 0.7,
          metadata: { workflowsToOptimize: inefficientWorkflows.length }
        });
      }
    }

    return recommendations;
  }

  // Rastrear interação com recomendação
  static async trackInteraction(
    userId: string,
    recommendationId: string,
    action: 'viewed' | 'clicked' | 'dismissed' | 'completed'
  ): Promise<void> {
    const interaction = {
      userId,
      recommendationId,
      action,
      timestamp: new Date(),
      page: window.location.pathname,
    };

    // Salvar interação
    await fetch('/api/recommendations/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction)
    });

    // Atualizar cache se necessário
    if (action === 'dismissed') {
      await this.removeDismissedRecommendation(userId, recommendationId);
    }

    // Publicar evento para análise em tempo real
    await EventService.publishToUser(userId, {
      type: 'recommendation_interaction',
      data: interaction
    });
  }

  // Obter feedback sobre recomendação
  static async submitFeedback(
    userId: string,
    recommendationId: string,
    feedback: {
      helpful: boolean;
      comment?: string;
      rating: number; // 1-5
    }
  ): Promise<void> {
    await fetch('/api/recommendations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        recommendationId,
        feedback,
        timestamp: new Date()
      })
    });

    // Invalidar cache para regenerar recomendações
    await RedisService.del(`recommendations:${userId}`);
  }

  // Atualizar contexto do usuário
  static async updateUserContext(userId: string, context: Partial<UserContext>): Promise<void> {
    const currentContext = await RedisService.getJSON<UserContext>(`user_context:${userId}`) || {};
    const updatedContext = { ...currentContext, ...context };
    
    await RedisService.setJSON(`user_context:${userId}`, updatedContext, 60 * 60); // 1 hora
  }

  // Invalidar cache de recomendações
  static async invalidateRecommendations(userId: string): Promise<void> {
    await RedisService.del(`recommendations:${userId}`);
  }

  // Helpers privados
  private static filterActiveRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const now = new Date();
    return recommendations.filter(rec => 
      !rec.expiresAt || rec.expiresAt > now
    );
  }

  private static isRecommendationRelevantForContext(
    rec: Recommendation,
    context: UserContext
  ): boolean {
    // Verificar condições
    if (rec.conditions) {
      return rec.conditions.every(condition => 
        this.evaluateCondition(condition, context)
      );
    }

    // Verificar relevância por categoria
    const pageCategories: Record<string, string[]> = {
      '/dashboard': ['customization', 'monitoring', 'analytics'],
      '/n8n': ['automation', 'workflow', 'integration'],
      '/typebot': ['chatbot', 'communication', 'ai'],
      '/analytics': ['analytics', 'reporting', 'insights'],
    };

    const relevantCategories = pageCategories[context.currentPage] || [];
    return relevantCategories.includes(rec.category);
  }

  private static rankRecommendations(
    recommendations: Recommendation[],
    context: UserContext
  ): Recommendation[] {
    return recommendations
      .map(rec => ({
        ...rec,
        contextScore: this.calculateContextScore(rec, context)
      }))
      .sort((a, b) => 
        (b.score * b.contextScore) - (a.score * a.contextScore)
      );
  }

  private static calculateContextScore(rec: Recommendation, context: UserContext): number {
    let score = 1.0;

    // Boost para objetivos do usuário
    if (context.goals.includes(rec.category)) {
      score += 0.3;
    }

    // Boost para nível de skill
    if (rec.metadata?.difficulty === context.skillLevel) {
      score += 0.2;
    }

    // Penalty para recomendações muito complexas para iniciantes
    if (context.skillLevel === 'beginner' && rec.metadata?.difficulty === 'advanced') {
      score -= 0.4;
    }

    return Math.max(0.1, Math.min(2.0, score));
  }
}
```

### **34.3 - Recommendation UI Components**
```tsx
// src/components/RecommendationCard.tsx
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Lightbulb, 
  Clock, 
  Users, 
  TrendingUp, 
  X, 
  ThumbsUp, 
  ThumbsDown,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    type: string;
    title: string;
    description: string;
    actionUrl: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    metadata?: any;
  };
  onAction: (action: 'clicked' | 'dismissed') => void;
  onFeedback: (helpful: boolean) => void;
  compact?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAction,
  onFeedback,
  compact = false
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    automation: <TrendingUp className="h-4 w-4" />,
    customization: <Lightbulb className="h-4 w-4" />,
    performance: <Clock className="h-4 w-4" />,
    collaboration: <Users className="h-4 w-4" />,
  };

  const handleDismiss = () => {
    setDismissed(true);
    onAction('dismissed');
  };

  const handleClick = () => {
    onAction('clicked');
    // Navegar para a URL da recomendação
    if (recommendation.actionUrl.startsWith('http')) {
      window.open(recommendation.actionUrl, '_blank');
    } else {
      window.location.href = recommendation.actionUrl;
    }
  };

  return (
    <Card className={`relative transition-all hover:shadow-md ${compact ? 'p-3' : 'p-4'}`}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>

      <CardContent className={compact ? 'p-0' : 'p-0'}>
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {categoryIcons[recommendation.category] || <Lightbulb className="h-4 w-4 text-blue-600" />}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                {recommendation.title}
              </h4>
              <Badge className={`text-xs ${priorityColors[recommendation.priority]}`}>
                {recommendation.priority}
              </Badge>
            </div>

            <p className={`text-gray-600 mb-3 ${compact ? 'text-xs' : 'text-sm'}`}>
              {recommendation.description}
            </p>

            {/* Metadata */}
            {recommendation.metadata && (
              <div className="flex flex-wrap gap-2 mb-3">
                {recommendation.metadata.estimatedTime && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {recommendation.metadata.estimatedTime}
                  </span>
                )}
                {recommendation.metadata.difficulty && (
                  <span className="text-xs text-gray-500">
                    📊 {recommendation.metadata.difficulty}
                  </span>
                )}
                {recommendation.metadata.usedBy && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {recommendation.metadata.usedBy}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button 
                onClick={handleClick}
                size={compact ? "sm" : "default"}
                className="flex items-center space-x-1"
              >
                <span>Explorar</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Feedback */}
              {!compact && (
                <div className="flex items-center space-x-1">
                  {!showFeedback ? (
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Foi útil?
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          onFeedback(true);
                          setShowFeedback(false);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          onFeedback(false);
                          setShowFeedback(false);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// src/components/RecommendationCenter.tsx
import React, { useState, useEffect } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationsService } from '../services/RecommendationsService';
import { Button } from './ui/button';
import { RefreshCw, Lightbulb, Filter } from 'lucide-react';

export const RecommendationCenter: React.FC = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userId, setUserId] = useState(''); // Get from auth context

  useEffect(() => {
    loadRecommendations();
  }, [filter]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await RecommendationsService.getPersonalizedRecommendations(userId);
      const filteredRecs = filter === 'all' 
        ? recs 
        : recs.filter(r => r.category === filter);
      
      setRecommendations(filteredRecs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (id: string, action: 'clicked' | 'dismissed') => {
    await RecommendationsService.trackInteraction(userId, id, action);
    
    if (action === 'dismissed') {
      setRecommendations(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleFeedback = async (id: string, helpful: boolean) => {
    await RecommendationsService.submitFeedback(userId, id, {
      helpful,
      rating: helpful ? 5 : 2
    });
  };

  const categories = [
    { id: 'all', label: 'Todas', icon: '🎯' },
    { id: 'automation', label: 'Automação', icon: '🔄' },
    { id: 'customization', label: 'Personalização', icon: '🎨' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Recomendações Inteligentes</h2>
        </div>
        <Button onClick={loadRecommendations} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
        <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filter === category.id
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.icon} {category.label}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map(recommendation => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onAction={(action) => handleRecommendationAction(recommendation.id, action)}
              onFeedback={(helpful) => handleFeedback(recommendation.id, helpful)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma recomendação no momento
          </h3>
          <p className="text-gray-500 mb-4">
            Continue usando a plataforma para receber sugestões personalizadas
          </p>
          <Button onClick={loadRecommendations}>
            Verificar novamente
          </Button>
        </div>
      )}
    </div>
  );
};

// src/components/SmartTooltip.tsx
import React, { useState, useEffect } from 'react';
import { RecommendationsService } from '../services/RecommendationsService';

interface SmartTooltipProps {
  element: string; // ID do elemento
  userId: string;
  children: React.ReactNode;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  element,
  userId,
  children
}) => {
  const [showTip, setShowTip] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    // Verificar se há recomendação contextual para este elemento
    checkForContextualRecommendation();
  }, [element, userId]);

  const checkForContextualRecommendation = async () => {
    // Lógica para verificar se este elemento específico tem uma recomendação
    const context = {
      userId,
      currentPage: window.location.pathname,
      element,
      sessionDuration: Date.now() - (window as any).sessionStart,
      actionsPerformed: (window as any).userActions || [],
    };

    const recs = await RecommendationsService.getContextualRecommendations(userId, context);
    const elementRec = recs.find(r => r.metadata?.targetElement === element);
    
    if (elementRec) {
      setRecommendation(elementRec);
      setShowTip(true);
    }
  };

  if (!showTip || !recommendation) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      
      {/* Smart Tooltip */}
      <div className="absolute top-full left-0 mt-2 z-50 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-3 w-3 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              💡 Dica Inteligente
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {recommendation.description}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  RecommendationsService.trackInteraction(userId, recommendation.id, 'clicked');
                  window.location.href = recommendation.actionUrl;
                }}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Explorar
              </button>
              <button
                onClick={() => {
                  RecommendationsService.trackInteraction(userId, recommendation.id, 'dismissed');
                  setShowTip(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## ✅ **CHECKLIST DE CONCLUSÃO**

### **Recommendation Engine**
- [ ] Algoritmos de ML implementados
- [ ] Análise de comportamento ativa
- [ ] Geração de recomendações funcionando
- [ ] Sistema de pontuação implementado
- [ ] Feedback loop ativo

### **Real-time Service**
- [ ] API de recomendações criada
- [ ] Cache Redis implementado
- [ ] Contexto em tempo real
- [ ] Tracking de interações
- [ ] WebSocket integration

### **UI Components**
- [ ] RecommendationCard component
- [ ] RecommendationCenter dashboard
- [ ] SmartTooltip sistema
- [ ] Feedback interface
- [ ] Mobile responsiveness

### **Analytics & Optimization**
- [ ] Métricas de performance
- [ ] A/B testing capability
- [ ] Success rate tracking
- [ ] User engagement analytics
- [ ] Recommendation effectiveness

### **Integration**
- [ ] Dify AI integration
- [ ] Ollama local processing
- [ ] Metabase analytics
- [ ] N8N workflow triggers
- [ ] Event system integration

---

**✅ PARTE 34 CONCLUÍDA - RECOMENDAÇÕES INTELIGENTES IMPLEMENTADAS**

*Próxima Parte: 35 - Auto-scaling baseado em IA*

---

*📅 Parte 34 de 50 - KRYONIX SaaS Platform*  
*🔧 Agentes: IA + Frontend + UX/UI + BI*  
*⏱️ Tempo Estimado: 3-4 dias*  
*🎯 Status: Pronto para Desenvolvimento*
