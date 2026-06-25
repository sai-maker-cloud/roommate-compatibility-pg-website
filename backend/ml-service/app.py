from fastapi import FastAPI
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI()


@app.post("/cluster")
def cluster(data: dict):

    vector = data["vector"]

    # Dummy cluster for now

    return {
        "cluster": 1
    }



@app.post("/similarity")
def similarity(data: dict):

    user_vector = np.array(
        data["userVector"]
    ).reshape(1,-1)

    candidate_vector = np.array(
        data["candidateVector"]
    ).reshape(1,-1)

    score = cosine_similarity(
        user_vector,
        candidate_vector
    )[0][0]

    return {
        "score": round(score*100,2)
    }