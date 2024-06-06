import nltk
from nltk.tokenize import word_tokenize
from datasketch import MinHash

def preprocess(text):
    # Tokenize the text into words
    words = word_tokenize(text.lower())
    # Remove stopwords and punctuation
    stopwords = nltk.corpus.stopwords.words('english')
    words = [word for word in words if word.isalnum() and word not in stopwords]
    return words
list
def minhash(text, num_perm):
    # Preprocess the text
    words = preprocess(text)
    # Create a MinHash object
    mh = MinHash(num_perm=num_perm)
    # Update the MinHash object with the words
    for word in words:
        mh.update(word.encode('utf8'))
    return mh

def similarity(mh1, mh2):
    # Calculate the Jaccard similarity between two MinHash objects
    return mh1.jaccard(mh2)

# Example usage
text1 = "This is a unique and original sentence."
text2 = "This is a 'original' and 'unique' sentence."
# Number of permutations for MinHash
num_perm = 128

# Calculate the MinHash for each document
minhash1 = minhash(text1, num_perm)
minhash2 = minhash(text2, num_perm)

# Calculate the similarity between the documents
sim = similarity(minhash1, minhash2)

print(f"Similarity: {sim}")