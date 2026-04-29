import sys
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from pyspark.sql.functions import col, coalesce, current_timestamp
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame

# =========================================================
# 1. INIT
# =========================================================
args = getResolvedOptions(
  sys.argv,
  [
    'JOB_NAME',
    'SRC_CONNECTION',
    'TARGET_CONNECTION'
  ]
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session

job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# =========================================================
# 2. EXTRACT
# =========================================================
print("Extracting data...")

query = """
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
) as src
"""

dyf_src = glueContext.create_dynamic_frame.from_options(
  connection_type="postgresql",
  connection_options={
    "connectionName": args['SRC_CONNECTION'],
    "dbtable": query
  }
)

df_src = dyf_src.toDF()

df_src.printSchema()
df_src.show(5)

# =========================================================
# 3. TRANSFORM
# =========================================================
print("Transforming data...")

df_sections = df_src.select("skill").distinct()

df_training_data = (
  df_src
  .select("skill", "problem_id", "order_id", "index", "correct", "user_id")
  .withColumnRenamed("skill", "section_id")
  .withColumn(
    "order_id",
    coalesce(col("order_id"), current_timestamp())
  )
)

df_sections.show(5)
df_training_data.show(5)

dyf_sections = DynamicFrame.fromDF(df_sections, glueContext, "dyf_sections")
dyf_training = DynamicFrame.fromDF(df_training_data, glueContext, "dyf_training")

# =========================================================
# 4. LOAD
# =========================================================
print("Loading data...")

glueContext.write_dynamic_frame.from_options(
  frame=dyf_sections,
  connection_type="postgresql",
  connection_options={
    "connectionName": args['TARGET_CONNECTION'],
    "dbtable": "public.sections"
  }
)

glueContext.write_dynamic_frame.from_options(
  frame=dyf_training,
  connection_type="postgresql",
  connection_options={
    "connectionName": args['TARGET_CONNECTION'],
    "dbtable": "public.training_data"
  }
)

print("Load completed!")

# =========================================================
# 5. COMMIT
# =========================================================
job.commit()