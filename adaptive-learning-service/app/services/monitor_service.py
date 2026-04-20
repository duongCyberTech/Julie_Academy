from app.services.model_service import BKTModelTraining
import json
from sqlalchemy.orm import Session
from pathlib import Path

class MonitorService:
  def __init__(self, db: Session):
    self.AUC_THRESHOLD = 0.7
    self.model = BKTModelTraining(db)
    self.BASE_DIR = Path(__file__).resolve().parent.parent
    self.JSON_PATH = self.BASE_DIR / "core" / "eval_measures.json"

  def run_test(self):
    print("Start Monitoring...")

  def load_measures(self):
    with open(self.JSON_PATH, "r", encoding="utf-8") as f:
      eval_measures = json.load(f)

    return eval_measures
  
  def update_measures(self, params):
    with open(self.JSON_PATH, "w", encoding="utf-8") as f:
      json.dump(params)

  def trigger_retrain(self):
    eval_measures = self.load_measures()
    auc = eval_measures["auc"]
    if (auc < self.AUC_THRESHOLD):
      self.alert()
      avg_metric = self.model.train_and_evaluate()
      model_params = self.model.train_master_model()
      self.update_measures(params=avg_metric)

  def alert(self):
    pass