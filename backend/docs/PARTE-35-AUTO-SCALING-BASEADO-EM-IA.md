# 🎯 PARTE 35 - AUTO-SCALING BASEADO EM IA
*Agentes Responsáveis: Especialista IA + Performance + DevOps + Arquiteto Software*

---

## 🎯 **OBJETIVOS DA PARTE 35**
Implementar sistema inteligente de auto-scaling que utiliza IA para prever demanda, otimizar recursos automaticamente, reduzir custos e garantir performance máxima da plataforma KRYONIX SaaS.

---

## 🛠️ **STACK TÉCNICA**
```yaml
IA Prediction: Dify AI + Ollama + Python ML
Orchestration: Docker Swarm + Portainer API
Monitoring: Prometheus + Grafana + cAdvisor
Cache: Redis para decisões rápidas
Database: PostgreSQL para histórico
Notification: N8N + WhatsApp + Email
```

---

## 👥 **AGENTES ESPECIALIZADOS ATUANDO**

### 🧠 **Especialista IA** - Líder da Parte
**Responsabilidades:**
- Algoritmos de predição de carga
- Machine learning para otimização
- Anomaly detection
- Predictive scaling decisions

### ⚡ **Performance Expert**
**Responsabilidades:**
- Métricas de performance
- Bottleneck detection
- Resource optimization
- Load balancing strategies

### 🔧 **DevOps Expert**
**Responsabilidades:**
- Docker Swarm orchestration
- Portainer API integration
- Infrastructure automation
- Deployment strategies

### 🏗️ **Arquiteto Software**
**Responsabilidades:**
- Scaling architecture design
- Service mesh configuration
- Microservices optimization
- System resilience

---

## 📋 **SISTEMA DE AUTO-SCALING INTELIGENTE**

### **35.1 - AI Scaling Predictor**
```python
# src/ml/scaling_predictor.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import joblib
import logging

class IntelligentScalingPredictor:
    def __init__(self):
        self.cpu_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.memory_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.request_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
        self.feature_columns = [
            'hour_of_day', 'day_of_week', 'day_of_month', 'month',
            'is_weekend', 'is_business_hour', 'is_holiday',
            'cpu_usage_current', 'memory_usage_current', 'requests_per_minute',
            'active_users', 'concurrent_sessions',
            'cpu_trend_1h', 'memory_trend_1h', 'request_trend_1h',
            'cpu_ma_6h', 'memory_ma_6h', 'requests_ma_6h',
            'historical_peak_factor', 'seasonal_factor'
        ]
        
    def prepare_features(self, metrics_data: pd.DataFrame) -> pd.DataFrame:
        """Preparar features para predição de scaling"""
        df = metrics_data.copy()
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Features temporais
        df['hour_of_day'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['day_of_month'] = df['timestamp'].dt.day
        df['month'] = df['timestamp'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_business_hour'] = df['hour_of_day'].between(9, 17).astype(int)
        
        # Identificar feriados (simplificado)
        holidays = ['2025-01-01', '2025-04-21', '2025-09-07', '2025-12-25']
        df['is_holiday'] = df['timestamp'].dt.date.astype(str).isin(holidays).astype(int)
        
        # Métricas atuais
        df['cpu_usage_current'] = df['cpu_usage']
        df['memory_usage_current'] = df['memory_usage']
        df['requests_per_minute'] = df['total_requests'] / df['active_users'].clip(lower=1)
        
        # Tendências (última hora)
        for metric in ['cpu_usage', 'memory_usage', 'total_requests']:
            df[f'{metric.split("_")[0]}_trend_1h'] = (
                df[metric] - df[metric].shift(12)  # 12 períodos de 5min = 1h
            ).fillna(0)
        
        # Médias móveis (6 horas)
        for metric in ['cpu_usage', 'memory_usage', 'total_requests']:
            df[f'{metric.split("_")[0]}_ma_6h'] = (
                df[metric].rolling(window=72).mean()  # 72 períodos de 5min = 6h
            ).fillna(df[metric])
        
        # Fator de pico histórico (baseado no mesmo período em dias anteriores)
        df['historical_peak_factor'] = self.calculate_historical_peak_factor(df)
        
        # Fator sazonal (baseado em padrões mensais/semanais)
        df['seasonal_factor'] = self.calculate_seasonal_factor(df)
        
        return df[self.feature_columns].fillna(0)
    
    def calculate_historical_peak_factor(self, df: pd.DataFrame) -> pd.Series:
        """Calcular fator baseado em picos históricos"""
        peak_factors = []
        
        for i, row in df.iterrows():
            # Buscar mesmo horário em dias anteriores
            same_hour_data = df[
                (df['hour_of_day'] == row['hour_of_day']) &
                (df['day_of_week'] == row['day_of_week']) &
                (df.index < i)
            ]
            
            if len(same_hour_data) > 0:
                avg_historical = same_hour_data[['cpu_usage', 'memory_usage']].mean().mean()
                current_avg = (row['cpu_usage'] + row['memory_usage']) / 2
                factor = current_avg / (avg_historical + 1e-6)
            else:
                factor = 1.0
            
            peak_factors.append(factor)
        
        return pd.Series(peak_factors, index=df.index)
    
    def calculate_seasonal_factor(self, df: pd.DataFrame) -> pd.Series:
        """Calcular fator sazonal baseado em padrões"""
        # Fatores pré-definidos baseados em padrões conhecidos
        seasonal_factors = []
        
        for _, row in df.iterrows():
            factor = 1.0
            
            # Fator hora do dia
            if 9 <= row['hour_of_day'] <= 17:  # Horário comercial
                factor *= 1.3
            elif 18 <= row['hour_of_day'] <= 22:  # Pico noturno
                factor *= 1.1
            else:  # Madrugada
                factor *= 0.7
            
            # Fator dia da semana
            if row['day_of_week'] in [0, 1, 2, 3, 4]:  # Segunda a sexta
                factor *= 1.2
            elif row['day_of_week'] == 6:  # Sábado
                factor *= 0.9
            else:  # Domingo
                factor *= 0.6
            
            # Fator mês (sazonalidade anual)
            if row['month'] in [1, 12]:  # Início/fim de ano
                factor *= 0.8
            elif row['month'] in [3, 4, 9, 10]:  # Meses de alta atividade
                factor *= 1.2
            
            seasonal_factors.append(factor)
        
        return pd.Series(seasonal_factors)
    
    def train_models(self, training_data: pd.DataFrame) -> dict:
        """Treinar modelos de predição"""
        features = self.prepare_features(training_data)
        
        # Targets (valores 30 minutos à frente)
        cpu_target = training_data['cpu_usage'].shift(-6).fillna(training_data['cpu_usage'])
        memory_target = training_data['memory_usage'].shift(-6).fillna(training_data['memory_usage'])
        request_target = training_data['total_requests'].shift(-6).fillna(training_data['total_requests'])
        
        # Limpar dados
        valid_indices = features.notna().all(axis=1)
        features_clean = features[valid_indices]
        cpu_clean = cpu_target[valid_indices]
        memory_clean = memory_target[valid_indices]
        request_clean = request_target[valid_indices]
        
        # Scaling
        features_scaled = self.scaler.fit_transform(features_clean)
        
        # Dividir dados
        X_train, X_test, y_cpu_train, y_cpu_test = train_test_split(
            features_scaled, cpu_clean, test_size=0.2, random_state=42
        )
        _, _, y_mem_train, y_mem_test = train_test_split(
            features_scaled, memory_clean, test_size=0.2, random_state=42
        )
        _, _, y_req_train, y_req_test = train_test_split(
            features_scaled, request_clean, test_size=0.2, random_state=42
        )
        
        # Treinar modelos
        self.cpu_model.fit(X_train, y_cpu_train)
        self.memory_model.fit(X_train, y_mem_train)
        self.request_model.fit(X_train, y_req_train)
        
        # Avaliar performance
        cpu_score = self.cpu_model.score(X_test, y_cpu_test)
        memory_score = self.memory_model.score(X_test, y_mem_test)
        request_score = self.request_model.score(X_test, y_req_test)
        
        # Salvar modelos
        self.save_models()
        
        return {
            'cpu_model_score': cpu_score,
            'memory_model_score': memory_score,
            'request_model_score': request_score,
            'training_samples': len(X_train),
            'feature_importance': self.get_feature_importance()
        }
    
    def predict_resource_needs(self, current_metrics: pd.DataFrame, hours_ahead: int = 2) -> dict:
        """Predizer necessidades de recursos"""
        predictions = []
        
        for hour in range(1, hours_ahead + 1):
            # Simular timestamp futuro
            future_time = datetime.now() + timedelta(hours=hour)
            
            # Preparar features para predição
            future_features = self.prepare_future_features(current_metrics, future_time)
            future_scaled = self.scaler.transform([future_features])
            
            # Fazer predições
            cpu_pred = self.cpu_model.predict(future_scaled)[0]
            memory_pred = self.memory_model.predict(future_scaled)[0]
            request_pred = self.request_model.predict(future_scaled)[0]
            
            # Calcular recomendações de scaling
            scaling_decision = self.calculate_scaling_decision(
                cpu_pred, memory_pred, request_pred, current_metrics
            )
            
            predictions.append({
                'hour_ahead': hour,
                'predicted_cpu': max(0, min(100, cpu_pred)),
                'predicted_memory': max(0, min(100, memory_pred)),
                'predicted_requests': max(0, request_pred),
                'scaling_decision': scaling_decision,
                'confidence': self.calculate_prediction_confidence(
                    cpu_pred, memory_pred, request_pred
                )
            })
        
        return {
            'predictions': predictions,
            'overall_recommendation': self.get_overall_recommendation(predictions),
            'cost_optimization': self.calculate_cost_optimization(predictions),
            'risk_assessment': self.assess_scaling_risks(predictions)
        }
    
    def calculate_scaling_decision(self, cpu_pred: float, memory_pred: float, 
                                 request_pred: float, current_metrics: pd.DataFrame) -> dict:
        """Calcular decisão de scaling baseada nas predições"""
        current_cpu = current_metrics['cpu_usage'].iloc[-1]
        current_memory = current_metrics['memory_usage'].iloc[-1]
        current_replicas = current_metrics.get('replica_count', pd.Series([1])).iloc[-1]
        
        decision = {
            'action': 'maintain',
            'target_replicas': current_replicas,
            'reasoning': [],
            'priority': 'low'
        }
        
        # Regras de scaling up
        if cpu_pred > 80 or memory_pred > 80:
            scale_factor = max(cpu_pred / 70, memory_pred / 70)
            new_replicas = min(10, int(current_replicas * scale_factor))
            
            decision.update({
                'action': 'scale_up',
                'target_replicas': new_replicas,
                'priority': 'high' if max(cpu_pred, memory_pred) > 90 else 'medium'
            })
            
            if cpu_pred > 80:
                decision['reasoning'].append(f'CPU previsto: {cpu_pred:.1f}%')
            if memory_pred > 80:
                decision['reasoning'].append(f'Memória prevista: {memory_pred:.1f}%')
        
        # Regras de scaling down
        elif cpu_pred < 30 and memory_pred < 30 and current_replicas > 1:
            new_replicas = max(1, int(current_replicas * 0.7))
            
            decision.update({
                'action': 'scale_down',
                'target_replicas': new_replicas,
                'priority': 'low'
            })
            decision['reasoning'].append('Recursos subutilizados')
        
        # Scaling baseado em requests
        if request_pred > current_metrics['total_requests'].iloc[-1] * 2:
            decision.update({
                'action': 'scale_up',
                'target_replicas': min(10, current_replicas + 2),
                'priority': 'high'
            })
            decision['reasoning'].append('Pico de requisições previsto')
        
        return decision
    
    def get_feature_importance(self) -> dict:
        """Obter importância das features"""
        feature_importance = {}
        
        if hasattr(self.cpu_model, 'feature_importances_'):
            cpu_importance = dict(zip(self.feature_columns, self.cpu_model.feature_importances_))
            memory_importance = dict(zip(self.feature_columns, self.memory_model.feature_importances_))
            request_importance = dict(zip(self.feature_columns, self.request_model.feature_importances_))
            
            # Média das importâncias
            for feature in self.feature_columns:
                avg_importance = (
                    cpu_importance[feature] + 
                    memory_importance[feature] + 
                    request_importance[feature]
                ) / 3
                feature_importance[feature] = avg_importance
        
        return dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))
    
    def save_models(self, path_prefix: str = 'models/scaling'):
        """Salvar modelos treinados"""
        joblib.dump(self.cpu_model, f'{path_prefix}_cpu_model.pkl')
        joblib.dump(self.memory_model, f'{path_prefix}_memory_model.pkl')
        joblib.dump(self.request_model, f'{path_prefix}_request_model.pkl')
        joblib.dump(self.scaler, f'{path_prefix}_scaler.pkl')
    
    def load_models(self, path_prefix: str = 'models/scaling'):
        """Carregar modelos salvos"""
        self.cpu_model = joblib.load(f'{path_prefix}_cpu_model.pkl')
        self.memory_model = joblib.load(f'{path_prefix}_memory_model.pkl')
        self.request_model = joblib.load(f'{path_prefix}_request_model.pkl')
        self.scaler = joblib.load(f'{path_prefix}_scaler.pkl')

class AutoScalingOrchestrator:
    def __init__(self):
        self.predictor = IntelligentScalingPredictor()
        self.min_replicas = 1
        self.max_replicas = 10
        self.scaling_cooldown = 300  # 5 minutos
        self.last_scaling_action = {}
        
    def execute_scaling_decision(self, service_name: str, decision: dict) -> dict:
        """Executar decisão de scaling via Portainer API"""
        if not self.should_scale(service_name, decision):
            return {'status': 'skipped', 'reason': 'Cooldown period active'}
        
        try:
            current_time = datetime.now()
            
            if decision['action'] == 'scale_up':
                result = self.scale_service_up(service_name, decision['target_replicas'])
            elif decision['action'] == 'scale_down':
                result = self.scale_service_down(service_name, decision['target_replicas'])
            else:
                return {'status': 'no_action', 'reason': 'Maintain current state'}
            
            # Registrar ação
            self.last_scaling_action[service_name] = {
                'timestamp': current_time,
                'action': decision['action'],
                'replicas': decision['target_replicas'],
                'reasoning': decision['reasoning']
            }
            
            # Notificar sobre scaling
            self.notify_scaling_action(service_name, decision, result)
            
            return result
            
        except Exception as e:
            logging.error(f"Scaling failed for {service_name}: {str(e)}")
            return {'status': 'error', 'error': str(e)}
    
    def should_scale(self, service_name: str, decision: dict) -> bool:
        """Verificar se deve executar scaling (cooldown, etc.)"""
        if service_name not in self.last_scaling_action:
            return True
        
        last_action = self.last_scaling_action[service_name]
        time_since_last = (datetime.now() - last_action['timestamp']).total_seconds()
        
        # Cooldown period
        if time_since_last < self.scaling_cooldown:
            return False
        
        # Evitar oscilações (scale up -> scale down muito rápido)
        if (last_action['action'] == 'scale_up' and decision['action'] == 'scale_down') or \
           (last_action['action'] == 'scale_down' and decision['action'] == 'scale_up'):
            if time_since_last < self.scaling_cooldown * 2:
                return False
        
        return True
```

### **35.2 - Portainer Integration Service**
```typescript
// src/services/AutoScalingService.ts
import axios from 'axios';
import RedisService from './RedisService';
import { EventService } from './EventService';

interface ServiceMetrics {
  serviceName: string;
  currentReplicas: number;
  cpuUsage: number;
  memoryUsage: number;
  requestRate: number;
  responseTime: number;
  errorRate: number;
}

interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'maintain';
  targetReplicas: number;
  reasoning: string[];
  priority: 'low' | 'medium' | 'high';
  confidence: number;
}

export class AutoScalingService {
  private static readonly PORTAINER_URL = process.env.PORTAINER_URL || 'https://painel.kryonix.com.br';
  private static readonly PORTAINER_TOKEN = process.env.PORTAINER_TOKEN;
  private static readonly SWARM_ID = process.env.SWARM_ID || '1';

  // Coletar métricas atuais de todos os serviços
  static async collectCurrentMetrics(): Promise<ServiceMetrics[]> {
    try {
      const services = await this.getDockerServices();
      const metrics: ServiceMetrics[] = [];

      for (const service of services) {
        const serviceMetrics = await this.getServiceMetrics(service.ID);
        metrics.push(serviceMetrics);
      }

      return metrics;
    } catch (error) {
      console.error('Error collecting metrics:', error);
      throw error;
    }
  }

  // Obter serviços do Docker Swarm via Portainer
  private static async getDockerServices(): Promise<any[]> {
    const response = await axios.get(
      `${this.PORTAINER_URL}/api/endpoints/${this.SWARM_ID}/docker/services`,
      {
        headers: {
          'X-API-Key': this.PORTAINER_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.filter((service: any) => 
      service.Spec?.Labels?.['kryonix.auto-scaling'] === 'enabled'
    );
  }

  // Obter métricas específicas de um serviço
  private static async getServiceMetrics(serviceId: string): Promise<ServiceMetrics> {
    // Obter dados do Prometheus
    const prometheusMetrics = await this.getPrometheusMetrics(serviceId);
    
    // Obter informações do serviço via Portainer
    const serviceInfo = await this.getServiceInfo(serviceId);

    return {
      serviceName: serviceInfo.Spec.Name,
      currentReplicas: serviceInfo.Spec.Mode.Replicated?.Replicas || 1,
      cpuUsage: prometheusMetrics.cpu || 0,
      memoryUsage: prometheusMetrics.memory || 0,
      requestRate: prometheusMetrics.requestRate || 0,
      responseTime: prometheusMetrics.responseTime || 0,
      errorRate: prometheusMetrics.errorRate || 0,
    };
  }

  // Obter métricas do Prometheus
  private static async getPrometheusMetrics(serviceId: string): Promise<any> {
    const prometheusUrl = 'https://prometheus.kryonix.com.br';
    
    try {
      const queries = {
        cpu: `rate(container_cpu_usage_seconds_total{container_label_com_docker_swarm_service_id="${serviceId}"}[5m]) * 100`,
        memory: `container_memory_usage_bytes{container_label_com_docker_swarm_service_id="${serviceId}"} / container_spec_memory_limit_bytes * 100`,
        requestRate: `rate(http_requests_total{service="${serviceId}"}[5m])`,
        responseTime: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="${serviceId}"}[5m])) * 1000`,
        errorRate: `rate(http_requests_total{service="${serviceId}",status=~"5.."}[5m]) / rate(http_requests_total{service="${serviceId}"}[5m]) * 100`,
      };

      const results: any = {};

      for (const [metric, query] of Object.entries(queries)) {
        const response = await axios.get(`${prometheusUrl}/api/v1/query`, {
          params: { query }
        });

        const data = response.data?.data?.result;
        results[metric] = data?.[0]?.value?.[1] ? parseFloat(data[0].value[1]) : 0;
      }

      return results;
    } catch (error) {
      console.error('Error fetching Prometheus metrics:', error);
      return { cpu: 0, memory: 0, requestRate: 0, responseTime: 0, errorRate: 0 };
    }
  }

  // Obter informações do serviço via Portainer
  private static async getServiceInfo(serviceId: string): Promise<any> {
    const response = await axios.get(
      `${this.PORTAINER_URL}/api/endpoints/${this.SWARM_ID}/docker/services/${serviceId}`,
      {
        headers: {
          'X-API-Key': this.PORTAINER_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  // Executar predição via Python ML
  static async getPredictions(metrics: ServiceMetrics[]): Promise<any> {
    try {
      const response = await axios.post('/api/ml/scaling-predictions', {
        metrics,
        hoursAhead: 2
      });

      return response.data;
    } catch (error) {
      console.error('Error getting predictions:', error);
      throw error;
    }
  }

  // Executar scaling de serviço
  static async scaleService(
    serviceId: string,
    targetReplicas: number,
    reasoning: string[]
  ): Promise<any> {
    try {
      // Atualizar serviço via Portainer API
      const response = await axios.post(
        `${this.PORTAINER_URL}/api/endpoints/${this.SWARM_ID}/docker/services/${serviceId}/update`,
        {
          Mode: {
            Replicated: {
              Replicas: targetReplicas
            }
          }
        },
        {
          headers: {
            'X-API-Key': this.PORTAINER_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log da ação
      const logEntry = {
        serviceId,
        action: 'scale',
        targetReplicas,
        reasoning,
        timestamp: new Date(),
        success: response.status === 200
      };

      await this.logScalingAction(logEntry);

      // Notificar sobre scaling
      await this.notifyScalingAction(logEntry);

      return {
        success: true,
        serviceId,
        targetReplicas,
        reasoning
      };

    } catch (error) {
      console.error('Error scaling service:', error);
      
      const errorLog = {
        serviceId,
        action: 'scale_failed',
        targetReplicas,
        reasoning,
        error: error.message,
        timestamp: new Date(),
        success: false
      };

      await this.logScalingAction(errorLog);
      throw error;
    }
  }

  // Processo principal de auto-scaling
  static async runAutoScalingCycle(): Promise<void> {
    try {
      console.log('🤖 Iniciando ciclo de auto-scaling...');

      // 1. Coletar métricas atuais
      const currentMetrics = await this.collectCurrentMetrics();
      console.log(`📊 Coletadas métricas de ${currentMetrics.length} serviços`);

      // 2. Obter predições da IA
      const predictions = await this.getPredictions(currentMetrics);
      console.log('🔮 Predições obtidas da IA');

      // 3. Processar decisões para cada serviço
      for (const serviceMetrics of currentMetrics) {
        const servicePrediction = predictions.services.find(
          (p: any) => p.serviceName === serviceMetrics.serviceName
        );

        if (!servicePrediction) continue;

        const decision = servicePrediction.scalingDecision;

        // 4. Verificar se deve executar scaling
        if (await this.shouldExecuteScaling(serviceMetrics.serviceName, decision)) {
          console.log(`⚡ Executando scaling para ${serviceMetrics.serviceName}: ${decision.action}`);
          
          if (decision.action !== 'maintain') {
            await this.scaleService(
              serviceMetrics.serviceName,
              decision.targetReplicas,
              decision.reasoning
            );
          }
        }
      }

      // 5. Cache das métricas para próximo ciclo
      await RedisService.setJSON('auto-scaling:last-metrics', currentMetrics, 300);
      await RedisService.setJSON('auto-scaling:last-predictions', predictions, 300);

      console.log('✅ Ciclo de auto-scaling concluído');

    } catch (error) {
      console.error('❌ Erro no ciclo de auto-scaling:', error);
      
      // Notificar erro crítico
      await this.notifyScalingError(error);
    }
  }

  // Verificar se deve executar scaling (cooldown, etc.)
  private static async shouldExecuteScaling(
    serviceName: string,
    decision: ScalingDecision
  ): Promise<boolean> {
    const cooldownKey = `auto-scaling:cooldown:${serviceName}`;
    const lastAction = await RedisService.get(cooldownKey);

    if (lastAction) {
      console.log(`⏳ Serviço ${serviceName} em cooldown`);
      return false;
    }

    // Definir cooldown baseado na prioridade
    const cooldownDuration = {
      low: 300,    // 5 minutos
      medium: 180, // 3 minutos
      high: 60     // 1 minuto
    }[decision.priority];

    await RedisService.set(cooldownKey, decision.action, cooldownDuration);

    return true;
  }

  // Log de ações de scaling
  private static async logScalingAction(logEntry: any): Promise<void> {
    // Salvar no PostgreSQL
    await fetch('/api/auto-scaling/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });

    // Cache para dashboard em tempo real
    const recentLogs = await RedisService.getJSON('auto-scaling:recent-logs') || [];
    recentLogs.unshift(logEntry);
    
    // Manter apenas últimas 50 ações
    if (recentLogs.length > 50) {
      recentLogs.splice(50);
    }

    await RedisService.setJSON('auto-scaling:recent-logs', recentLogs, 3600);
  }

  // Notificar sobre ações de scaling
  private static async notifyScalingAction(logEntry: any): Promise<void> {
    const message = `🤖 Auto-scaling: ${logEntry.action} para ${logEntry.serviceId}
📊 Réplicas: ${logEntry.targetReplicas}
🎯 Motivo: ${logEntry.reasoning.join(', ')}
⏰ ${new Date().toLocaleString('pt-BR')}`;

    // Notificar via WhatsApp (para admins)
    await EventService.publishGlobal({
      type: 'auto_scaling_action',
      data: {
        message,
        logEntry,
        severity: logEntry.success ? 'info' : 'error'
      }
    });
  }

  // Notificar erro crítico
  private static async notifyScalingError(error: Error): Promise<void> {
    const message = `🚨 ERRO CRÍTICO no Auto-scaling:
❌ ${error.message}
⏰ ${new Date().toLocaleString('pt-BR')}

Verifique os logs e a configuração do sistema.`;

    await EventService.publishGlobal({
      type: 'auto_scaling_error',
      data: {
        message,
        error: error.message,
        severity: 'critical'
      }
    });
  }

  // Iniciar processo contínuo de auto-scaling
  static startAutoScalingService(): void {
    console.log('🚀 Iniciando serviço de auto-scaling...');

    // Executar a cada 5 minutos
    const interval = 5 * 60 * 1000;
    
    setInterval(async () => {
      await this.runAutoScalingCycle();
    }, interval);

    // Executar primeira vez imediatamente
    this.runAutoScalingCycle();
  }

  // Obter status do auto-scaling
  static async getAutoScalingStatus(): Promise<any> {
    const [lastMetrics, lastPredictions, recentLogs] = await Promise.all([
      RedisService.getJSON('auto-scaling:last-metrics'),
      RedisService.getJSON('auto-scaling:last-predictions'),
      RedisService.getJSON('auto-scaling:recent-logs')
    ]);

    return {
      isActive: true,
      lastRun: lastMetrics ? new Date() : null,
      services: lastMetrics?.length || 0,
      recentActions: recentLogs?.length || 0,
      predictions: lastPredictions,
      metrics: lastMetrics,
      logs: recentLogs?.slice(0, 10) // Últimas 10 ações
    };
  }
}
```

### **35.3 - Auto-scaling Dashboard**
```tsx
// src/components/AutoScalingDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Server, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AutoScalingStatus {
  isActive: boolean;
  lastRun: Date;
  services: number;
  recentActions: number;
  predictions: any;
  metrics: any[];
  logs: any[];
}

export const AutoScalingDashboard: React.FC = () => {
  const [status, setStatus] = useState<AutoScalingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAutoScalingStatus();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadAutoScalingStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAutoScalingStatus = async () => {
    try {
      const response = await fetch('/api/auto-scaling/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoScaling = async () => {
    try {
      await fetch('/api/auto-scaling/toggle', { method: 'POST' });
      loadAutoScalingStatus();
    } catch (error) {
      console.error('Erro ao alterar auto-scaling:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-blue-600" />
          <h2 className="text-3xl font-bold">🤖 Auto-scaling Inteligente</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadAutoScalingStatus} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={toggleAutoScaling}
            variant={status?.isActive ? "destructive" : "default"}
          >
            {status?.isActive ? '⏸️ Pausar' : '▶️ Ativar'} Auto-scaling
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`rounded-full p-3 ${status?.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                {status?.isActive ? 
                  <CheckCircle className="h-6 w-6 text-green-600" /> :
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                }
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {status?.isActive ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-blue-100">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Serviços Monitorados</p>
                <p className="text-2xl font-bold text-gray-900">{status?.services || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ações Recentes</p>
                <p className="text-2xl font-bold text-gray-900">{status?.recentActions || 0}</p>
                <p className="text-xs text-gray-500">últimas 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Execução</p>
                <p className="text-sm font-bold text-gray-900">
                  {status?.lastRun ? new Date(status.lastRun).toLocaleTimeString('pt-BR') : 'Nunca'}
                </p>
                <p className="text-xs text-gray-500">próxima em ~5min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Visão Geral', icon: '📊' },
          { id: 'services', label: 'Serviços', icon: '🖥️' },
          { id: 'predictions', label: 'Predições', icon: '🔮' },
          { id: 'logs', label: 'Logs', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Prediction Chart */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Predição de CPU (Próximas 2h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={status?.predictions?.cpu_forecast || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'CPU']} />
                  <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="threshold" stroke="#EF4444" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Memory Prediction Chart */}
          <Card>
            <CardHeader>
              <CardTitle>🧠 Predição de Memória (Próximas 2h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={status?.predictions?.memory_forecast || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Memória']} />
                  <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="threshold" stroke="#EF4444" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {status?.metrics?.map((service: any, index: number) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {service.serviceName}
                  <Badge variant={service.currentReplicas > 1 ? 'default' : 'secondary'}>
                    {service.currentReplicas} réplicas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CPU</span>
                    <span className={`font-medium ${service.cpuUsage > 80 ? 'text-red-600' : 'text-green-600'}`}>
                      {service.cpuUsage?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memória</span>
                    <span className={`font-medium ${service.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'}`}>
                      {service.memoryUsage?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Req/min</span>
                    <span className="font-medium">{service.requestRate?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Resposta</span>
                    <span className="font-medium">{service.responseTime?.toFixed(0)}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Logs de Auto-scaling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status?.logs?.map((log: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    {log.action === 'scale_up' ? 
                      <TrendingUp className="h-4 w-4 text-green-600" /> :
                      log.action === 'scale_down' ?
                      <TrendingDown className="h-4 w-4 text-blue-600" /> :
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    }
                    <div>
                      <p className="font-medium">{log.serviceId}</p>
                      <p className="text-sm text-gray-600">
                        {log.action} → {log.targetReplicas} réplicas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </p>
                    <Badge variant={log.success ? 'default' : 'destructive'}>
                      {log.success ? 'Sucesso' : 'Erro'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

---

## ✅ **CHECKLIST DE CONCLUSÃO**

### **AI Prediction Engine**
- [ ] Modelos de ML treinados
- [ ] Feature engineering implementado
- [ ] Prediction accuracy > 85%
- [ ] Real-time inference ativo
- [ ] Model retraining pipeline

### **Portainer Integration**
- [ ] API integration funcionando
- [ ] Service scaling automático
- [ ] Docker Swarm orchestration
- [ ] Health checks implementados
- [ ] Error handling robusto

### **Monitoring & Metrics**
- [ ] Prometheus metrics collection
- [ ] Grafana dashboards criados
- [ ] Real-time metric processing
- [ ] Alert system funcionando
- [ ] Performance tracking ativo

### **Auto-scaling Logic**
- [ ] Intelligent scaling decisions
- [ ] Cooldown mechanisms
- [ ] Cost optimization active
- [ ] Risk assessment implemented
- [ ] Rollback capabilities

### **Dashboard & UI**
- [ ] Real-time dashboard criado
- [ ] Service monitoring interface
- [ ] Prediction visualization
- [ ] Log management system
- [ ] Admin controls funcionando

---

**✅ PARTE 35 CONCLUÍDA - AUTO-SCALING BASEADO EM IA IMPLEMENTADO**

*Próxima Parte: 36 - Evolution API (WhatsApp)*

---

*📅 Parte 35 de 50 - KRYONIX SaaS Platform*  
*🔧 Agentes: IA + Performance + DevOps + Arquiteto*  
*⏱️ Tempo Estimado: 4-5 dias*  
*🎯 Status: Pronto para Desenvolvimento*
