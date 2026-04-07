from flask import Blueprint, request, jsonify, current_app
from models.flood_model import FloodPredictionModel
import numpy as np
import pandas as pd

prediction_bp = Blueprint('prediction', __name__)

# Reference to current model (will be set by training route)
current_model = None

@prediction_bp.route('/predict', methods=['POST'])
def predict():
    """
    Make predictions using the trained model
    
    Expected JSON:
    {
        "features": {
            "feature1": value1,
            "feature2": value2,
            ...
        }
    }
    or
    {
        "features": [
            [value1, value2, ...],
            [value1, value2, ...],
            ...
        ]
    }
    """
    try:
        from routes.training import current_model as model, initialize_default_model
        
        if model is None or not model.is_trained:
            try:
                model = initialize_default_model(current_app) or model
            except Exception as init_error:
                print('⚠️ Default model initialization failed during prediction:', init_error)

        if model is None or not model.is_trained:
            return jsonify({
                'error': 'Model not trained',
                'message': 'Please train a model first'
            }), 400
        
        data = request.get_json(force=True, silent=True)
        if data is None:
            return jsonify({
                'error': 'Invalid JSON payload',
                'message': 'Could not parse request body'
            }), 400
        
        if 'features' not in data:
            return jsonify({
                'error': 'Missing features in request',
                'message': 'Request JSON must include a features object or list',
                'received_payload': data
            }), 400
        
        features = data['features']
        
        # Handle single prediction (dict)
        if isinstance(features, dict):
            try:
                prediction, confidence = model.predict_single(features)
            except KeyError as ke:
                return jsonify({
                    'error': 'Missing feature for model prediction',
                    'details': str(ke),
                    'expected_features': model.feature_names,
                    'provided_features': list(features.keys())
                }), 400
            except ValueError as ve:
                print('⚠️ Prediction input invalid:', str(ve))
                print('   expected_features:', model.feature_names)
                print('   provided_features:', list(features.keys()))
                return jsonify({
                    'error': 'Prediction input invalid',
                    'details': str(ve),
                    'expected_features': model.feature_names,
                    'provided_features': list(features.keys())
                }), 400

            prediction_value = prediction
            prediction_label = None
            if isinstance(prediction_value, str):
                prediction_label = prediction_value
            else:
                prediction_label = _get_risk_label(prediction_value)

            return jsonify({
                'prediction': prediction_value,
                'confidence': float(confidence),
                'prediction_label': prediction_label,
                'details': {
                    'features_used': model.feature_names,
                    'model_type': model.model_type,
                    'model_version': model.model_version
                }
            }), 200
        
        # Handle batch predictions (list)
        elif isinstance(features, list):
            features_array = np.array(features)
            predictions, probabilities = model.predict(features_array)
            
            results = []
            for pred, probs in zip(predictions, probabilities):
                results.append({
                    'prediction': int(pred),
                    'confidence': float(probs.max()),
                    'prediction_label': _get_risk_label(pred),
                    'probabilities': probs.tolist()
                })
            
            return jsonify({
                'status': 'success',
                'batch_size': len(results),
                'predictions': results,
                'model_info': {
                    'type': model.model_type,
                    'version': model.model_version
                }
            }), 200
        
        else:
            return jsonify({'error': 'Invalid features format'}), 400
    
    except ValueError as e:
        return jsonify({
            'error': 'Prediction failed',
            'details': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'error': 'Prediction error',
            'details': str(e)
        }), 500

@prediction_bp.route('/feature-importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance from the current model"""
    try:
        from routes.training import current_model as model
        
        if model is None or not model.is_trained:
            return jsonify({
                'error': 'Model not trained',
                'message': 'Please train a model first'
            }), 400
        
        importance = model.get_feature_importance()
        
        return jsonify({
            'status': 'success',
            'feature_importance': importance,
            'model_info': {
                'type': model.model_type,
                'version': model.model_version
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to get feature importance',
            'details': str(e)
        }), 500

@prediction_bp.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the current model"""
    try:
        from routes.training import current_model as model
        
        if model is None:
            return jsonify({
                'error': 'No model available',
                'message': 'Please train a model first'
            }), 400
        
        info = {
            'model_type': model.model_type,
            'is_trained': model.is_trained,
            'version': model.model_version,
            'feature_names': model.feature_names,
            'feature_count': len(model.feature_names) if model.feature_names else 0,
            'metrics': model.metrics if model.is_trained else None
        }
        
        if model.metrics:
            info['performance'] = {
                'accuracy': model.metrics.get('test_accuracy'),
                'precision': model.metrics.get('precision'),
                'recall': model.metrics.get('recall'),
                'f1_score': model.metrics.get('f1_score')
            }
        
        return jsonify(info), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to get model info',
            'details': str(e)
        }), 500

def _get_risk_label(prediction):
    """
    Convert numeric prediction to risk label
    
    Args:
        prediction: Numeric prediction
        
    Returns:
        Risk label string
    """
    risk_mapping = {
        0: 'Low Risk',
        1: 'Moderate Risk',
        2: 'High Risk',
        3: 'Very High Risk'
    }
    return risk_mapping.get(int(prediction), 'Unknown Risk')
