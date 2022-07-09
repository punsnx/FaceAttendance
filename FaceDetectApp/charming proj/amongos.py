import pymongo

myclient = pymongo.MongoClient("mongodb+srv://skdev:skdev123456789@skmongocluster.skdn9.mongodb.net/?retryWrites=true&w=majority")
mydb = myclient["FaceAttendance"]
workcol = mydb["Attendance"]
mycol = mydb["users"]

http = "http://skpcxv.thddns.net:7880"
checkin = {"ID": "อย่าอ้วนดิ้","Stamp":"3 วันที่แล้ว"}
workcol.insert_one(checkin)

for x in mycol.find({},{ "_id": 0, "name": 1, "httpProfilePath": 1 }):
    try:
        print(http +x["httpProfilePath"])
    except:
        print("error", x["name"])

