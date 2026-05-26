# api/ml_service.py
import numpy as np
import xgboost as xgb
import joblib
import os
from datetime import date
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'api', 'models', 'sales_model.pkl')
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

# Праздники
HOLIDAYS = [
    date(2025, 1, 1), date(2025, 1, 7), date(2025, 2, 23),
    date(2025, 3, 8), date(2025, 5, 1), date(2025, 5, 9),
    date(2025, 6, 12), date(2025, 11, 4), date(2025, 12, 31)
]


class SalesPredictor:
    """Предсказатель на XGBoost с оптимизированными параметрами"""
    
    def __init__(self):
        self.model = None
        self.is_trained = False
        
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.is_trained = True
            print("✅ Модель загружена")
    
    def _get_features(self, session):
        """4 признака: день, час, праздник, цена"""
        return np.array([
            session.date.weekday(),
            session.time.hour,
            1 if session.date in HOLIDAYS else 0,
            float(session.custom_price or session.calculated_price)
        ])
    
    def train(self):
        """Обучение с подбором параметров"""
        from api.models import Session, Ticket
        
        sessions = Session.objects.all()
        
        X, y = [], []
        for s in sessions:
            sold = Ticket.objects.filter(session=s, status__name='продан').count()
            if sold > 0:
                X.append(self._get_features(s))
                y.append(sold)
        
        if len(X) < 20:
            print(f"❌ Мало данных: {len(X)} сеансов")
            return False, {'error': f'Нужно 20+ сеансов, есть {len(X)}'}
        
        X, y = np.array(X), np.array(y)
        
        # ОПТИМИЗИРОВАННЫЕ параметры для уменьшения ошибки
        self.model = xgb.XGBRegressor(
            n_estimators=300,          # больше деревьев (было 100)
            max_depth=8,               # глубже (было 10 - переобучение)
            learning_rate=0.03,        # медленнее (было 0.1)
            min_child_weight=5,        # меньше переобучения
            subsample=0.8,             # случайные 80% данных
            colsample_bytree=0.8,      # случайные 80% признаков
            gamma=0.1,                 # регуляризация
            reg_alpha=0.1,             # L1 регуляризация
            reg_lambda=1.0,            # L2 регуляризация
            random_state=42,
            verbosity=0
        )
        self.model.fit(X, y)

        predictions = self.model.predict(X)
        predictions = np.clip(predictions, 0, 300)

        mae = mean_absolute_error(y, predictions)
        rmse = np.sqrt(mean_squared_error(y, predictions))
        mape = mean_absolute_percentage_error(y, predictions) * 100
        r2 = r2_score(y, predictions)
        
        # Важность признаков
        importance = dict(zip(
            ['day_of_week', 'hour', 'is_holiday', 'price'],
            self.model.feature_importances_.round(4)
        ))
        
        self.is_trained = True
        joblib.dump(self.model, MODEL_PATH)
        
        print(f"✅ Обучено!")
        print(f"   MAE={mae:.1f}, RMSE={rmse:.1f}, MAPE={mape:.1f}%, R²={r2:.3f}")
        print(f"📊 Важность: {importance}")
        
        return True, {
            'samples': len(X),
            'mae': round(float(mae), 1),
            'rmse': round(float(rmse), 1),
            'mape': round(float(mape), 1),
            'r2': round(float(r2), 3),
            'importance': importance
        }
    
    def predict(self, session):
        """Предсказать продажи"""
        if not self.is_trained:
            return None
        
        features = self._get_features(session).reshape(1, -1)
        pred = self.model.predict(features)[0]
        return max(0, min(300, int(pred)))
    
    def find_best_price(self, session):
        """Найти цену с максимальной выручкой"""
        if not self.is_trained:
            return None
        
        base = float(session.play.price)
        best_price = base
        best_revenue = 0
        results = []
        
        for mult in [0.5, 0.7, 1.0, 1.3, 1.6, 2.0, 2.5]:
            test_price = round(base * mult)
            
            orig = session.custom_price
            session.custom_price = test_price
            
            pred = self.predict(session)
            session.custom_price = orig
            
            if pred:
                revenue = test_price * pred
                results.append({
                    'price': test_price,
                    'sales': pred,
                    'revenue': revenue
                })
                
                if revenue > best_revenue:
                    best_revenue = revenue
                    best_price = test_price
        
        return {
            'best_price': best_price,
            'best_revenue': best_revenue,
            'options': results
        }


predictor = SalesPredictor()