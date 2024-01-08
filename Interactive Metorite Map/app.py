from flask import Flask, jsonify
from pymongo import MongoClient
from flask_cors import CORS  

app = Flask(__name__)
CORS(app)  

# MongoDB settings
mongo_uri = "mongodb://localhost:27017/"  
db_name = "MeteoriteData"             
collection_name = "Meteorite"    

client = MongoClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]

@app.route('/api/meteor_data', methods=['GET'])
def get_meteor_data():
    try:
        data = list(collection.find({}, {'_id': 0}))  
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
