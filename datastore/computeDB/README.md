
##=================================================
## Note: Table field name is case-sensitive and it has to match to the kafka json message
##=================================================
##Command to start ComputeDB
##=================================================
cd ComputeDB_EE/1.1.0/TIB_compute_1.1.0_linux
./sbin/snappy-start-all.sh

##=================================================
##Scala command in spark-shell to process the stream from Kafka
##=================================================
./bin/spark-shell
import org.apache.spark.sql.SnappySession
import org.apache.spark.sql.functions.from_json
import org.apache.spark.sql.streaming.ProcessingTime
val snappy = new SnappySession(sc)
snappy.sql("create table if not exists tibcolabs_air(ID string, DEVICE string, ORIGIN string, SENSOR_ORIGIN string, SENSOR_DEVICE string, NAME string, VALUE string)")
val schema = snappy.table("tibcolabs_air").schema
val df = snappy.readStream.format("kafka").option("kafka.bootstrap.servers", "localhost:9092").option("startingOffsets", "earliest").option("subscribe", "tibcolabs_air").option("maxOffsetsPerTrigger", 100).option("failOnDataLoss", "false").load()
val person = df.selectExpr("CAST(value AS STRING)").select(from_json(col("value"), schema).as("data")).select("data.*")
val query = person.writeStream.format("console").outputMode("append").start().awaitTermination()





##=================================================
##Test result
##=================================================
scala> import org.apache.spark.sql.SnappySession
import org.apache.spark.sql.SnappySession

scala> import org.apache.spark.sql.functions.from_json
import org.apache.spark.sql.functions.from_json

scala> import org.apache.spark.sql.streaming.ProcessingTime
import org.apache.spark.sql.streaming.ProcessingTime

scala> val snappy = new SnappySession(sc)
snappy: org.apache.spark.sql.SnappySession = org.apache.spark.sql.SnappySession@52b4da7c

scala>

scala> snappy.sql("create table if not exists json_table(ID int, FIRSTNAME string, MIDDLENAME string, LASTNAME string, DOB_YEAR int, DOB_MONTH int, GENDER string, SALARY int)")
res0: org.apache.spark.sql.DataFrame = []

scala> val schema = snappy.table("json_table").schema
schema: org.apache.spark.sql.types.StructType = StructType(StructField(ID,IntegerType,true), StructField(FIRSTNAME,StringType,true), StructField(MIDDLENAME,StringType,true), StructField(LASTNAME,StringType,true), StructField(DOB_YEAR,IntegerType,true), StructField(DOB_MONTH,IntegerType,true), StructField(GENDER,StringType,true), StructField(SALARY,IntegerType,true))

scala> val df = snappy.readStream.format("kafka").option("kafka.bootstrap.servers", "localhost:9092").option("startingOffsets", "earliest").option("subscribe", "json_topic").option("maxOffsetsPerTrigger", 100).load()
df: org.apache.spark.sql.DataFrame = [key: binary, value: binary ... 5 more fields]

scala> val person = df.selectExpr("CAST(value AS STRING)").select(from_json(col("value"), schema).as("data")).select("data.*")
person: org.apache.spark.sql.DataFrame = [ID: int, FIRSTNAME: string ... 6 more fields]

scala> val query = person.writeStream.format("console").outputMode("append").start().awaitTermination()
-------------------------------------------
Batch: 0
-------------------------------------------
+----+---------+----------+--------+--------+---------+------+------+
|  ID|FIRSTNAME|MIDDLENAME|LASTNAME|DOB_YEAR|DOB_MONTH|GENDER|SALARY|
+----+---------+----------+--------+--------+---------+------+------+
|null|     null|      null|    null|    null|     null|  null|  null|
|null|     null|      null|    null|    null|     null|  null|  null|
|null|     null|      null|    null|    null|     null|  null|  null|
+----+---------+----------+--------+--------+---------+------+------+

-------------------------------------------
Batch: 1
-------------------------------------------
+---+---------+----------+--------+--------+---------+------+------+
| ID|FIRSTNAME|MIDDLENAME|LASTNAME|DOB_YEAR|DOB_MONTH|GENDER|SALARY|
+---+---------+----------+--------+--------+---------+------+------+
|  4|     Alan|   Siu Lun|     Lee|    2011|        3|     M|  2000|
+---+---------+----------+--------+--------+---------+------+------+

[ec2-user@ip-172-31-89-234 TIB_compute_1.1.0_linux]$
