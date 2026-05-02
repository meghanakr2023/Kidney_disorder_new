import os
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise Exception("MONGODB_URI not found in .env")
        _client = MongoClient(uri)
        _db = _client["kidneyscan"]
        print("MongoDB connected successfully!")
    return _db


def save_scan(data: dict) -> str:
    db = get_db()
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()
    result = db.scans.insert_one(data)
    print(f"Scan saved to MongoDB: {result.inserted_id}")
    return str(result.inserted_id)


def update_scan(scan_id: str, update_data: dict):
    db = get_db()
    update_data["updated_at"] = datetime.utcnow()
    db.scans.update_one(
        {"_id": ObjectId(scan_id)},
        {"$set": update_data}
    )
    print(f"Scan updated in MongoDB: {scan_id}")


def get_scan(scan_id: str) -> dict:
    db = get_db()
    doc = db.scans.find_one({"_id": ObjectId(scan_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


def get_all_scans() -> list:
    db = get_db()
    scans = list(db.scans.find().sort("created_at", -1))
    for s in scans:
        s["_id"] = str(s["_id"])
    return scans


def append_chat_message(scan_id: str, message: dict):
    db = get_db()
    message["timestamp"] = datetime.utcnow().isoformat()
    db.scans.update_one(
        {"_id": ObjectId(scan_id)},
        {
            "$push": {"chat_history": message},
            "$set":  {"updated_at": datetime.utcnow()}
        }
    )


def delete_scan(scan_id: str):
    db = get_db()
    db.scans.delete_one({"_id": ObjectId(scan_id)})
    print(f"Scan deleted from MongoDB: {scan_id}")