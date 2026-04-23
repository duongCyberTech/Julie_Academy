from config.env import settings
from config.builder import spark
import pandas as pd

class DataExtraction:
  def __init__(self):
    self.BATCH_SIZE = 50000
    self.postgres_properties = {
      "user": settings.DB_USER,
      "password": settings.DB_PASS,
      "driver": settings.DB_DRIVER
    }

  def sql_query(self):
    return f"""
      (
        WITH Filtered_Exam_Taken AS (
            SELECT 
                et_id,
                student_uid,
                exam_id,
                session_id,
                ROW_NUMBER() OVER (
                    PARTITION BY student_uid, exam_id, session_id 
                    ORDER BY "startAt" DESC 
                ) as rn
            FROM public."Exam_taken"
        )
        SELECT
            st.uid as user_id,
            ques.category_id as skill,
            ques.ques_id as problem_id,
            qet.chosen_answer_at as order_id,
            qet.index as index,
            qet."isCorrect" as correct
        FROM Filtered_Exam_Taken as et
        JOIN public."Student" as st ON et.student_uid = st.uid
        JOIN public."Question_for_exam_taken" as qet ON qet.et_id = et.et_id
        JOIN public."Questions" as ques ON ques.ques_id = qet.ques_id
        WHERE ques.category_id IS NOT NULL
          AND (
              (et.exam_id IS NULL AND et.session_id IS NULL) 
              OR et.rn = 1
          )
        LIMIT({self.BATCH_SIZE})
      ) as src_query
    """

  def datasource(self) -> pd.DataFrame:
    print("Extracting data from System Database...")
    query = self.sql_query()

    return spark.read.jdbc(
      url=settings.SRC_URL,
      table=query,
      properties=self.postgres_properties
    )
