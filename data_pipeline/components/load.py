from components.transform import DataTransformation
from config.env import settings

class DataLoader:
  def __init__(self):
    self.transformer = DataTransformation()
    self.target_properties = {
      "user": settings.DB_USER,
      "password": settings.DB_PASS,
      "driver": settings.DB_DRIVER
    }

  def load(self):
    df_transform = self.transformer.transform()

    print("Loading data...")

    df_sections = df_transform["df_sections"]
    df_training_data = df_transform["df_training_data"]

    try:
      df_sections.write.jdbc(
        url=settings.TARGET_URL,
        table="public.sections",
        mode="append",
        properties=self.target_properties
      )
    except: 
      pass

    try:
      df_training_data.write.jdbc(
        url=settings.TARGET_URL,
        table="public.training_data",
        mode="append",
        properties=self.target_properties
      )
    except:
      pass

    print("Loading successfully!")
