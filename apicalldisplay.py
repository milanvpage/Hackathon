from flask import Flask, render_template, request, jsonify
import requests
import json
import numpy as np
from sklearn.decomposition import PCA

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('frontend.html')


@app.route('/generate-voxel', methods=['POST'])
def generate_voxel():
    text_input = request.form['text']
    print("Received text input:", text_input)  # Debugging statement

    url = 'http://18.226.164.130/generate_output' # change to 18.226.164.130
    payload = {"text": text_input, "output_format": "voxel_grid", "angle": 90}
    print("Calling API...")  # Debugging statement
    try:
        response = requests.post(url, json=payload, timeout=5)  # Adding timeout of 5 seconds
    except requests.Timeout:
        print("Request timed out.")  # Debugging statement
        return jsonify({'error': 'Request timed out'}), 500

    if response.status_code == 200:
        print("Data received successfully.")  # Debugging statement
        data = response.json()
        voxel_grid = np.array(data['voxel_grid'])
        filled = np.argwhere(voxel_grid)
        pca = PCA(n_components=3)
        filled_pca = pca.fit_transform(filled)
        filled_pca -= filled_pca.min(axis=0)
        points = filled_pca.tolist()
        return jsonify(points=points)
    else:
        print("Failed to get voxel grid. Status code:", response.status_code)  # Debugging statement
        return jsonify({'error': 'Failed to get voxel grid'}), 500

if __name__ == '__main__':
    app.run(debug=True)
