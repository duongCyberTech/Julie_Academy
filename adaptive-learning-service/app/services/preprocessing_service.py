import pandas as pd
from sqlalchemy.orm import Session
from app.repositories.training_data_repository import TrainingDataRepository

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

    # Mapping cột
    cols_map = {
      'user_id': 'user_id', 'skill': 'skill_name', 'problem_id': 'problem_id',
      'start_time': 'order_id', 'correct': 'correct', 
      'original': 'original', 'attempt_count': 'attempt_count'
    }
    df = df.rename(columns={k: v for k, v in cols_map.items() if k in df.columns})
    df = df.dropna(subset=['user_id', 'skill_name', 'problem_id', 'order_id', 'correct'])
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

    # 3. TÍNH TOÁN ĐỘ KHÓ 
    print(f"[3/5] Tính toán độ khó (Hard < {self.THRESHOLD_HARD}, Easy > {self.THRESHOLD_EASY})...")
    
    problem_stats = df.groupby('problem_id')['correct'].mean().reset_index()
    problem_stats.columns = ['problem_id', 'pass_rate']
    
    problem_stats['diff_tag'] = problem_stats['pass_rate'].apply(self.get_difficulty_label)
    
    df = df.merge(problem_stats[['problem_id', 'diff_tag']], on='problem_id', how='left')
    
    dist = df['diff_tag'].value_counts()
    print(f"   -> Phân bố: Easy={dist.get('EASY', 0):,}, Medium={dist.get('MEDIUM', 0):,}, Hard={dist.get('HARD', 0):,}")

    print("[4/5] Biến đổi Skill Name...")
    df['skill_name'] = df['skill_name'] + '_' + df['diff_tag']
    
    print(f"   -> Số lượng Skill sau khi phân tầng: {df['skill_name'].nunique()}")

    return df
