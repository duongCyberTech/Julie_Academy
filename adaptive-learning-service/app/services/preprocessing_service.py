import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.repositories.training_data_repository import TrainingDataRepository
from app.core.database import get_db

class Preprocessing:
  def __init__(self, db: Session):
    self.N_FOLDS = 5
    self.TARGET_SKILLS = 100 
    self.MAX_USERS = 4000
    self.MIN_INTERACTIONS = 5
    self.THRESHOLD_HARD = 0.3  # Dưới 30% làm đúng -> KHÓ
    self.THRESHOLD_EASY = 0.7  # Trên 70% làm đúng -> DỄ
    self.tdr = TrainingDataRepository(db)

  def get_difficulty_label(self, pass_rate):
    """Phân loại độ khó dựa trên Classical Test Theory"""
    if pass_rate >= self.THRESHOLD_EASY: return 'EASY'
    if pass_rate <= self.THRESHOLD_HARD: return 'HARD'
    return 'MEDIUM'
  
  def get_df(self, session_id: str):
    return self.tdr.get_batch(session_id=session_id)
  
  def get_many_session_df(self):
    return self.tdr.get_many_batches()
  
  def process_pipeline(self):
    print(f"--- PREPROCESSING: PHÂN TẦNG ĐỘ KHÓ (STRATIFIED 30-70) ---")
    
    # 1. LOAD & CLEAN
    print("[1/5] Đọc và làm sạch dữ liệu...")
    
    try:
      df = self.get_many_session_df()
    except: return print("[LỖI] Không đọc được file CSV.")

    if df.empty:
      return df

    # Mapping cột
    cols_map = {
      'user_id': 'user_id', 'skill': 'skill_name', 'problem_id': 'problem_id',
      'start_time': 'order_id', 'correct': 'correct', 
      'original': 'original', 'attempt_count': 'attempt_count'
    }
    df = df.rename(columns={k: v for k, v in cols_map.items() if k in df.columns})
    df = df.dropna(subset=['user_id', 'skill_name', 'problem_id', 'order_id', 'correct'])
    df = df.drop_duplicates()
    if 'original' in df.columns: df = df[df['original'] == 1]
    if 'attempt_count' in df.columns: df = df[df['attempt_count'] == 1]
    
    df['correct'] = pd.to_numeric(df['correct'], errors='coerce')
    df = df.dropna(subset=['correct'])
    df['correct'] = (df['correct'] >= 0.5).astype(int)
    
    df['order_id'] = pd.to_datetime(df['order_id'], format='mixed', errors='coerce')
    df = df.sort_values(by=['user_id', 'order_id'])

    # 2. CHỌN MẪU (SAMPLING)
    print("[2/5] Lọc mẫu (Random Sampling)...")
    
    # Lọc User ít tương tác
    u_counts = df['user_id'].value_counts()
    valid_users = u_counts[u_counts >= self.MIN_INTERACTIONS].index

    df = df[df['user_id'].isin(valid_users)]

    # 3. TÍNH TOÁN ĐỘ KHÓ TRỰC TIẾP (LOGIT)
    print(f"[3/5] Tính toán độ khó liên tục (Continuous Logit Difficulty)...")
    
    # Gom nhóm tính toán
    q_agg = df.groupby('problem_id')['correct'].agg(['sum', 'count']).reset_index()
    q_agg.columns = ['problem_id', 'total_correct', 'total_attempts']
    
    # Tính p với Laplace Smoothing (alpha=1) để tránh giá trị vô cùng
    alpha = 1
    p_smooth = (q_agg['total_correct'] + alpha) / (q_agg['total_attempts'] + 2 * alpha)
    
    # Tính giá trị Logit trực tiếp
    q_agg['difficulty_logit'] = np.log((1 - p_smooth) / p_smooth)
    
    # Merge giá trị logit vào dataframe chính
    df = df.merge(q_agg[['problem_id', 'difficulty_logit']], on='problem_id', how='left')
    
    print(f"   -> Thống kê Logit: Mean={df['difficulty_logit'].mean():.2f}, "
          f"Min={df['difficulty_logit'].min():.2f}, Max={df['difficulty_logit'].max():.2f}")

    # 4. BIẾN ĐỔI DỮ LIỆU
    print("[4/5] Chuẩn bị dữ liệu cho mô hình...")
    
    # Ở đây chúng ta giữ nguyên skill_name gốc vì không còn phân tầng theo nhãn
    # Nhưng giá trị difficulty_logit sẽ được sử dụng làm đầu vào cho hàm E-step
    df['order_id'] = df['order_id'].astype(np.int64)
    
    return df

if __name__ == "__main__":
  db = next(get_db())
  processor = Preprocessing(db=db)
  df = processor.process_pipeline()
  print(df.head())