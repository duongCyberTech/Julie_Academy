import pandas as pd
from sqlalchemy.orm import Session
from sklearn.model_selection import GroupKFold
from app.services.preprocessing_service import Preprocessing

class BKTModelTraining:
  def __init__(self, db: Session):
    self.SEED = 42           
    self.NUM_FITS = 10       
    self.DEFAULTS = {'order_id': 'order_id'} 
    self.preprocessing = Preprocessing(db=db)

  def load_dataset(self) -> pd.DataFrame:
    """Đọc file CSV và chuẩn hóa cột thời gian (timestamp)."""
    return self.preprocessing.process_pipeline()
  
  def extract_skill_and_level(self, text: str):
    # Convert the split list into a pandas Series
    return pd.Series(text.rsplit('_', 1))
  
  def train_and_evaluate(self):
    from pyBKT.models import Model
    import numpy as np
    import gc

    metrics = {}

    # 1. Load data
    df = self.load_dataset()

    # 🧹 2. Làm sạch dữ liệu (rất quan trọng với BKT)
    # bỏ skill quá ít data
    df = df.groupby('skill_name').filter(lambda x: len(x) >= 5)

    # đảm bảo mỗi skill có cả 0 và 1
    df = df.groupby('skill_name').filter(lambda x: x['correct'].nunique() > 1)

    if df.empty:
      print("Dataset rỗng sau khi filter")
      return {'auc': None, 'rmse': None, 'accuracy': None}

    # 🧠 3. Sort theo thứ tự học (BKT cần sequence)
    # Ưu tiên user + order nếu có
    if 'user_id' in df.columns:
      df = df.sort_values(['user_id', 'order_id'])
    else:
      df = df.sort_values(['skill_name', 'order_id'])

    print(f"Bắt đầu training trên {len(df)} samples, {df['skill_name'].nunique()} skills...")

    try:
      # 🚀 4. Train model
      model = Model(seed=42, num_fits=5)
      model.fit(data=df)

      # 📊 5. Evaluate (in-sample)
      auc = model.evaluate(data=df, metric='auc')
      rmse = model.evaluate(data=df, metric='rmse')
      acc = model.evaluate(data=df, metric='accuracy')

      print("-" * 30)
      print("Kết quả:")
      print(f"AUC={auc:.4f} | RMSE={rmse:.4f} | ACC={acc:.4f}")

      return {
        'auc': round(float(auc), 4),
        'rmse': round(float(rmse), 4),
        'accuracy': round(float(acc), 4)
      }

    except Exception as e:
      print(f"Lỗi khi train/evaluate: {e}")
      return {'auc': None, 'rmse': None, 'accuracy': None}

    finally:
      if 'model' in locals():
        del model
      gc.collect()

  def transform_bkt_params(df_raw: pd.DataFrame) -> pd.DataFrame:
    # 1. Thực hiện Pivot: biến các giá trị trong 'param' thành tên cột
    df_pivot = df_raw.pivot(
        index=['skill', 'level'], 
        columns='param', 
        values='value'
    ).reset_index()
    
    # 2. Loại bỏ tên index của cột (thường là 'param') để DataFrame sạch đẹp
    df_pivot.columns.name = None
    
    # 3. Sắp xếp lại thứ tự cột theo ý muốn
    expected_cols = ['skill', 'level', 'prior', 'learns', 'guesses', 'slips', 'forgets']
    # Chỉ lấy những cột tồn tại trong dữ liệu thực tế
    final_cols = [c for c in expected_cols if c in df_pivot.columns]
    
    return df_pivot[final_cols].drop(columns=['forgets'])

  def train_master_model(self):
    from pyBKT.models import Model
    """Huấn luyện Model cuối cùng trên toàn bộ dữ liệu để xuất bản."""
    print("\nĐang huấn luyện Master Model (Final)...")

    # Gộp dữ liệu từ tất cả các fold
    full_data = self.load_dataset()

    final_model = Model(seed=self.SEED, num_fits=self.NUM_FITS)
    final_model.fit(data=full_data, defaults=self.DEFAULTS)

    df_params = pd.DataFrame(final_model.params())
    df_params = df_params.drop(columns=['class'])
    df_params[['skill', 'level']] = df_params['skill'].apply(self.extract_skill_and_level)
    df_params['level'] = df_params['level'].str.lower()

    return self.transform_bkt_params(df_params)
