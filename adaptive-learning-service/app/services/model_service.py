import os
import gc
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from pyBKT.models import Model
from sklearn.model_selection import GroupKFold
from app.services.preprocessing_service import Preprocessing

SEED = 42           
NUM_FITS = 10       
DEFAULTS = {'order_id': 'order_id'}

class BKTModelTraining:
  def __init__(self, db: Session):
    self.preprocessing = Preprocessing(db=db)

  def install_dependencies(self):
    """Tự động cài đặt thư viện pyBKT nếu chưa có."""
    try:
      import pyBKT
    except ImportError:
      print("Đang cài đặt môi trường...")
      os.system('pip install -q setuptools wheel numpy==1.23.5 cython pandas==1.5.3')
      os.system('pip install -q git+https://github.com/CAHLR/pyBKT.git --no-build-isolation')

  def load_dataset(self) -> pd.DataFrame:
    """Đọc file CSV và chuẩn hóa cột thời gian (timestamp)."""
    return self.preprocessing.process_pipeline()
  
  def extract_skill_and_level(self, text: str):
    # Convert the split list into a pandas Series
    return pd.Series(text.rsplit('_', 1))
  
  def train_and_evaluate(self):
    """Chạy quy trình kiểm thử chéo 5-Fold (Cross Validation)."""
    metrics = {'auc': [], 'rmse': [], 'accuracy': []}
    
    # 1. Load data
    df = self.load_dataset()
    
    # Đảm bảo dữ liệu được sắp xếp theo thời gian cho từng Section (BKT cần tính tuần tự)
    df = df.sort_values(['section_id', 'order_id'])
    
    # Chuẩn bị dữ liệu cho GroupKFold
    X = df.drop(columns=['correct'])
    y = df['correct']
    groups = df['section_id']
    
    n_splits = 5
    gkf = GroupKFold(n_splits=n_splits)
    
    print(f"Bắt đầu Training {n_splits} Folds (GroupKFold strategy)...")

    # Sử dụng enumerate để lấy chỉ số fold chính xác
    for fold, (train_idx, test_idx) in enumerate(gkf.split(X, y, groups)):
      try:
        # Tách dữ liệu
        train_df = df.iloc[train_idx]
        test_df = df.iloc[test_idx]

        # Khởi tạo mô hình (Ví dụ với pyBKT)
        model = Model(seed=42, num_fits=5) # Giả định SEED và NUM_FITS đã định nghĩa
        
        # Huấn luyện
        # BKT thường yêu cầu cột 'skill_name' - hãy đảm bảo df của bạn có cột này
        model.fit(data=train_df) 

        # Đánh giá hiệu năng trên tập test
        auc = model.evaluate(data=test_df, metric='auc')
        rmse = model.evaluate(data=test_df, metric='rmse')
        acc = model.evaluate(data=test_df, metric='accuracy')

        print(f"   Fold {fold + 1}: AUC={auc:.4f} | RMSE={rmse:.4f} | ACC={acc:.4f}")
        
        metrics['auc'].append(auc)
        metrics['rmse'].append(rmse)
        metrics['accuracy'].append(acc)

      except Exception as e:
        print(f"   Lỗi tại Fold {fold + 1}: {e}")
      
      finally:
        # Dọn dẹp RAM triệt để
        if 'model' in locals(): del model
        if 'train_df' in locals(): del train_df
        if 'test_df' in locals(): del test_df
        gc.collect()

    # Tính toán kết quả trung bình cuối cùng
    print("-" * 30)
    print(f"Kết quả cuối cùng (Mean):")
    for m, values in metrics.items():
      if values:
        print(f"  {m.upper()}: {sum(values)/len(values):.4f}")

    return {
      'auc': round(float(np.mean(metrics['auc'])), 4),
      'rmse': round(float(np.mean(metrics['rmse'])), 4),
      'accuracy': round(float(np.mean(metrics['accuracy'])), 4)
    }

  def train_master_model(self):
    """Huấn luyện Model cuối cùng trên toàn bộ dữ liệu để xuất bản."""
    print("\nĐang huấn luyện Master Model (Final)...")

    # Gộp dữ liệu từ tất cả các fold
    full_data = self.load_dataset()

    final_model = Model(seed=SEED, num_fits=NUM_FITS)
    final_model.fit(data=full_data, defaults=DEFAULTS)

    df_params = pd.DataFrame(final_model.params())
    df_params[['skill', 'level']] = df_params['skill'].apply(self.extract_skill_and_level)
    df_params['level'] = df_params['level'].str.lower()

    return df_params
