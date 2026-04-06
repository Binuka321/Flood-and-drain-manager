from flask import Blueprint, request, jsonify, current_app
from models.flood_model import FloodPredictionModel
from utils.data_processor import DataProcessor
import os
import json
from werkzeug.utils import secure_filename

training_bp = Blueprint('training', __name__)

# Global model instance
current_model = None

@training_bp.route('/train', methods=['POST'])
def train_model():
    """
    Train flood prediction model with provided datasets
    
    Expected JSON:
    {
        "rainfall_data": {
            "data": [...],  # array of objects or CSV text
            "format": "csv" or "json"
        },
        "flood_impact_data": {
            "data": [...],
            "format": "csv" or "json"
        },
        "model_type": "random_forest" or "gradient_boosting",  # optional, default: random_forest
        "target_column": "risk_level",  # required
        "test_size": 0.2,  # optional
        "save_model": true,  # optional, default: true
        "model_name": "my_flood_model"  # optional
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        if 'rainfall_data' not in data or 'flood_impact_data' not in data:
            return jsonify({'error': 'Missing rainfall_data or flood_impact_data'}), 400
        
        if 'target_column' not in data:
            return jsonify({'error': 'Missing target_column'}), 400
        
        target_column = data['target_column']
        model_type = data.get('model_type', 'random_forest')
        test_size = data.get('test_size', 0.2)
        save_model = data.get('save_model', True)
        model_name = data.get('model_name', 'flood_model')
        
        # Process input data
        processor = DataProcessor()
        
        # Load rainfall data
        if isinstance(data['rainfall_data'], str):
            rainfall_df = processor.load_csv(data['rainfall_data'])
        else:
            rainfall_df = pd.DataFrame(data['rainfall_data']['data'])
        
        # Load flood impact data
        if isinstance(data['flood_impact_data'], str):
            flood_df = processor.load_csv(data['flood_impact_data'])
        else:
            flood_df = pd.DataFrame(data['flood_impact_data']['data'])
        
        # Validate datasets
        is_valid, message = processor.validate_dataset(rainfall_df)
        if not is_valid:
            return jsonify({'error': f'Rainfall data invalid: {message}'}), 400
        
        is_valid, message = processor.validate_dataset(flood_df)
        if not is_valid:
            return jsonify({'error': f'Flood impact data invalid: {message}'}), 400
        
        # Get data summary before processing
        summary_before = {
            'rainfall_summary': processor.get_summary_stats(rainfall_df),
            'flood_summary': processor.get_summary_stats(flood_df)
        }
        
        # Merge datasets
        combined_df = processor.split_datasets(rainfall_df, flood_df)
        
        # Feature engineering
        combined_df = processor.create_features(combined_df)
        
        # Preprocess data
        X, y = processor.preprocess_data(
            combined_df,
            target_column=target_column,
            drop_columns=['location', 'month', 'latitude', 'longitude']  # Drop non-numeric/location columns
        )
        
        # Initialize and train model
        global current_model
        current_model = FloodPredictionModel(
            model_type=model_type,
            model_path=current_app.config['MODEL_PATH']
        )
        
        metrics = current_model.train(X, y, test_size=test_size)
        
        # Save model if requested
        saved_files = None
        if save_model:
            saved_files = current_model.save(model_name)
        
        response = {
            'status': 'success',
            'message': 'Model trained successfully',
            'model_info': {
                'type': model_type,
                'name': model_name,
                'version': current_model.model_version,
                'is_saved': save_model
            },
            'metrics': metrics,
            'data_info': {
                'total_samples': len(combined_df),
                'features': len(X.columns),
                'feature_names': X.columns.tolist(),
                'target_classes': sorted(y.unique().tolist())
            },
            'feature_importance': current_model.get_feature_importance(),
            'saved_files': saved_files
        }
        
        return jsonify(response), 201
    
    except Exception as e:
        return jsonify({
            'error': 'Training failed',
            'details': str(e)
        }), 500

@training_bp.route('/status', methods=['GET'])
def model_status():
    """Get current model status"""
    global current_model
    
    if current_model is None:
        return jsonify({
            'status': 'no_model',
            'message': 'No model trained yet'
        }), 200
    
    return jsonify({
        'status': 'initialized',
        'model_type': current_model.model_type,
        'is_trained': current_model.is_trained,
        'version': current_model.model_version,
        'metrics': current_model.metrics if current_model.is_trained else None,
        'feature_names': current_model.feature_names
    }), 200

@training_bp.route('/load/<model_name>', methods=['POST'])
def load_model(model_name):
    """Load a previously saved model"""
    try:
        global current_model
        
        model_type = request.json.get('model_type', 'random_forest') if request.json else 'random_forest'
        
        current_model = FloodPredictionModel(
            model_type=model_type,
            model_path=current_app.config['MODEL_PATH']
        )
        
        current_model.load(model_name)
        
        return jsonify({
            'status': 'success',
            'message': f'Model {model_name} loaded successfully',
            'model_info': {
                'type': current_model.model_type,
                'version': current_model.model_version,
                'is_trained': current_model.is_trained,
                'metrics': current_model.metrics,
                'feature_names': current_model.feature_names
            }
        }), 200
    
    except FileNotFoundError as e:
        return jsonify({
            'error': 'Model not found',
            'details': str(e)
        }), 404
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to load model',
            'details': str(e)
        }), 500

@training_bp.route('/list', methods=['GET'])
def list_models():
    """List all saved models"""
    try:
        model_path = current_app.config['MODEL_PATH']
        
        if not os.path.exists(model_path):
            return jsonify({'models': []}), 200
        
        # Get all .pkl files (model files)
        model_files = [f[:-4] for f in os.listdir(model_path) if f.endswith('.pkl') and '_scaler' not in f]
        
        models_info = []
        for model_name in model_files:
            metadata_file = os.path.join(model_path, f"{model_name}_metadata.json")
            if os.path.exists(metadata_file):
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                    models_info.append({
                        'name': model_name,
                        'type': metadata.get('model_type'),
                        'version': metadata.get('version'),
                        'created_at': metadata.get('created_at'),
                        'metrics': metadata.get('metrics')
                    })
        
        return jsonify({'models': models_info}), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to list models',
            'details': str(e)
        }), 500
