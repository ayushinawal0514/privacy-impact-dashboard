from flask import Flask, request, jsonify
from pymongo import MongoClient
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/healthcare_compliance")
ANOMALY_THRESHOLD = 0.7  # Anomaly score threshold

# MongoDB connection
try:
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client.healthcare_compliance
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.error(f"MongoDB connection failed: {e}")

# Initialize Isolation Forest model
model = IsolationForest(contamination=0.1, random_state=42)
scaler = StandardScaler()
model_trained = False


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()}), 200


@app.route("/api/train", methods=["POST"])
def train_model():
    """Train anomaly detection model on historical data"""
    try:
        logger.info("Starting model training...")

        # Get access logs from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        logs = list(
            db.access_logs.find(
                {"timestamp": {"$gte": thirty_days_ago}},
                limit=10000
            )
        )

        if len(logs) < 100:
            return jsonify({"error": "Insufficient data for training"}), 400

        # Feature extraction
        features = []
        for log in logs:
            feature_vector = extract_features(log)
            features.append(feature_vector)

        # Train model
        X = np.array(features)
        X_scaled = scaler.fit_transform(X)
        model.fit(X_scaled)

        global model_trained
        model_trained = True

        # Save model metadata
        db.models.update_one(
            {"type": "isolation_forest"},
            {
                "$set": {
                    "type": "isolation_forest",
                    "trained_at": datetime.utcnow(),
                    "training_samples": len(logs),
                    "feature_count": len(features[0]) if features else 0,
                    "status": "active"
                }
            },
            upsert=True
        )

        logger.info(f"Model trained successfully with {len(logs)} samples")
        return jsonify({
            "status": "trained",
            "samples": len(logs),
            "features": len(features[0]) if features else 0
        }), 200

    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict", methods=["POST"])
def predict_anomaly():
    """Predict if an access event is anomalous"""
    try:
        if not model_trained:
            return jsonify({"error": "Model not trained yet"}), 400

        data = request.json
        access_log = {
            "user_id": data.get("userId"),
            "system_id": data.get("systemId"),
            "action": data.get("action"),
            "timestamp": datetime.fromisoformat(data.get("timestamp", datetime.utcnow().isoformat())),
            "data_volume": data.get("dataVolume", 0),
            "ip_address": data.get("ipAddress", ""),
            "duration": data.get("duration", 0),
        }

        # Extract features
        features = extract_features(access_log)
        X = np.array([features])
        X_scaled = scaler.transform(X)

        # Get anomaly score (-1 for anomaly, 1 for normal)
        prediction = model.predict(X_scaled)[0]
        score = -model.score_samples(X_scaled)[0]

        is_anomaly = score > ANOMALY_THRESHOLD

        # Log prediction
        db.anomaly_records.insert_one({
            "access_log": access_log,
            "prediction": prediction,
            "score": float(score),
            "is_anomaly": is_anomaly,
            "timestamp": datetime.utcnow()
        })

        return jsonify({
            "is_anomaly": is_anomaly,
            "score": float(score),
            "threshold": ANOMALY_THRESHOLD,
            "prediction": int(prediction)
        }), 200

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/analyze", methods=["POST"])
def analyze_access_patterns():
    """Analyze access patterns for risk detection"""
    try:
        data = request.json
        user_id = data.get("userId")
        days = data.get("days", 7)

        # Get user's access logs
        start_date = datetime.utcnow() - timedelta(days=days)
        logs = list(
            db.access_logs.find({
                "user_id": user_id,
                "timestamp": {"$gte": start_date}
            })
        )

        if not logs:
            return jsonify({"message": "No access logs found"}), 404

        # Calculate statistics
        daily_accesses = {}
        hourly_distribution = {}
        accessed_systems = set()
        total_data_accessed = 0

        for log in logs:
            # Daily aggregation
            day = log["timestamp"].date()
            daily_accesses[str(day)] = daily_accesses.get(str(day), 0) + 1

            # Hourly distribution
            hour = log["timestamp"].hour
            hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1

            # Accessed systems
            if "systemId" in log:
                accessed_systems.add(str(log["systemId"]))

            # Total data volume
            total_data_accessed += log.get("dataAccessed", {}).get("length", 0) or len(log.get("dataAccessed", []))

        # Calculate anomaly indicators
        avg_daily = len(logs) / days
        std_daily = np.std(list(daily_accesses.values())) if daily_accesses else 0

        return jsonify({
            "user_id": user_id,
            "period_days": days,
            "total_accesses": len(logs),
            "average_daily_accesses": float(avg_daily),
            "std_deviation": float(std_daily),
            "accessed_systems": list(accessed_systems),
            "total_data_accessed": int(total_data_accessed),
            "hourly_distribution": hourly_distribution,
            "daily_accesses": daily_accesses,
            "risk_indicators": detect_risk_indicators(logs)
        }), 200

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({"error": str(e)}), 500


def extract_features(access_log):
    """Extract numerical features from access log"""
    features = [
        access_log.get("duration", 0),  # Duration in minutes
        access_log.get("data_volume", 0),  # Data accessed volume
        access_log["timestamp"].hour,  # Hour of day
        access_log["timestamp"].weekday(),  # Day of week
        1 if access_log.get("action") == "export" else 0,  # Is export
        1 if access_log.get("action") == "delete" else 0,  # Is delete
    ]
    return features


def detect_risk_indicators(logs):
    """Detect risk indicators in access patterns"""
    indicators = []

    if not logs:
        return indicators

    # Bulk access indicator
    large_accesses = [log for log in logs if log.get("data_volume", 0) > 1000]
    if len(large_accesses) > 3:
        indicators.append({
            "type": "bulk_access",
            "severity": "high",
            "count": len(large_accesses)
        })

    # Unusual hours indicator
    hours = [log["timestamp"].hour for log in logs]
    off_hours = [h for h in hours if h < 6 or h > 22]
    if len(off_hours) / len(logs) > 0.3:
        indicators.append({
            "type": "off_hours_access",
            "severity": "medium",
            "percentage": len(off_hours) / len(logs) * 100
        })

    # Export/Delete surge
    sensitive_actions = [log for log in logs if log.get("action") in ["export", "delete"]]
    if len(sensitive_actions) > 5:
        indicators.append({
            "type": "sensitive_actions",
            "severity": "high",
            "count": len(sensitive_actions)
        })

    return indicators


@app.route("/api/status", methods=["GET"])
def model_status():
    """Get model status"""
    try:
        model_info = db.models.find_one({"type": "isolation_forest"})
        return jsonify({
            "trained": model_trained,
            "model_info": model_info if model_info else {}
        }), 200
    except Exception as e:
        logger.error(f"Status error: {e}")
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    # Train model on startup
    with app.app_context():
        try:
            train_model_request = type('obj', (object,), {'json': {}})()
            train_model()
        except Exception as e:
            logger.warning(f"Failed to train model on startup: {e}")

    app.run(host="0.0.0.0", port=5000, debug=False)
