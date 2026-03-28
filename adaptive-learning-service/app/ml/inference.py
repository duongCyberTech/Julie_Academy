from app.ml.model_loader import load_model

def run_inference(data):
    model = load_model()
    return model.predict([data.features])[0]