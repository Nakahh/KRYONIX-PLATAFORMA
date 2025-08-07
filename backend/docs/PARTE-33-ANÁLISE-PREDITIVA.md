# 🔮 PARTE 33 - ANÁLISE PREDITIVA
*Agentes Responsáveis: Especialista IA + Analista BI + Data Scientist + Backend*

---

## 🎯 **OBJETIVOS DA PARTE 33**
Implementar sistema avançado de análise preditiva utilizando machine learning para previsão de churn, receita, uso de recursos, detecção de anomalias e otimização automática da plataforma KRYONIX SaaS.

---

## 🛠️ **STACK TÉCNICA**
```yaml
IA Platform: Dify AI (dify.kryonix.com.br)
ML Engine: Ollama (ollama.kryonix.com.br)
Analytics: Metabase (metabase.kryonix.com.br)
Database: PostgreSQL + ClickHouse
Python: scikit-learn, pandas, numpy
Monitoring: Langfuse (para tracking IA)
```

---

## 👥 **AGENTES ESPECIALIZADOS ATUANDO**

### 🧠 **Especialista IA** - Líder da Parte
**Responsabilidades:**
- Algoritmos de machine learning
- Feature engineering
- Model training e validation
- ML pipeline automation

### 📊 **Analista BI**
**Responsabilidades:**
- Data analysis e insights
- Dashboard de predições
- KPIs e métricas
- Visualização de dados

### 🔬 **Data Scientist**
**Responsabilidades:**
- Statistical analysis
- Model selection
- Performance evaluation
- A/B testing

### 🏗️ **Backend Specialist**
**Responsabilidades:**
- API de predições
- Real-time inference
- Model serving
- Integration com Dify AI

---

## 📋 **MODELOS PREDITIVOS**

### **33.1 - User Churn Prediction**
```python
# src/ml/models/churn_prediction.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, precision_recall_curve
import joblib
from datetime import datetime, timedelta

class ChurnPredictionModel:
    def __init__(self):
        self.model = None
        self.feature_columns = [
            'days_since_last_login',
            'total_sessions',
            'avg_session_duration',
            'features_used_count',
            'support_tickets_count',
            'payment_delays_count',
            'login_frequency_trend',
            'feature_adoption_rate',
            'subscription_age_days',
            'last_payment_delay',
        ]
        
    def prepare_features(self, user_data: pd.DataFrame) -> pd.DataFrame:
        """Preparar features para predição de churn"""
        features = pd.DataFrame()
        
        # Dias desde último login
        features['days_since_last_login'] = (
            datetime.now() - user_data['last_login_date']
        ).dt.days
        
        # Total de sessões nos últimos 30 dias
        features['total_sessions'] = user_data['sessions_30d']
        
        # Duração média das sessões
        features['avg_session_duration'] = user_data['avg_session_duration_minutes']
        
        # Número de features diferentes utilizadas
        features['features_used_count'] = user_data['unique_features_used']
        
        # Tickets de suporte abertos
        features['support_tickets_count'] = user_data['support_tickets_30d']
        
        # Atrasos no pagamento
        features['payment_delays_count'] = user_data['payment_delays_count']
        
        # Tendência de frequência de login (últimos 7 vs 30 dias)
        features['login_frequency_trend'] = (
            user_data['logins_7d'] / 7
        ) / (user_data['logins_30d'] / 30)
        
        # Taxa de adoção de novas features
        features['feature_adoption_rate'] = user_data['new_features_adopted'] / user_data['new_features_available']
        
        # Idade da assinatura em dias
        features['subscription_age_days'] = (
            datetime.now() - user_data['subscription_start_date']
        ).dt.days
        
        # Dias desde último atraso no pagamento
        features['last_payment_delay'] = (
            datetime.now() - user_data['last_payment_delay_date']
        ).dt.days.fillna(9999)
        
        return features
    
    def train_model(self, training_data: pd.DataFrame):
        """Treinar modelo de predição de churn"""
        features = self.prepare_features(training_data)
        target = training_data['churned_30d']
        
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42, stratify=target
        )
        
        # Ensemble de modelos
        rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )
        
        gb_model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        # Treinar modelos
        rf_model.fit(X_train, y_train)
        gb_model.fit(X_train, y_train)
        
        # Avaliar performance
        rf_score = roc_auc_score(y_test, rf_model.predict_proba(X_test)[:, 1])
        gb_score = roc_auc_score(y_test, gb_model.predict_proba(X_test)[:, 1])
        
        # Escolher melhor modelo
        self.model = rf_model if rf_score > gb_score else gb_model
        
        print(f"Random Forest AUC: {rf_score:.3f}")
        print(f"Gradient Boosting AUC: {gb_score:.3f}")
        print(f"Modelo selecionado: {'Random Forest' if rf_score > gb_score else 'Gradient Boosting'}")
        
        # Salvar modelo
        self.save_model()
        
        return {
            'auc_score': max(rf_score, gb_score),
            'feature_importance': self.get_feature_importance(),
            'model_type': 'Random Forest' if rf_score > gb_score else 'Gradient Boosting'
        }
    
    def predict_churn_probability(self, user_data: pd.DataFrame) -> pd.DataFrame:
        """Predizer probabilidade de churn para usuários"""
        if self.model is None:
            self.load_model()
            
        features = self.prepare_features(user_data)
        probabilities = self.model.predict_proba(features)[:, 1]
        
        results = pd.DataFrame({
            'user_id': user_data['user_id'],
            'churn_probability': probabilities,
            'risk_level': pd.cut(probabilities, 
                               bins=[0, 0.3, 0.7, 1.0], 
                               labels=['Low', 'Medium', 'High']),
            'prediction_date': datetime.now()
        })
        
        return results
    
    def get_feature_importance(self) -> dict:
        """Obter importância das features"""
        if hasattr(self.model, 'feature_importances_'):
            importance_dict = dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
            return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        return {}
    
    def save_model(self, path: str = 'models/churn_prediction_model.pkl'):
        """Salvar modelo treinado"""
        joblib.dump(self.model, path)
        
    def load_model(self, path: str = 'models/churn_prediction_model.pkl'):
        """Carregar modelo salvo"""
        self.model = joblib.load(path)
```

### **33.2 - Revenue Forecasting**
```python
# src/ml/models/revenue_forecasting.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

class RevenueForecastingModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        
    def prepare_time_series_features(self, revenue_data: pd.DataFrame) -> pd.DataFrame:
        """Preparar features para forecasting de receita"""
        df = revenue_data.copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Features temporais
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['quarter'] = df['date'].dt.quarter
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Features de lag (valores passados)
        for lag in [1, 7, 30]:
            df[f'revenue_lag_{lag}'] = df['revenue'].shift(lag)
            
        # Médias móveis
        for window in [7, 30, 90]:
            df[f'revenue_ma_{window}'] = df['revenue'].rolling(window=window).mean()
            
        # Tendência linear
        df['trend'] = range(len(df))
        
        # Sazonalidade
        df['seasonal_monthly'] = np.sin(2 * np.pi * df['month'] / 12)
        df['seasonal_yearly'] = np.cos(2 * np.pi * df['month'] / 12)
        
        # Growth rate
        df['revenue_growth'] = df['revenue'].pct_change()
        df['revenue_growth_ma_7'] = df['revenue_growth'].rolling(window=7).mean()
        
        # Volatilidade
        df['revenue_volatility'] = df['revenue'].rolling(window=30).std()
        
        # Features de negócio
        df['new_customers'] = df.get('new_customers', 0)
        df['churned_customers'] = df.get('churned_customers', 0)
        df['active_customers'] = df.get('active_customers', 0)
        
        return df.dropna()
    
    def train_model(self, training_data: pd.DataFrame):
        """Treinar modelo de forecasting de receita"""
        df = self.prepare_time_series_features(training_data)
        
        feature_columns = [
            'year', 'month', 'day_of_week', 'quarter', 'is_weekend',
            'revenue_lag_1', 'revenue_lag_7', 'revenue_lag_30',
            'revenue_ma_7', 'revenue_ma_30', 'revenue_ma_90',
            'trend', 'seasonal_monthly', 'seasonal_yearly',
            'revenue_growth_ma_7', 'revenue_volatility',
            'new_customers', 'churned_customers', 'active_customers'
        ]
        
        X = df[feature_columns]
        y = df['revenue']
        
        # Split temporal (últimos 20% para teste)
        split_idx = int(len(df) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Testar diferentes modelos
        models = {
            'linear_regression': LinearRegression(),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
        }
        
        best_model = None
        best_mae = float('inf')
        
        for name, model in models.items():
            model.fit(X_train, y_train)
            predictions = model.predict(X_test)
            mae = mean_absolute_error(y_test, predictions)
            
            print(f"{name} MAE: {mae:.2f}")
            
            if mae < best_mae:
                best_mae = mae
                best_model = model
        
        self.model = best_model
        self.feature_columns = feature_columns
        
        return {
            'mae': best_mae,
            'rmse': np.sqrt(mean_squared_error(y_test, self.model.predict(X_test))),
            'model_type': type(self.model).__name__
        }
    
    def forecast_revenue(self, days_ahead: int = 30) -> pd.DataFrame:
        """Fazer previsão de receita para os próximos dias"""
        if self.model is None:
            raise ValueError("Model not trained. Call train_model first.")
        
        # Buscar dados históricos recentes
        recent_data = self.get_recent_revenue_data()
        
        forecasts = []
        last_date = recent_data['date'].max()
        
        for day in range(1, days_ahead + 1):
            forecast_date = last_date + pd.Timedelta(days=day)
            
            # Preparar features para previsão
            features = self.prepare_forecast_features(recent_data, forecast_date)
            
            # Fazer previsão
            prediction = self.model.predict(features.reshape(1, -1))[0]
            
            forecasts.append({
                'date': forecast_date,
                'predicted_revenue': max(0, prediction),  # Não permitir receita negativa
                'confidence_interval_lower': prediction * 0.9,
                'confidence_interval_upper': prediction * 1.1,
            })
        
        return pd.DataFrame(forecasts)
```

### **33.3 - Resource Usage Prediction**
```python
# src/ml/models/resource_prediction.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

class ResourceUsagePredictionModel:
    def __init__(self):
        self.cpu_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.memory_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.storage_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
    def prepare_resource_features(self, metrics_data: pd.DataFrame) -> pd.DataFrame:
        """Preparar features para predição de uso de recursos"""
        df = metrics_data.copy()
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Features temporais
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['is_business_hour'] = df['hour'].between(9, 17).astype(int)
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Lags para cada métrica
        resource_metrics = ['cpu_usage', 'memory_usage', 'storage_usage', 'active_users']
        
        for metric in resource_metrics:
            for lag in [1, 6, 12, 24]:  # 1h, 6h, 12h, 24h atrás
                df[f'{metric}_lag_{lag}'] = df[metric].shift(lag)
        
        # Médias móveis
        for metric in resource_metrics:
            for window in [6, 12, 24]:  # 6h, 12h, 24h
                df[f'{metric}_ma_{window}'] = df[metric].rolling(window=window).mean()
        
        # Tendências
        for metric in resource_metrics:
            df[f'{metric}_trend_6h'] = df[metric] - df[f'{metric}_lag_6']
            df[f'{metric}_trend_24h'] = df[metric] - df[f'{metric}_lag_24']
        
        # Picos de uso
        df['cpu_peak_indicator'] = (df['cpu_usage'] > df['cpu_usage_ma_24'] * 1.5).astype(int)
        df['memory_peak_indicator'] = (df['memory_usage'] > df['memory_usage_ma_24'] * 1.5).astype(int)
        
        return df.dropna()
    
    def train_models(self, training_data: pd.DataFrame):
        """Treinar modelos de predição de recursos"""
        df = self.prepare_resource_features(training_data)
        
        feature_columns = [col for col in df.columns if col not in [
            'timestamp', 'cpu_usage', 'memory_usage', 'storage_usage'
        ]]
        
        X = df[feature_columns]
        X_scaled = self.scaler.fit_transform(X)
        
        # Treinar modelo para CPU
        self.cpu_model.fit(X_scaled, df['cpu_usage'])
        
        # Treinar modelo para Memory
        self.memory_model.fit(X_scaled, df['memory_usage'])
        
        # Treinar modelo para Storage
        self.storage_model.fit(X_scaled, df['storage_usage'])
        
        self.feature_columns = feature_columns
        
        return {
            'cpu_score': self.cpu_model.score(X_scaled, df['cpu_usage']),
            'memory_score': self.memory_model.score(X_scaled, df['memory_usage']),
            'storage_score': self.storage_model.score(X_scaled, df['storage_usage']),
        }
    
    def predict_resource_usage(self, hours_ahead: int = 24) -> pd.DataFrame:
        """Predizer uso de recursos para as próximas horas"""
        current_data = self.get_current_metrics()
        
        predictions = []
        
        for hour in range(1, hours_ahead + 1):
            features = self.prepare_prediction_features(current_data, hour)
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            
            cpu_pred = self.cpu_model.predict(features_scaled)[0]
            memory_pred = self.memory_model.predict(features_scaled)[0]
            storage_pred = self.storage_model.predict(features_scaled)[0]
            
            predictions.append({
                'hours_ahead': hour,
                'predicted_cpu_usage': max(0, min(100, cpu_pred)),
                'predicted_memory_usage': max(0, min(100, memory_pred)),
                'predicted_storage_usage': max(0, storage_pred),
                'scaling_recommendation': self.get_scaling_recommendation(
                    cpu_pred, memory_pred, storage_pred
                )
            })
        
        return pd.DataFrame(predictions)
    
    def get_scaling_recommendation(self, cpu: float, memory: float, storage: float) -> str:
        """Recomendar ações de scaling baseado nas predições"""
        if cpu > 80 or memory > 80:
            return "SCALE_UP_URGENT"
        elif cpu > 70 or memory > 70:
            return "SCALE_UP_RECOMMENDED"
        elif cpu < 30 and memory < 30:
            return "SCALE_DOWN_POSSIBLE"
        else:
            return "MAINTAIN_CURRENT"
```

### **33.4 - Anomaly Detection System**
```python
# src/ml/models/anomaly_detection.py
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.covariance import EllipticEnvelope

class AnomalyDetectionSystem:
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.elliptic_envelope = EllipticEnvelope(contamination=0.1)
        self.scaler = StandardScaler()
        
    def prepare_anomaly_features(self, system_data: pd.DataFrame) -> pd.DataFrame:
        """Preparar features para detecção de anomalias"""
        df = system_data.copy()
        
        # Métricas de sistema
        features = [
            'cpu_usage', 'memory_usage', 'disk_usage',
            'network_in', 'network_out', 'active_connections',
            'response_time_avg', 'error_rate',
            'login_attempts', 'failed_logins',
            'api_calls_per_minute', 'database_connections'
        ]
        
        # Calcular z-scores para cada métrica
        for feature in features:
            if feature in df.columns:
                df[f'{feature}_zscore'] = (df[feature] - df[feature].mean()) / df[feature].std()
        
        # Ratios importantes
        df['memory_cpu_ratio'] = df['memory_usage'] / (df['cpu_usage'] + 1)
        df['error_success_ratio'] = df['error_rate'] / (1 - df['error_rate'] + 0.001)
        df['failed_total_login_ratio'] = df['failed_logins'] / (df['login_attempts'] + 1)
        
        return df[features + [f'{f}_zscore' for f in features if f in df.columns] + 
                 ['memory_cpu_ratio', 'error_success_ratio', 'failed_total_login_ratio']].fillna(0)
    
    def train_anomaly_models(self, training_data: pd.DataFrame):
        """Treinar modelos de detecção de anomalias"""
        features = self.prepare_anomaly_features(training_data)
        features_scaled = self.scaler.fit_transform(features)
        
        # Treinar Isolation Forest
        self.isolation_forest.fit(features_scaled)
        
        # Treinar Elliptic Envelope
        self.elliptic_envelope.fit(features_scaled)
        
        # Avaliar performance nos dados de treino
        iso_scores = self.isolation_forest.decision_function(features_scaled)
        ell_scores = self.elliptic_envelope.decision_function(features_scaled)
        
        return {
            'isolation_forest_anomalies': np.sum(self.isolation_forest.predict(features_scaled) == -1),
            'elliptic_envelope_anomalies': np.sum(self.elliptic_envelope.predict(features_scaled) == -1),
            'total_samples': len(features_scaled)
        }
    
    def detect_anomalies(self, current_data: pd.DataFrame) -> pd.DataFrame:
        """Detectar anomalias nos dados atuais"""
        features = self.prepare_anomaly_features(current_data)
        features_scaled = self.scaler.transform(features)
        
        # Predições dos modelos
        iso_predictions = self.isolation_forest.predict(features_scaled)
        iso_scores = self.isolation_forest.decision_function(features_scaled)
        
        ell_predictions = self.elliptic_envelope.predict(features_scaled)
        ell_scores = self.elliptic_envelope.decision_function(features_scaled)
        
        # Combinar resultados
        results = pd.DataFrame({
            'timestamp': current_data.get('timestamp', pd.Timestamp.now()),
            'isolation_forest_anomaly': iso_predictions == -1,
            'isolation_forest_score': iso_scores,
            'elliptic_envelope_anomaly': ell_predictions == -1,
            'elliptic_envelope_score': ell_scores,
            'combined_anomaly': (iso_predictions == -1) | (ell_predictions == -1),
            'anomaly_severity': self.calculate_severity(iso_scores, ell_scores),
        })
        
        # Identificar tipo de anomalia
        results['anomaly_type'] = results.apply(
            lambda row: self.classify_anomaly_type(row, features), axis=1
        )
        
        return results
    
    def calculate_severity(self, iso_scores: np.ndarray, ell_scores: np.ndarray) -> np.ndarray:
        """Calcular severidade da anomalia"""
        # Normalizar scores para 0-1
        iso_norm = (iso_scores - iso_scores.min()) / (iso_scores.max() - iso_scores.min() + 1e-8)
        ell_norm = (ell_scores - ell_scores.min()) / (ell_scores.max() - ell_scores.min() + 1e-8)
        
        # Combinar scores
        combined_score = (iso_norm + ell_norm) / 2
        
        # Classificar severidade
        severity = np.where(combined_score > 0.8, 'CRITICAL',
                   np.where(combined_score > 0.6, 'HIGH',
                   np.where(combined_score > 0.4, 'MEDIUM', 'LOW')))
        
        return severity
    
    def classify_anomaly_type(self, row: pd.Series, features: pd.DataFrame) -> str:
        """Classificar tipo de anomalia baseado nas features"""
        if not (row['isolation_forest_anomaly'] or row['elliptic_envelope_anomaly']):
            return 'NORMAL'
        
        # Identificar qual métrica está mais anômala
        feature_values = features.iloc[row.name] if hasattr(row, 'name') else features.iloc[0]
        
        if feature_values['cpu_usage'] > 90:
            return 'CPU_SPIKE'
        elif feature_values['memory_usage'] > 90:
            return 'MEMORY_SPIKE'
        elif feature_values['error_rate'] > 0.1:
            return 'ERROR_SPIKE'
        elif feature_values['failed_logins'] > feature_values['login_attempts'] * 0.5:
            return 'SECURITY_THREAT'
        elif feature_values['response_time_avg'] > 5000:
            return 'PERFORMANCE_DEGRADATION'
        else:
            return 'UNKNOWN_ANOMALY'
```

---

## 🖥️ **API DE PREDIÇÕES**

### **33.5 - Predictions API Service**
```typescript
// src/services/PredictionsService.ts
import { spawn } from 'child_process';
import RedisService from './RedisService';

interface PredictionResult {
  model: string;
  prediction: any;
  confidence: number;
  timestamp: Date;
  features_used: string[];
}

export class PredictionsService {
  // Predição de Churn
  static async predictUserChurn(userId: string): Promise<PredictionResult> {
    const cacheKey = `prediction:churn:${userId}`;
    
    // Verificar cache (válido por 24h)
    const cached = await RedisService.getJSON<PredictionResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Executar modelo Python
    const result = await this.executePythonModel('churn_prediction', { userId });
    
    const prediction: PredictionResult = {
      model: 'churn_prediction',
      prediction: {
        churn_probability: result.churn_probability,
        risk_level: result.risk_level,
        main_factors: result.feature_importance,
        recommended_actions: this.getChurnRecommendations(result.churn_probability)
      },
      confidence: result.confidence,
      timestamp: new Date(),
      features_used: result.features_used
    };

    // Cache por 24 horas
    await RedisService.setJSON(cacheKey, prediction, 24 * 60 * 60);
    
    return prediction;
  }

  // Previsão de Receita
  static async forecastRevenue(daysAhead: number = 30): Promise<PredictionResult> {
    const cacheKey = `prediction:revenue:${daysAhead}d`;
    
    const cached = await RedisService.getJSON<PredictionResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.executePythonModel('revenue_forecasting', { daysAhead });
    
    const prediction: PredictionResult = {
      model: 'revenue_forecasting',
      prediction: {
        forecasts: result.forecasts,
        total_predicted_revenue: result.total_predicted_revenue,
        growth_rate: result.growth_rate,
        confidence_intervals: result.confidence_intervals
      },
      confidence: result.confidence,
      timestamp: new Date(),
      features_used: result.features_used
    };

    // Cache por 6 horas
    await RedisService.setJSON(cacheKey, prediction, 6 * 60 * 60);
    
    return prediction;
  }

  // Predição de Uso de Recursos
  static async predictResourceUsage(hoursAhead: number = 24): Promise<PredictionResult> {
    const cacheKey = `prediction:resources:${hoursAhead}h`;
    
    const cached = await RedisService.getJSON<PredictionResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.executePythonModel('resource_prediction', { hoursAhead });
    
    const prediction: PredictionResult = {
      model: 'resource_prediction',
      prediction: {
        cpu_forecast: result.cpu_forecast,
        memory_forecast: result.memory_forecast,
        storage_forecast: result.storage_forecast,
        scaling_recommendations: result.scaling_recommendations,
        cost_optimization: result.cost_optimization
      },
      confidence: result.confidence,
      timestamp: new Date(),
      features_used: result.features_used
    };

    // Cache por 1 hora
    await RedisService.setJSON(cacheKey, prediction, 60 * 60);
    
    return prediction;
  }

  // Detecção de Anomalias
  static async detectAnomalies(): Promise<PredictionResult> {
    const result = await this.executePythonModel('anomaly_detection', {});
    
    const prediction: PredictionResult = {
      model: 'anomaly_detection',
      prediction: {
        anomalies_detected: result.anomalies,
        severity_levels: result.severity_levels,
        anomaly_types: result.anomaly_types,
        immediate_actions: result.immediate_actions
      },
      confidence: result.confidence,
      timestamp: new Date(),
      features_used: result.features_used
    };

    // Não fazer cache de anomalias (sempre tempo real)
    return prediction;
  }

  // Executar modelo Python
  private static async executePythonModel(modelName: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        `src/ml/models/${modelName}.py`,
        JSON.stringify(params)
      ]);

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            reject(new Error(`Invalid JSON output: ${output}`));
          }
        } else {
          reject(new Error(`Python process failed: ${error}`));
        }
      });
    });
  }

  // Recomendações para reduzir churn
  private static getChurnRecommendations(churnProbability: number): string[] {
    if (churnProbability > 0.8) {
      return [
        'Contato imediato do success team',
        'Oferecer desconto ou upgrade gratuito',
        'Agendar call de retenção',
        'Ativar campanhas de engajamento'
      ];
    } else if (churnProbability > 0.5) {
      return [
        'Enviar email com dicas de uso',
        'Ofertar treinamento personalizado',
        'Ativar onboarding avançado',
        'Acompanhar métricas de engajamento'
      ];
    } else if (churnProbability > 0.3) {
      return [
        'Incentivar uso de novas features',
        'Enviar newsletter educativa',
        'Acompanhar satisfação'
      ];
    } else {
      return [
        'Usuário saudável',
        'Considerar para programa de embaixadores'
      ];
    }
  }
}
```

---

## 📊 **DASHBOARD DE PREDIÇÕES**

### **33.6 - Predictions Dashboard Component**
```tsx
// src/components/PredictionsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign } from 'lucide-react';

interface PredictionData {
  churn: any;
  revenue: any;
  resources: any;
  anomalies: any;
}

export const PredictionsDashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPredictions();
    
    // Atualizar a cada 30 minutos
    const interval = setInterval(loadPredictions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPredictions = async () => {
    try {
      const response = await fetch('/api/predictions/dashboard');
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error('Erro ao carregar predições:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando predições...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">🔮 Análise Preditiva</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('churn')}
            className={`px-4 py-2 rounded ${activeTab === 'churn' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Churn
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded ${activeTab === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Receita
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded ${activeTab === 'resources' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Recursos
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Churn Risk */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-red-100">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Risco de Churn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {predictions?.churn?.high_risk_users || 0}
                  </p>
                  <p className="text-xs text-red-600">usuários em risco alto</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Forecast */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Prevista (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {predictions?.revenue?.next_30_days?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-green-600">
                    {predictions?.revenue?.growth_rate > 0 ? '+' : ''}
                    {predictions?.revenue?.growth_rate?.toFixed(1) || '0'}% vs mês anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CPU Previsto (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {predictions?.resources?.peak_cpu?.toFixed(1) || '0'}%
                  </p>
                  <p className="text-xs text-blue-600">pico esperado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-yellow-100">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Anomalias (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {predictions?.anomalies?.total_count || 0}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {predictions?.anomalies?.critical_count || 0} críticas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Forecast Chart */}
      {activeTab === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle>📈 Previsão de Receita - Próximos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={predictions?.revenue?.daily_forecasts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                <Line type="monotone" dataKey="predicted_revenue" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="confidence_upper" stroke="#93C5FD" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="confidence_lower" stroke="#93C5FD" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Churn Analysis */}
      {activeTab === 'churn' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🚨 Usuários em Risco de Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions?.churn?.high_risk_users_list?.map((user: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-bold">{(user.churn_probability * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">risco de churn</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Ações Recomendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions?.churn?.recommended_actions?.map((action: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Usage Forecast */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>💻 Previsão de Uso de CPU</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictions?.resources?.cpu_forecast || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'CPU']} />
                  <Line type="monotone" dataKey="predicted_cpu" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧠 Previsão de Uso de Memória</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictions?.resources?.memory_forecast || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Memória']} />
                  <Line type="monotone" dataKey="predicted_memory" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
```

---

## ✅ **CHECKLIST DE CONCLUSÃO**

### **Modelos de Machine Learning**
- [ ] Churn prediction model treinado
- [ ] Revenue forecasting implementado
- [ ] Resource usage prediction ativo
- [ ] Anomaly detection funcionando
- [ ] Model validation e testing

### **API de Predições**
- [ ] Endpoints de predição criados
- [ ] Cache de resultados implementado
- [ ] Error handling robusto
- [ ] Rate limiting aplicado
- [ ] Logging de predições

### **Dashboard de Análise Preditiva**
- [ ] Interface de visualização criada
- [ ] Gráficos interativos implementados
- [ ] Real-time updates funcionando
- [ ] Export de relatórios
- [ ] Mobile responsiveness

### **Automação e Alertas**
- [ ] Alertas automáticos de churn
- [ ] Notificações de anomalias
- [ ] Recomendações automáticas
- [ ] Integration com N8N
- [ ] Action triggers implementados

### **Monitoramento**
- [ ] Model performance tracking
- [ ] Accuracy monitoring
- [ ] Drift detection
- [ ] Auto-retraining pipeline
- [ ] Langfuse integration ativa

---

**✅ PARTE 33 CONCLUÍDA - ANÁLISE PREDITIVA IMPLEMENTADA**

*Próxima Parte: 34 - Recomendações Inteligentes*

---

*📅 Parte 33 de 50 - KRYONIX SaaS Platform*  
*🔧 Agentes: IA + BI + Data Science + Backend*  
*⏱️ Tempo Estimado: 4-5 dias*  
*🎯 Status: Pronto para Desenvolvimento*
