import numpy as np
import joblib
import os
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'api', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'sales_predictor.pkl')

os.makedirs(MODEL_DIR, exist_ok=True)


class SalesPredictor:
    
    def __init__(self):
        self.model = None
        self.is_trained = False
        self._load_model()
    
    def _load_model(self):

        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.is_trained = True
                print(f"Модель загружена из {MODEL_PATH}")
            except Exception as e:
                print(f"Ошибка загрузки модели: {e}")
    
    def _save_model(self):

        if self.model:
            joblib.dump(self.model, MODEL_PATH)
            print(f"Модель сохранена в {MODEL_PATH}")
    
    def _get_avg_sales_last_days(self, session, days):

        from .models import Session, Ticket
        
        cutoff_date = session.date - timedelta(days=days)
        
        past_sessions = Session.objects.filter(
            play=session.play,
            date__gte=cutoff_date,
            date__lt=session.date
        )
        
        if not past_sessions.exists():
            return 0
        
        total_sales = 0
        count = 0
        
        for past in past_sessions:
            sold = Ticket.objects.filter(
                session=past,
                status__name='продан'
            ).count()
            total_sales += sold
            count += 1
        
        return total_sales / count if count > 0 else 0
    
    def _extract_features(self, session):

        weekday = session.date.weekday()  # 0-6 (пн-вс)
        month = session.date.month        # 1-12
        is_weekend = 1 if weekday >= 5 else 0
        price = float(session.play.price)
        duration = session.play.duration
        
        avg_sales_7d = self._get_avg_sales_last_days(session, 7)
        avg_sales_30d = self._get_avg_sales_last_days(session, 30)
        
        return [weekday, month, is_weekend, price, duration, avg_sales_7d, avg_sales_30d]
    
    def prepare_features(self, session_data, historical_sales):

        features = []
        targets = []
        
         # извлекаем признаки
        for session in session_data:
           
            feat = self._extract_features(session)
            features.append(feat)
            
            # целевая переменная
            target = historical_sales.get(session.session_id, 0)
            targets.append(target)
        
        return np.array(features), np.array(targets)
    
    def train(self, session_data, historical_sales):

        if len(session_data) < 10:
            return False, {
                'error': f'Недостаточно данных. Нужно минимум 10 сеансов, получено: {len(session_data)}'
            }
        
        # подготавка данных
        X, y = self.prepare_features(session_data, historical_sales)
        
        # разделение на обучающую и тестовую выборки
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model = RandomForestRegressor(
            n_estimators=100,      # количество деревьев
            max_depth=10,          # максимальная глубина
            random_state=42,       # для воспроизводимости
        )
        
        # обучение
        self.model.fit(X_train, y_train)

        # оценка качества
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

        self._save_model()
        self.is_trained = True
        
        return True, {
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'r2': round(r2, 2),
            'train_samples': len(X_train),
            'mape': round(mape, 2),
            'test_samples': len(X_test),
            'total_samples': len(X),
            'feature_importance': self._get_feature_importance()
        }
    
    def _get_feature_importance(self):
        if not self.model:
            return {}
        
        feature_names = [
            'day_of_week', 'month', 'is_weekend', 'price', 
            'duration', 'avg_sales_7d', 'avg_sales_30d'
        ]
        
        importance = {}
        for name, imp in zip(feature_names, self.model.feature_importances_):
            importance[name] = round(imp, 3)
        
        return importance
    

    def predict_for_session(self, session):
        if not self.is_trained or self.model is None:
            return None

        features = self._extract_features(session)

        features_array = np.array([features])
        prediction = self.model.predict(features_array)[0]

        return max(0, int(prediction))
    
    def get_model_info(self):
        return {
            'is_trained': self.is_trained,
            'model_path': MODEL_PATH if os.path.exists(MODEL_PATH) else None,
            'model_exists': os.path.exists(MODEL_PATH)
        }


predictor = SalesPredictor()