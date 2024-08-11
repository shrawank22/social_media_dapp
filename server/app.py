from flask import Flask, request, jsonify
from minhash import minhash, similarity
from pymongo import MongoClient
from datasketch import MinHash
from flask_cors import CORS
import imagehash
from PIL import Image

app = Flask(__name__)
CORS(app) 
# MongoDB connection
client = MongoClient('mongodb+srv://shrawan:shrawanKumar@cluster0.ot6w9.mongodb.net/dapp6?retryWrites=true&w=majority')
db = client['minhash_db']
collection = db['minhashes']

db2 = client['imghhash_db']
image_collection = db2['image_hashes']

@app.route('/check_plagiarism', methods=['POST'])
def check_plagiarism():
    print("the csvfvfbdfb")
    data = request.get_json()
    text1 = data['text1']
    num_perm = data.get('num_perm', 128)

    # Calculate MinHash for the new post
    minhash1 = minhash(text1, num_perm)

    # Convert MinHash object to dictionary
    minhash1_dict = {
        'permutations': minhash1.permutations.tolist(),
        'hashvalues': minhash1.hashvalues.tolist(),
        'seed': minhash1.seed
    }

    # Loop through existing MinHash objects in the database
    for doc in collection.find():
        minhash2_dict = doc['minhash']
        minhash2 = minhash_from_dict(minhash2_dict, num_perm)
        sim = similarity(minhash1, minhash2)
        if sim >= 0.8:
            return jsonify({'plagiarism': True})

    # No plagiarism detected, insert the new MinHash object into the database
    collection.insert_one({'minhash': minhash1_dict})
    return jsonify({'plagiarism': False})

def minhash_from_dict(minhash_dict, num_perm):
    minhash = MinHash(num_perm=num_perm)
    minhash.permutations = minhash_dict['permutations']
    minhash.hashvalues = minhash_dict['hashvalues']
    minhash.seed = minhash_dict['seed']
    return minhash


@app.route('/check_plagiarism_image', methods=['POST'])
def check_plagiarism_image():
    file = request.files.get('image')
    if file:
        image = Image.open(file.stream)
        image_phash = find_phash(image)
        print(image_phash)

        # Loop through existing image hashes in the database
        for doc in image_collection.find():
            stored_phash = imagehash.hex_to_hash(doc['phash'])
            diff = (image_phash - stored_phash) / len(image_phash.hash) ** 2
            if diff < 0.2:
                return jsonify({'plagiarism': True})

        # No image plagiarism detected, insert the new image hash into the database
        image_collection.insert_one({'phash': str(image_phash)})

    return jsonify({'plagiarism': False})


def find_phash(fileContent):
    phash = imagehash.phash(fileContent)
    return phash


if __name__ == '__main__':
    app.run()