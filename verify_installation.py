"""
Installation Verification Script
Run this to check if everything is set up correctly
"""

import sys
import os

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print("✓ Python version OK:", f"{version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print("✗ Python version too old. Need 3.8+, have:", f"{version.major}.{version.minor}.{version.micro}")
        return False

def check_dependencies():
    """Check if required packages are installed"""
    required = {
        'flask': 'Flask',
        'flask_cors': 'Flask-CORS',
        'pandas': 'Pandas',
        'numpy': 'NumPy',
        'werkzeug': 'Werkzeug'
    }
    
    all_ok = True
    for module, name in required.items():
        try:
            __import__(module)
            print(f"✓ {name} installed")
        except ImportError:
            print(f"✗ {name} NOT installed")
            all_ok = False
    
    return all_ok

def check_files():
    """Check if required files exist"""
    required_files = [
        'app.py',
        'integrated_system.py',
        'main_engine.py',
        'dataset_with_priority.csv',
        'templates/login.html',
        'templates/register.html',
        'templates/dashboard.html',
        'templates/profile.html',
        'templates/diagnosis.html',
        'templates/report.html',
        'static/css/style.css',
        'static/css/report.css',
        'static/js/auth.js',
        'static/js/dashboard.js',
        'static/js/profile.js',
        'static/js/diagnosis.js',
        'static/js/report.js'
    ]
    
    all_ok = True
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file}")
        else:
            print(f"✗ {file} MISSING")
            all_ok = False
    
    return all_ok

def check_dataset():
    """Check if dataset is valid"""
    try:
        import pandas as pd
        df = pd.read_csv('dataset_with_priority.csv')
        symptoms = len(df['trigger_symptom'].unique())
        diseases = len(df['disease_name'].unique())
        print(f"✓ Dataset loaded: {symptoms} symptoms, {diseases} diseases")
        return True
    except Exception as e:
        print(f"✗ Dataset error: {e}")
        return False

def main():
    print("="*60)
    print("MEDICAL DIAGNOSTIC SYSTEM - INSTALLATION VERIFICATION")
    print("="*60)
    print()
    
    print("Checking Python version...")
    python_ok = check_python_version()
    print()
    
    print("Checking dependencies...")
    deps_ok = check_dependencies()
    print()
    
    print("Checking files...")
    files_ok = check_files()
    print()
    
    print("Checking dataset...")
    dataset_ok = check_dataset()
    print()
    
    print("="*60)
    if python_ok and deps_ok and files_ok and dataset_ok:
        print("✓ ALL CHECKS PASSED!")
        print()
        print("You're ready to run the application:")
        print("  python app.py")
        print()
        print("Then open: http://localhost:5000")
    else:
        print("✗ SOME CHECKS FAILED")
        print()
        if not deps_ok:
            print("Install missing dependencies:")
            print("  pip install -r requirements.txt")
        if not files_ok:
            print("Some files are missing. Check the file structure.")
    print("="*60)

if __name__ == "__main__":
    main()
