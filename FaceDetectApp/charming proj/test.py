import pymongo
myclient = pymongo.MongoClient("mongodb+srv://skdev:skdev123456789@skmongocluster.skdn9.mongodb.net/")

DBlists = myclient.list_database_names()
print(DBlists)
DBname = DBlists[0]
mydb = myclient(DBname)

print(mydb.list_collection_names())