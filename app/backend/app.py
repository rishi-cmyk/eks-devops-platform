from flask import Flask, jsonify
import socket

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "message": "EKS DevOps Project Running",
        "hostname": socket.gethostname()
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })

@app.route("/api/status")
def status():
    return jsonify({
        "application": "backend-api",
        "status": "running"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
