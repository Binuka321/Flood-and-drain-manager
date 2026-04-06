import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    ML_SERVICE_PORT = int(os.getenv('ML_SERVICE_PORT', 5000))
    BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:3001')
    MODEL_PATH = os.getenv('MODEL_PATH', './models/saved_models')
    DATA_PATH = os.getenv('DATA_PATH', './data/datasets')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
