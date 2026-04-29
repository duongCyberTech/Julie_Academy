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
    print("[5/5] Performing Full BKT Forward Procedure (E-Step) per User-Skill...")
    df = self.load_dataset()
    if df.empty:
      print("Cảnh báo: Không có dữ liệu trong 24 giờ qua.")
      return df

    params_df = self.load_params() # Đảm bảo params_df có cột 'user_id' và 'skill'
    if params_df.empty: return pd.DataFrame()
    
    # Tạo dictionary với composite key: (user_id, skill)
    # Nếu params_df chứa tham số mặc định chung (global) cho skill, hãy để user_id của dòng đó là None hoặc 'GLOBAL'
    dict_params = params_df.set_index(['user_id', 'skill']).to_dict('index')

    def process_group(group):
      user_id = group['user_id'].iloc[0]
      skill = group['skill_name'].iloc[0]
      
      # Logic Fallback: Tìm param của user đó, nếu không có thì lấy param chung của skill
      if (user_id, skill) in dict_params:
        p = dict_params[(user_id, skill)]
      elif ('GLOBAL', skill) in dict_params: # Giả định bạn có lưu param gốc với user_id = 'GLOBAL'
        p = dict_params[('GLOBAL', skill)]
      else:
        return None # Bỏ qua nếu skill này hoàn toàn không tồn tại trong metadata
      
      p_L = p['p_init']
      p_T = p['p_transit']
      beta_g = np.log(p['p_guess'] / (1 - p['p_guess']))
      beta_s = np.log(p['p_slip'] / (1 - p['p_slip']))

      stats = {
        'g_num': 0, 'g_den': 0, 's_num': 0, 's_den': 0,
        't_num': 0, 't_den': 0, 'i_num': 0, 'i_den': 0
      }
      
      for i, (_, row) in enumerate(group.iterrows()):
        obs = row['correct']
        d_i = row['difficulty_logit']
        
        p_G_i = 1 / (1 + np.exp(-(beta_g - d_i)))
        p_S_i = 1 / (1 + np.exp(-(beta_s + d_i)))

        if obs == 1:
          p_L_obs = (p_L * (1 - p_S_i)) / (p_L * (1 - p_S_i) + (1 - p_L) * p_G_i)
          stats['g_num'] += (1 - p_L_obs)
        else:
          p_L_obs = (p_L * p_S_i) / (p_L * p_S_i + (1 - p_L) * (1 - p_G_i))
          stats['s_num'] += p_L_obs
        
        stats['g_den'] += (1 - p_L_obs)
        stats['s_den'] += p_L_obs

        if i == 0:
          stats['i_num'] += p_L_obs
          stats['i_den'] += 1
        
        p_not_known_before = 1 - p_L
        p_learned = (p_T * p_not_known_before) / (p_L + p_T * p_not_known_before)
        stats['t_num'] += p_learned
        stats['t_den'] += p_not_known_before

        p_L = p_L_obs + (1 - p_L_obs) * p_T

      return pd.Series(stats)

    # Apply theo composite key
    stats_df = df.groupby(['user_id', 'skill_name']).apply(process_group).reset_index()
    if stats_df.empty: return pd.DataFrame()
    
    # Hàm apply trên groupby nhiều cột đã trả về df có sẵn 'user_id' và 'skill_name'
    # Bạn không cần groupby thêm lần nữa trừ khi có trùng lặp batch
    final_stats = stats_df.groupby(['user_id', 'skill_name']).sum().reset_index()
    return final_stats

  def bkt_m_step_update(self, final_stats_df):
    print("--- M-STEP: UPDATING ALL 4 PARAMS PER USER ---")
    if final_stats_df.empty: return
    
    current_params = self.load_params()
    
    # Merge theo Composite Key
    update_df = final_stats_df.merge(
      current_params, 
      left_on=['user_id', 'skill_name'], 
      right_on=['user_id', 'skill'],
      how='left' # Dùng left join để không bị mất các user mới
    )

    ETA_QUESTION = 0.15  
    ETA_LEARNING = 0.05  

    def update_logic(row):
      # Xử lý giá trị NaN cho user mới (fallback về param mặc định của skill)
      # Giả sử bạn có cơ chế điền giá trị mặc định nếu row['p_guess'] bị NaN
      old_g = row['p_guess'] if pd.notnull(row['p_guess']) else 0.2
      old_s = row['p_slip'] if pd.notnull(row['p_slip']) else 0.1
      old_i = row['p_init'] if pd.notnull(row['p_init']) else 0.3
      old_t = row['p_transit'] if pd.notnull(row['p_transit']) else 0.1

      batch_g = row['g_num'] / row['g_den'] if row['g_den'] > 0 else old_g
      new_g = (1 - ETA_QUESTION) * old_g + ETA_QUESTION * batch_g
      
      batch_s = row['s_num'] / row['s_den'] if row['s_den'] > 0 else old_s
      new_s = (1 - ETA_QUESTION) * old_s + ETA_QUESTION * batch_s

      batch_i = row['i_num'] / row['i_den'] if row['i_den'] > 0 else old_i
      new_i = (1 - ETA_LEARNING) * old_i + ETA_LEARNING * batch_i
      
      batch_t = row['t_num'] / row['t_den'] if row['t_den'] > 0 else old_t
      new_t = (1 - ETA_LEARNING) * old_t + ETA_LEARNING * batch_t

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
        user_id=row['user_id'], # Đã sửa lỗi thiếu dấu phẩy ở đây
        p_init=row['new_p_init'],
        p_transit=row['new_p_transit'],
        p_guess=row['new_p_guess'],
        p_slip=row['new_p_slip']
      )
    
    return update_df
