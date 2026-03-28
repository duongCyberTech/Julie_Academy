import joblib

_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load("models/model.pkl")
    return _model