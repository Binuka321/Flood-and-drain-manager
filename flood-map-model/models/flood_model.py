import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os
from datetime import datetime

class FloodPredictionModel:
    """
    Flood Prediction Model using ensemble methods
    """
    
    def __init__(self, model_type='random_forest', model_path='./models/saved_models'):
        """
        Initialize the model
        
        Args:
            model_type: 'random_forest' or 'gradient_boosting'
            model_path: Path to save/load models
        """
        self.model_type = model_type
        self.model_path = model_path
        self.scaler = StandardScaler()
        self.model = None
        self.is_trained = False
        self.metrics = {}
        self.feature_names = None
        self.model_version = None
        
        os.makedirs(model_path, exist_ok=True)
        
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the chosen model"""
        if self.model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'gradient_boosting':
            self.model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                min_samples_split=5,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    def train(self, X, y, test_size=0.2, random_state=42):
        """
        Train the model
        
        Args:
            X: Feature data (DataFrame or ndarray)
            y: Target data (Series or ndarray)
            test_size: Proportion of data to use for testing
            random_state: Random seed for reproducibility
            
        Returns:
            Dictionary with training metrics
        """
        # Store feature names if X is a DataFrame
        if isinstance(X, pd.DataFrame):
            self.feature_names = X.columns.tolist()
            X = X.values
        
        if isinstance(y, pd.Series):
            y = y.values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred_train = self.model.predict(X_train_scaled)
        y_pred_test = self.model.predict(X_test_scaled)
        
        self.metrics = {
            'train_accuracy': float(accuracy_score(y_train, y_pred_train)),
            'test_accuracy': float(accuracy_score(y_test, y_pred_test)),
            'precision': float(precision_score(y_test, y_pred_test, average='weighted', zero_division=0)),
            'recall': float(recall_score(y_test, y_pred_test, average='weighted', zero_division=0)),
            'f1_score': float(f1_score(y_test, y_pred_test, average='weighted', zero_division=0)),
            'confusion_matrix': confusion_matrix(y_test, y_pred_test).tolist(),
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'features': len(X[0])
        }
        
        self.is_trained = True
        self.model_version = datetime.now().isoformat()
        
        return self.metrics
    
    def predict(self, X):
        """
        Make predictions
        
        Args:
            X: Feature data (DataFrame or ndarray)
            
        Returns:
            Predictions array
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)
        
        return predictions, probabilities
    
    def predict_single(self, features_dict):
        """
        Make a single prediction from a dictionary of features
        
        Args:
            features_dict: Dictionary with feature names as keys
            
        Returns:
            Prediction and probability
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        if self.feature_names is None:
            raise ValueError("Feature names not set. Train model with DataFrame first.")
        
        # Create feature array in correct order
        feature_values = [features_dict[name] for name in self.feature_names]
        X = np.array([feature_values])
        
        prediction, probability = self.predict(X)
        
        return int(prediction[0]), float(probability[0].max())
    
    def save(self, filename=None):
        """
        Save the model to disk
        
        Args:
            filename: Custom filename (without extension)
            
        Returns:
            Path to saved model
        """
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        if filename is None:
            filename = f"flood_model_{self.model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        model_file = os.path.join(self.model_path, f"{filename}.pkl")
        scaler_file = os.path.join(self.model_path, f"{filename}_scaler.pkl")
        
        joblib.dump(self.model, model_file)
        joblib.dump(self.scaler, scaler_file)
        
        # Save metadata
        metadata = {
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'metrics': self.metrics,
            'version': self.model_version,
            'created_at': datetime.now().isoformat()
        }
        import json
        metadata_file = os.path.join(self.model_path, f"{filename}_metadata.json")
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return {
            'model_file': model_file,
            'scaler_file': scaler_file,
            'metadata_file': metadata_file
        }
    
    def load(self, filename):
        """
        Load the model from disk
        
        Args:
            filename: Filename without extension
            
        Returns:
            Boolean indicating success
        """
        model_file = os.path.join(self.model_path, f"{filename}.pkl")
        scaler_file = os.path.join(self.model_path, f"{filename}_scaler.pkl")
        
        if not os.path.exists(model_file) or not os.path.exists(scaler_file):
            raise FileNotFoundError(f"Model files not found: {filename}")
        
        self.model = joblib.load(model_file)
        self.scaler = joblib.load(scaler_file)
        self.is_trained = True
        
        # Load metadata
        metadata_file = os.path.join(self.model_path, f"{filename}_metadata.json")
        if os.path.exists(metadata_file):
            import json
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
                self.feature_names = metadata.get('feature_names')
                self.metrics = metadata.get('metrics', {})
                self.model_version = metadata.get('version')
        
        return True
    
    def get_feature_importance(self):
        """
        Get feature importance from the model
        """
        if not self.is_trained or self.feature_names is None:
            raise ValueError("Model must be trained before getting feature importance")
        
        import pandas as pd
        importances = self.model.feature_importances_
        feature_importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importances
        }).sort_values('importance', ascending=False)
        
        return feature_importance_df.to_dict('records')
