"""
CyberShield - Backend Application
Flask + Flask-SocketIO backend integrating custom 1D CNN Cyberbullying Detection Model.
"""

import os
import re
import json
import pickle
import logging
from datetime import datetime
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger('CyberShield')

# Initialize Flask & SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cybershield-secret-key-2026')
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Paths configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'cyberbullying_cnn.keras')
TOKENIZER_PATH = os.path.join(MODEL_DIR, 'tokenizer.pickle')
CONFIG_PATH = os.path.join(MODEL_DIR, 'preprocessing_config.json')
STOPWORDS_PATH = os.path.join(MODEL_DIR, 'stopwords.txt')

# Global Model & Preprocessing State
model = None
tokenizer = None
config = {}
active_stopwords = set()
CLASSIFICATION_THRESHOLD = 0.5

# Important negation words that must never be stripped
NEGATION_WORDS = {
    'not', 'no', 'nor', 'neither', 'never', 'none',
    'nahi', 'nahin', 'na', 'mat', 'nhi', 'ni'
}


def load_artifacts():
    """
    Loads model, tokenizer, and preprocessing configuration once at startup.
    """
    global model, tokenizer, config, active_stopwords, CLASSIFICATION_THRESHOLD

    logger.info("Initializing CyberShield Deep Learning Model Artifacts...")

    # Load configuration
    if not os.path.exists(CONFIG_PATH):
        raise FileNotFoundError(f"Configuration file not found: {CONFIG_PATH}")
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        config = json.load(f)
    logger.info("Preprocessing config loaded successfully.")

    # Load Tokenizer
    if not os.path.exists(TOKENIZER_PATH):
        raise FileNotFoundError(f"Tokenizer file not found: {TOKENIZER_PATH}")
    with open(TOKENIZER_PATH, 'rb') as f:
        tokenizer = pickle.load(f)
    logger.info(f"Tokenizer loaded successfully with vocab size: {len(tokenizer.word_index)}")

    # Load Stopwords
    if os.path.exists(STOPWORDS_PATH):
        with open(STOPWORDS_PATH, 'r', encoding='utf-8') as f:
            raw_stopwords = {line.strip().lower() for line in f if line.strip()}
        active_stopwords = raw_stopwords - NEGATION_WORDS
        logger.info(f"Loaded {len(active_stopwords)} active stopwords (negation words preserved).")
    else:
        logger.warning(f"Stopwords file not found at {STOPWORDS_PATH}. Operating without stopword filtering.")

    # Load 1D CNN Model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Trained CNN model not found: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    logger.info("Custom 1D CNN model loaded successfully and ready for real-time inference.")


# Load artifacts immediately
load_artifacts()


def clean_text(text: str) -> str:
    """
    Exact preprocessing logic used during training.ipynb:
    - Handles non-string/empty text
    - Converts to lowercase
    - Removes URLs and HTML tags
    - Strips non-alphanumeric symbols while preserving word tokens
    - Filters stopwords while strictly exempting negation words
    """
    if not isinstance(text, str):
        return ""

    text = text.lower()
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    # Remove special characters, numbers, and punctuation
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    # Tokenize by whitespace
    tokens = text.split()
    # Retain tokens
    retained = [
        w for w in tokens
        if len(w) > 1 and (w not in active_stopwords or w in NEGATION_WORDS)
    ]
    return " ".join(retained)


def classify_text(raw_text: str):
    """
    Performs inference on a message string using the trained 1D CNN.
    Returns:
        dict containing:
            - is_bullying (bool)
            - confidence (float)
            - label (str: 'Cyberbullying' | 'Non-Bullying')
            - cleaned_text (str)
            - error (str or None)
    """
    if not raw_text or not raw_text.strip():
        return {
            'is_bullying': False,
            'confidence': 0.0,
            'label': 'Non-Bullying',
            'cleaned_text': '',
            'error': 'Message is empty or invalid.'
        }

    try:
        cleaned = clean_text(raw_text)
        max_len = config.get('max_sequence_length', 100)
        padding_type = config.get('padding_type', 'post')
        trunc_type = config.get('truncating_type', 'post')

        # Convert to integer sequence
        sequence = tokenizer.texts_to_sequences([cleaned])
        padded = pad_sequences(sequence, maxlen=max_len, padding=padding_type, truncating=trunc_type)

        # Predict probability
        prediction = model.predict(padded, verbose=0)
        prob = float(prediction[0][0])

        is_bullying = (prob >= CLASSIFICATION_THRESHOLD)
        label = "Cyberbullying" if is_bullying else "Non-Bullying"

        return {
            'is_bullying': is_bullying,
            'confidence': round(prob, 4),
            'label': label,
            'cleaned_text': cleaned,
            'error': None
        }
    except Exception as e:
        logger.error(f"Prediction exception occurred: {str(e)}", exc_info=True)
        return {
            'is_bullying': True,  # Fail-safe: do not broadcast if classification fails
            'confidence': 1.0,
            'label': 'Cyberbullying',
            'cleaned_text': '',
            'error': f"Classification failed: {str(e)}"
        }


# ==========================================
# REST API Endpoints
# ==========================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint returning system & model status.
    """
    return jsonify({
        'status': 'online',
        'service': 'CyberShield API',
        'model_loaded': model is not None,
        'tokenizer_loaded': tokenizer is not None,
        'vocab_size': len(tokenizer.word_index) if tokenizer else 0,
        'threshold': CLASSIFICATION_THRESHOLD
    }), 200


@app.route('/api/predict', methods=['POST'])
def predict_endpoint():
    """
    Standalone prediction endpoint for testing and auditing model classifications.
    Expected JSON payload: {"text": "your message here"}
    """
    data = request.get_json(silent=True) or {}
    text = data.get('text', '')

    if not text or not str(text).strip():
        return jsonify({
            'error': 'No text provided. Please provide a non-empty "text" field.'
        }), 400

    result = classify_text(str(text))
    return jsonify({
        'original_text': text,
        'cleaned_text': result['cleaned_text'],
        'is_bullying': result['is_bullying'],
        'confidence': result['confidence'],
        'label': result['label'],
        'threshold': CLASSIFICATION_THRESHOLD,
        'error': result['error']
    }), 200


# ==========================================
# Socket.IO Real-time Chat Room Events
# ==========================================

# Active user tracking (session_id -> user details)
connected_users = {}


@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'connected', 'sid': request.sid})


@socketio.on('disconnect')
def handle_disconnect():
    user = connected_users.pop(request.sid, None)
    if user:
        room = user.get('room')
        username = user.get('username')
        logger.info(f"User {username} disconnected from room {room}")
        emit('user_left', {
            'username': username,
            'message': f"{username} has left the room.",
            'timestamp': datetime.now().strftime("%I:%M %p")
        }, to=room)


@socketio.on('join_room')
def handle_join_room(data):
    """
    Client joins a chat room.
    Payload: {"username": "Alice", "room": "General"}
    """
    username = data.get('username', '').strip()
    room = data.get('room', 'General').strip()

    if not username:
        emit('error_notification', {'message': 'Username is required to join.'})
        return

    join_room(room)
    connected_users[request.sid] = {'username': username, 'room': room}
    logger.info(f"User '{username}' joined room '{room}' (sid: {request.sid})")

    # Notify sender of successful join
    emit('room_joined', {
        'room': room,
        'username': username,
        'timestamp': datetime.now().strftime("%I:%M %p")
    })

    # Broadcast system message to all other users in the room
    emit('user_joined', {
        'username': username,
        'message': f"{username} entered the room.",
        'timestamp': datetime.now().strftime("%I:%M %p")
    }, to=room, include_self=False)


@socketio.on('send_message')
def handle_send_message(data):
    """
    CRITICAL MESSAGE-BLOCKING INTERCEPTOR:
    1. Validates message.
    2. Runs 1D CNN prediction before broadcasting.
    3. If Cyberbullying:
       - DO NOT BROADCAST.
       - Return private warning ONLY to the sender socket.
       - Provide editable message for the sender.
    4. If Safe:
       - Broadcast safe message to all users in the room.
    """
    username = data.get('username', '').strip()
    room = data.get('room', 'General').strip()
    raw_message = data.get('text', '').strip()

    # Reject empty or whitespace-only messages
    if not raw_message:
        emit('error_notification', {'message': 'Cannot send empty message.'})
        return

    logger.info(f"Classifying message from '{username}' in room '{room}'...")

    # Execute custom CNN classification
    classification = classify_text(raw_message)

    # 1. Cyberbullying / Harmful Content Detected
    if classification['is_bullying']:
        logger.warning(
            f"BLOCKED: Cyberbullying detected from '{username}' | "
            f"Confidence: {classification['confidence']} | Text: {raw_message}"
        )
        # Emit private blocked warning ONLY to sender (request.sid)
        emit('message_blocked', {
            'warning_title': 'STOP BULLYING!',
            'warning_message': 'Your message may contain cyberbullying or abusive language. It was blocked from being sent.',
            'original_text': raw_message,
            'confidence': classification['confidence'],
            'cleaned_text': classification['cleaned_text'],
            'timestamp': datetime.now().strftime("%I:%M %p")
        }, to=request.sid)
        # Never broadcast to the room!
        return

    # 2. Safe Message - Broadcast to the chat room
    logger.info(
        f"APPROVED: Safe message from '{username}' | "
        f"Confidence: {classification['confidence']} | Text: {raw_message}"
    )

    message_payload = {
        'id': f"msg_{int(datetime.now().timestamp() * 1000)}_{os.urandom(3).hex()}",
        'username': username,
        'text': raw_message,
        'timestamp': datetime.now().strftime("%I:%M %p"),
        'confidence': classification['confidence'],
        'is_safe': True
    }

    emit('receive_message', message_payload, to=room)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting CyberShield Backend Server on http://127.0.0.1:{port}")
    socketio.run(app, host='127.0.0.1', port=port, debug=False, allow_unsafe_werkzeug=True)
