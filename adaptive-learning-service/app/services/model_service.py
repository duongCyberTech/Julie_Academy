import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.repositories.metadata_repository import MetadataRepository
from app.services.preprocessing_service import Preprocessing

class BKTModelTraining:
  def __init__(self, db: Session):
    self.SEED = 42           
    self.NUM_FITS = 10       
    self.DEFAULTS = {'order_id': 'order_id'} 
    self.meta_repo = MetadataRepository(db=db)
    self.preprocessing = Preprocessing(db=db)

  def load_dataset(self) -> pd.DataFrame:
    """Đọc file CSV và chuẩn hóa cột thời gian (timestamp)."""
    return self.preprocessing.process_pipeline()
  
  def load_params(self) -> pd.DataFrame:
    return self.meta_repo.get_many()
  
  def extract_skill_and_level(self, text: str):
    # Convert the split list into a pandas Series
    return pd.Series(text.rsplit('_', 1))
  
  def bkt_forward_proc(self):
    print("[5/5] Performing Full BKT Forward Procedure (E-Step)...")
    df = self.load_dataset()
    params_df = self.load_params()
    dict_params = params_df.set_index('skill').to_dict('index')

    def process_group(group):
      skill = group['skill_name'].iloc[0]
      if skill not in dict_params: return None
      
      p = dict_params[skill]
      p_L = p['p_init']
      p_T = p['p_transit']
      beta_g = np.log(p['p_guess'] / (1 - p['p_guess']))
      beta_s = np.log(p['p_slip'] / (1 - p['p_slip']))

      # Khởi tạo bộ đếm stats cho 4 tham số
      stats = {
        'g_num': 0, 'g_den': 0, 's_num': 0, 's_den': 0,
        't_num': 0, 't_den': 0, 'i_num': 0, 'i_den': 0
      }
      
      for i, (_, row) in enumerate(group.iterrows()):
        obs = row['correct']
        d_i = row['difficulty_logit']
        
        p_G_i = 1 / (1 + np.exp(-(beta_g - d_i)))
        p_S_i = 1 / (1 + np.exp(-(beta_s + d_i)))

        # --- E-Step: Posterior Calculation ---
        if obs == 1:
          p_L_obs = (p_L * (1 - p_S_i)) / (p_L * (1 - p_S_i) + (1 - p_L) * p_G_i)
          stats['g_num'] += (1 - p_L_obs)
        else:
          p_L_obs = (p_L * p_S_i) / (p_L * p_S_i + (1 - p_L) * (1 - p_G_i))
          stats['s_num'] += p_L_obs
        
        stats['g_den'] += (1 - p_L_obs)
        stats['s_den'] += p_L_obs

        # Thống kê cho P_init (chỉ lấy dòng đầu tiên của user-skill)
        if i == 0:
          stats['i_num'] += p_L_obs
          stats['i_den'] += 1
        
        # Thống kê cho P_transit (Xác suất chuyển trạng thái)
        p_not_known_before = 1 - p_L
        # Kỳ vọng học sinh "vừa học được"
        p_learned = (p_T * p_not_known_before) / (p_L + p_T * p_not_known_before)
        stats['t_num'] += p_learned
        stats['t_den'] += p_not_known_before

        # --- Transition for next step ---
        p_L = p_L_obs + (1 - p_L_obs) * p_T

      return pd.Series(stats)

    stats_df = df.groupby(['user_id', 'skill_name']).apply(process_group).reset_index()
    final_stats = stats_df.groupby('skill_name').sum().reset_index()
    return final_stats

  def bkt_m_step_update(self, final_stats_df):
    print("--- M-STEP: UPDATING ALL 4 PARAMS ---")
    current_params = self.load_params()
    update_df = final_stats_df.merge(current_params, left_on='skill_name', right_on='skill')

    # Tỉ lệ cập nhật khác nhau
    ETA_QUESTION = 0.15  # Guess, Slip thay đổi theo câu hỏi (nhanh)
    ETA_LEARNING = 0.05  # Init, Transit thay đổi theo tệp khách hàng/giáo trình (chậm)

    def update_logic(row):
      # 1. Update Guess & Slip
      batch_g = row['g_num'] / row['g_den'] if row['g_den'] > 0 else row['p_guess']
      new_g = (1 - ETA_QUESTION) * row['p_guess'] + ETA_QUESTION * batch_g
      
      batch_s = row['s_num'] / row['s_den'] if row['s_den'] > 0 else row['p_slip']
      new_s = (1 - ETA_QUESTION) * row['p_slip'] + ETA_QUESTION * batch_s

      # 2. Update Init & Transit
      batch_i = row['i_num'] / row['i_den'] if row['i_den'] > 0 else row['p_init']
      new_i = (1 - ETA_LEARNING) * row['p_init'] + ETA_LEARNING * batch_i
      
      batch_t = row['t_num'] / row['t_den'] if row['t_den'] > 0 else row['p_transit']
      new_t = (1 - ETA_LEARNING) * row['p_transit'] + ETA_LEARNING * batch_t

      return pd.Series({
        'new_p_init': np.clip(new_i, 0.01, 0.9),
        'new_p_transit': np.clip(new_t, 0.01, 0.3),
        'new_p_guess': np.clip(new_g, 0.01, 0.45),
        'new_p_slip': np.clip(new_s, 0.01, 0.45)
      })

    results = update_df.apply(update_logic, axis=1)
    update_df = pd.concat([update_df, results], axis=1)

    # Lưu vào Database
    for _, row in update_df.iterrows():
      self.meta_repo.update_full_params(
        skill=row['skill_name'],
        p_init=row['new_p_init'],
        p_transit=row['new_p_transit'],
        p_guess=row['new_p_guess'],
        p_slip=row['new_p_slip']
      )
    
    return update_df
