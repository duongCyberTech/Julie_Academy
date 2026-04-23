from components.extract import DataExtraction
from pyspark.sql.functions import col, coalesce, current_timestamp

class DataTransformation:
  def __init__(self):
    self.extract = DataExtraction()

  def transform(self):
    df_src = self.extract.datasource()
    print("\n======================\n")
    df_src.printSchema()
    df_src.show(5)
    print("\n======================\n")
    print("\nTransform data...")
    df_sections = df_src.select("skill").distinct()

    df_training_data = df_src.select('skill', 'problem_id', 'order_id', 'index', 'correct', 'user_id')
    df_training_data = df_training_data.withColumnRenamed("skill", "section_id")

    df_training_data = df_training_data.withColumn(
      "order_id", 
      coalesce(col("order_id"), current_timestamp())
    )
    print("\n======================\n")
    df_sections.printSchema()
    df_sections.show(5)
    df_training_data.printSchema()
    df_training_data.show(5)
    print("\n======================\n")
    return {
      "df_sections": df_sections,
      "df_training_data": df_training_data
    }

