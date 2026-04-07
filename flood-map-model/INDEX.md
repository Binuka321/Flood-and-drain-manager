# ML Microservice File Index

## 📋 Getting Started Files

| File | Purpose | Priority |
|------|---------|----------|
| **SETUP_GUIDE.md** | Complete setup and usage guide | 🔴 START HERE |
| **README.md** | Full API documentation | 🟡 HIGH |
| **INTEGRATION.md** | Backend integration examples | 🟡 HIGH |
| **quickstart.py** | Automated setup script | 🟡 HIGH |

## 🚀 Startup Files

| File | Platform | Usage |
|------|----------|-------|
| **app.py** | All | `python app.py` |
| **run.bat** | Windows | `run.bat` or run directly |
| **run.sh** | macOS/Linux | `bash run.sh` |
| **quickstart.py** | All | `python quickstart.py` |

## 🧠 Core Application

| File | Purpose |
|------|---------|
| **app.py** | Flask application factory, route registration |
| **config.py** | Configuration management, environment variables |
| **requirements.txt** | Python dependencies |

## 🤖 Machine Learning

| File | Purpose | Contains |
|------|---------|----------|
| **models/flood_model.py** | Main ML model class | FloodPredictionModel class with train/predict methods |
| **routes/training.py** | Training API endpoints | `/train`, `/status`, `/load`, `/list` |
| **routes/prediction.py** | Prediction API endpoints | `/predict`, `/feature-importance`, `/model-info` |

## 🛠️ Utilities

| File | Purpose |
|------|---------|
| **utils/data_processor.py** | Data preprocessing, validation, feature engineering |
| **utils/data_loader.py** | CSV loading, sample data creation |

## 📊 Sample Datasets

| File | Records | Columns | Purpose |
|------|---------|---------|---------|
| **data/sri_lanka_flood_dataset_district.csv** | variable | timestamp, location_id, latitude, longitude, water_level_m, rainfall_mm, flow_rate_m3s, elevation_m, historical_risk, FRI, risk_level, district | Flood training dataset |
| **data/sri_lanka_rainfall_forecast_district.csv** | variable | timestamp, predicted_rainfall_mm, district | Forecast rainfall data |

## 📚 Example Code

| File | Purpose | Shows |
|------|---------|-------|
| **example_train.py** | Complete example script | Train, predict single, predict batch |

## ⚙️ Configuration

| File | Purpose |
|------|---------|
| **.env** | Environment variables (port, paths, URLs) |
| **.gitignore** | Git ignore rules for Python and ML artifacts |

## 📂 Directory Structure

```
ml-service/
├── 📄 README.md                          # API Documentation
├── 📄 SETUP_GUIDE.md                     # Quick Start Guide ⭐
├── 📄 INTEGRATION.md                     # Backend Integration
├── 📄 INDEX.md                           # This File
│
├── 🎯 app.py                             # Flask App
├── ⚙️  config.py                         # Configuration
├── 📦 requirements.txt                   # Dependencies
├── 🔧 quickstart.py                      # Auto-setup
├── 🎓 example_train.py                   # Example Code
├── 🐍 run.bat / run.sh                   # Startup Scripts
│
├── 📁 models/
│   ├── flood_model.py                    # ML Model Class
│   └── saved_models/                     # Saved models (auto-created)
│
├── 📁 routes/
│   ├── training.py                       # Training API
│   └── prediction.py                     # Prediction API
│
├── 📁 utils/
│   ├── data_processor.py                 # Data Utils
│   └── data_loader.py                    # CSV Loading
│
├── 📁 data/
│   ├── sri_lanka_flood_dataset_district.csv          # District-level flood training dataset
│   └── sri_lanka_rainfall_forecast_district.csv      # District-level rainfall forecast dataset
│
├── .env                                  # Environment vars
└── .gitignore                            # Git ignore
```

## 🎯 Quick Navigation

### I want to...

**...start the service**
→ Read: `SETUP_GUIDE.md` → Run: `python quickstart.py` or `run.bat`

**...understand the API**
→ Read: `README.md` → See examples in `INTEGRATION.md`

**...integrate with Node.js backend**
→ Read: `INTEGRATION.md` and copy code examples

**...see a complete example**
→ Run: `example_train.py` after service is running

**...train a model with my data**
→ POST to `/api/ml/training/train` with datasets in JSON format

**...make a prediction**
→ POST to `/api/ml/prediction/predict` with feature values

**...understand the model**
→ GET `/api/ml/prediction/feature-importance` to see what features matter

**...save/load models**
→ POST `/api/ml/training/train` with `save_model: true` to save
→ POST `/api/ml/training/load/<name>` to load

## 🌐 API Quick Reference

```
Health:     GET    /api/ml/health
Train:      POST   /api/ml/training/train
Status:     GET    /api/ml/training/status
List:       GET    /api/ml/training/list
Load:       POST   /api/ml/training/load/<name>
Predict:    POST   /api/ml/prediction/predict
Importance: GET    /api/ml/prediction/feature-importance
Model Info: GET    /api/ml/prediction/model-info
```

## 🔐 Configuration Files

**Environment Variables (.env):**
```
FLASK_ENV=development
ML_SERVICE_PORT=5000
BACKEND_API_URL=http://localhost:3001
MODEL_PATH=./models/saved_models
DATA_PATH=./data/datasets
```

**Python Packages (requirements.txt):**
- Flask 2.3.3
- Flask-CORS 4.0.0
- pandas 2.0.3
- numpy 1.24.3
- scikit-learn 1.3.0
- joblib 1.3.1

## 💡 Pro Tips

1. **First Time?** → Start with `SETUP_GUIDE.md` and `quickstart.py`
2. **Need Examples?** → Check `example_train.py` and `INTEGRATION.md`
3. **Training Failing?** → Ensure dataset format matches samples in `data/` folder
4. **Poor Predictions?** → Check feature importance and add more diverse training data
5. **Deploying?** → Keep `models/saved_models/` for model persistence

## 📞 Support Resources

- **Full Docs:** `README.md`
- **Setup:** `SETUP_GUIDE.md`
- **Integration:** `INTEGRATION.md`
- **Working Example:** `example_train.py`
- **Datasets:** `data/` folder
- **Source Code:** Core modules in `models/`, `routes/`, `utils/`

---

**Last Updated:** 2026-04-06
**Status:** ✅ Ready to Deploy
