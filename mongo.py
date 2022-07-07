import pymongo
myclient = pymongo.MongoClient("mongodb+srv://skdev:skdev123456789@skmongocluster.skdn9.mongodb.net/?retryWrites=true&w=majority")
mydb = myclient["FaceAttendance"]
mycol = mydb["users"]

for x in mycol.find({},{ "_id": 0, "name": 1, "studentID": 1, "httpProfilePath": 1 }):
    try :
        print("http://skpcxv.thddns.net:7880" + x["httpProfilePath"])
    except:
        print("error", x["studentID"], x["name"])













