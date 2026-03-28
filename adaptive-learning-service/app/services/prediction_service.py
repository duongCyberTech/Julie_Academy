from app.ml.inference import run_inference

class PredictionService:
    async def predict(self, data):
        result = run_inference(data)
        return {"prediction": result}