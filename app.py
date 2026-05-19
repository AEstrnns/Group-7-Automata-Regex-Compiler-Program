from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    if os.path.exists(os.path.join(app.static_folder, filename)):
        return send_from_directory(app.static_folder, filename)
    return 'File not found', 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
