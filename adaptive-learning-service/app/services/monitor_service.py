from app.services.model_service import BKTModelTraining
from app.repositories.metadata_repository import MetadataRepository
import json
from sqlalchemy.orm import Session
from pathlib import Path
import pandas as pd

class MonitorService:
  def __init__(self, db: Session):
    self.AUC_THRESHOLD = 0.7
    self.model = BKTModelTraining(db)
    self.metadata_repo = MetadataRepository(db)
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

  def mass_update_params(self, df_params: pd.DataFrame):
    for row in df_params.itertuples(index=True, name='Pandas'):
      skill = row.skill
      level = row.level
      updated_df = {
        "prior": row.prior,
        "learns": row.learns,
        "guesses": row.guesses,
        "slips": row.slips,
        "level": row.level
      }
      self.metadata_repo.update_by_skill_and_level(skill, updated_df)

  def trigger_retrain(self):
    avg_metric = self.model.train_and_evaluate()
    print("METRICS: ", avg_metric)
    if (avg_metric["auc"] == None): return
    if (avg_metric["auc"] < self.AUC_THRESHOLD):
      self.alert()
      model_params = self.model.train_master_model()
      self.mass_update_params(model_params)
      updated_avg_metric = self.model.train_and_evaluate()
      self.update_measures(params=updated_avg_metric)

  def alert(self):
    print("Alert!")