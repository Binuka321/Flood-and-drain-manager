"""
Quick start script to setup and test the ML microservice
"""

import os
import sys

def setup_environment():
    """Setup virtual environment and install dependencies"""
    print("🔧 Setting up ML Microservice...")
    
    # Create virtual environment
    if not os.path.exists('venv'):
        print("  Creating virtual environment...")
        os.system('python -m venv venv')
    
    # Activate and install
    if sys.platform == 'win32':
        activate_cmd = '.\\venv\\Scripts\\activate.bat &&'
    else:
        activate_cmd = '. venv/bin/activate &&'
    
    print("  Installing dependencies...")
    os.system(f'{activate_cmd} pip install -r requirements.txt')
    
    print("✅ Setup complete!")

def create_sample_data():
    """Create sample data files"""
    print("\n📁 Creating sample data...")
    
    from utils.data_loader import DataLoader
    rainfall_path, flood_path = DataLoader.create_sample_csvs()
    
    print(f"  ✅ Rainfall data: {rainfall_path}")
    print(f"  ✅ Flood impact data: {flood_path}")

def run_service():
    """Run the microservice"""
    print("\n🚀 Starting ML Microservice...")
    
    if sys.platform == 'win32':
        os.system('.\\venv\\Scripts\\activate.bat && python app.py')
    else:
        os.system('. venv/bin/activate && python app.py')

if __name__ == '__main__':
    try:
        setup_environment()
        create_sample_data()
        
        input("\n✨ Ready! Press Enter to start the service...")
        run_service()
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
