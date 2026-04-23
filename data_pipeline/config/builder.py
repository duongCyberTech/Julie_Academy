from pyspark.sql import SparkSession
from config.env import settings, JDBC_JAR_PATH

spark = SparkSession.builder \
      .appName("ETL") \
      .config("spark.jars", f"{JDBC_JAR_PATH}") \
      .getOrCreate()