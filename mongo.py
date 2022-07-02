import pymongo
myclient = pymongo.MongoClient("mongodb+srv://skdev:skdev123456789@skmongocluster.skdn9.mongodb.net/?retryWrites=true&w=majority")
mydb = myclient["FaceAttendance"]
mycol = mydb["users"]

x = mycol.find_one()

print(x)

















