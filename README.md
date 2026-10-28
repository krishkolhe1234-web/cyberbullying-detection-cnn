# CyberShield — Deep Learning-Based Cyberbullying Detection and Prevention in a Chat Room

**CyberShield** is an end-to-end, real-time chat application designed to detect and prevent cyberbullying in online conversations. Built with a custom 1-Dimensional Convolutional Neural Network (1D CNN) trained from scratch on mixed **English and Hinglish** social media text, the application enforces a strict **server-side moderation interceptor**: every message is classified prior to broadcasting to ensure harmful content is blocked before other users ever see it.

---

## 1. Project Overview & Key Features

- **Custom 1D CNN Architecture (Trained from Scratch):**
  Uses learnable embedding representations, 1D convolution filters, and global max-pooling to detect toxic and abusive n-gram patterns in real time without heavy, high-latency transformer dependencies.
- **Bilingual & Hinglish Preprocessing:**
  Specifically accounts for colloquial Hindi-English code-mixed phrases (e.g., phonetic spelling) while strictly protecting negation words (`not`, `nahi`, `nahin`, `mat`, `na`, `never`) and abusive vocabulary.
- **Server-Side Message Interceptor:**
  Messages are **never** broadcast blindly. The Flask-SocketIO backend intercepts each message, executes CNN inference, and either broadcasts safe messages to the room or issues a private warning to the sender.
- **"STOP BULLYING!" Warning & Correction Workflow:**
  When abusive language is detected, the sender receives a private warning:
  > **STOP BULLYING!**  
  > *"Your message may contain cyberbullying or abusive language. It was blocked from being sent."*
  
  The sender is provided with an editable interface to rephrase their message constructively. Other users never see the blocked message or warning.
- **Dual Communication Modes:**
  - **Real-Time WebSocket Chat:** Low-latency room-based communication using Socket.IO.
  - **REST API Inspector:** Dedicated `/api/predict` and `/api/health` endpoints to test the model independently.
- **College Mini-Project Viva Defense Ready:**
  Includes full architecture breakdowns, class weight explanation, and interactive model inspection for presentations.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Vanilla CSS with custom properties (Dark theme: Navy `#070d1e`, Cyan `#00f5d4`, Blue `#00b4d8`)
- **Networking:** Socket.IO Client (`socket.io-client`)
- **Icons:** Lucide React (`lucide-react`)

### Backend
- **Framework:** Python 3.13 + Flask + Flask-SocketIO
- **Deep Learning / NLP:** TensorFlow / Keras 2.21, NumPy, Scikit-learn
- **Server Engine:** `simple-websocket` with threading async mode

---

## 3. Project Structure

```text
CyberShield/
│
├── Dataset/
│   ├── final_dataset_hinglish.csv      # Raw Hinglish & English dataset
│   └── stopwords.txt                  # Stopword reference dictionary
│
├── backend/
│   ├── app.py                         # Flask + Socket.IO server & inference logic
│   ├── requirements.txt               # Backend Python dependencies
│   └── model/
│       ├── cyberbullying_cnn.keras    # Trained 1D CNN Keras model
│       ├── tokenizer.pickle           # Fitted Keras Tokenizer
│       ├── preprocessing_config.json  # Preprocessing hyperparameters & metadata
│       └── stopwords.txt              # Active stopword file
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Top navigation & system status
│   │   │   ├── JoinModal.tsx          # Display name & room entry lobby
│   │   │   ├── ChatMessageItem.tsx    # Message bubbles with safe badge
│   │   │   ├── BlockedWarningModal.tsx# STOP BULLYING! warning & re-editor
│   │   │   ├── ModelInfoSection.tsx   # Viva explanation & architecture info
│   │   │   └── PredictTesterModal.tsx # Standalone REST API inspector
│   │   ├── services/
│   │   │   ├── api.ts                 # REST and Socket.IO connection manager
│   │   │   └── socket.ts
│   │   ├── App.tsx                    # Main chat room coordinator
│   │   ├── main.tsx                   # React entry point
│   │   ├── styles.css                 # Dark theme design system
│   │   └── types.ts                   # TypeScript interfaces
│   ├── index.html                     # HTML root with fonts & metadata
│   ├── package.json                   # Frontend npm configuration
│   └── vite.config.ts                 # Vite bundler configuration
│
├── venu/                              # Virtual environment (Python 3.13)
├── training.ipynb                     # Completed training pipeline notebook
└── README.md                          # Documentation & execution guide
```

---

## 4. Deep Learning Model Integration

### 4.1 Architecture
The model is a custom 1D CNN compiled with Binary Cross-Entropy loss and the Adam optimizer:
$$\text{Raw Text} \xrightarrow{\text{Clean Text}} \text{Tokenizer} \xrightarrow{\text{Pad (len=100)}} \text{Embedding (128D)} \xrightarrow{\text{Conv1D (128 filters, kernel 5)}} \text{ReLU} \xrightarrow{\text{GlobalMaxPool1D}} \text{Dense (64)} \xrightarrow{\text{Dropout (0.5)}} \text{Sigmoid Output}$$

### 4.2 Label Mapping & Threshold
- **Class 0 (Non-Bullying):** Probability $< 0.50$ (Safe to broadcast)
- **Class 1 (Cyberbullying):** Probability $\ge 0.50$ (Blocked by server interceptor)

### 4.3 Preprocessing Rules
1. **Negation Preservation:** Words such as `not`, `no`, `nahi`, `nahin`, `na`, `mat`, `never`, `neither` are explicitly exempted from stopword filtering to maintain semantic integrity.
2. **Abusive Vocabulary Retained:** Offensive words are retained during cleaning so the convolutional filters can identify bullying patterns.

---

## 5. Execution Instructions (Windows)

The application requires running the backend and frontend in two separate terminals.

### Step 1: Start Backend (Terminal 1)

Open PowerShell in the project root (`d:\Cyber Bully`):

```powershell
# 1. Activate the Python virtual environment
.\venu\Scripts\activate

# 2. Run the Flask-SocketIO backend
python backend/app.py
```

*The backend server will start on `http://127.0.0.1:5000` and load the trained CNN model into memory.*

---

### Step 2: Start Frontend (Terminal 2)

Open a second PowerShell terminal in `d:\Cyber Bully\frontend`:

```powershell
# 1. Navigate to the frontend directory
cd frontend

# 2. Start the Vite development server
npm run dev
```

*The frontend application will be accessible in your web browser at `http://127.0.0.1:5173`.*

---

## 6. How to Test the Application

### Test 1 — Safe Message Delivery
1. Join room as **Alice**.
2. Send: `Hello everyone, how are you?`
3. **Result:** Message is classified as Safe (probability $\approx 0.20 < 0.50$) and immediately broadcast to the room.

### Test 2 — Cyberbullying Blocking (English)
1. Send: `You are a stupid piece of shit go to hell`
2. **Result:** Backend blocks the message. Alice receives the **STOP BULLYING!** dialog showing AI confidence ($\approx 97\%$). Other room participants receive nothing.

### Test 3 — Cyberbullying Blocking (Hinglish)
1. Send: `deepak chahal se bada chutiya nahi dekha`
2. **Result:** Backend detects Hinglish abusive slang (probability $\approx 99.6\%$) and blocks delivery.

### Test 4 — Negation Sentence Handling
1. Send: `This is not bad at all`
2. **Result:** The negation word `not` is preserved; the model evaluates the sentence context and allows delivery (probability $\approx 0.08 < 0.50$).

### Test 5 — Multi-User Real-Time Test
1. Open `http://127.0.0.1:5173` in two separate browser tabs (e.g. Tab 1 as **Alice**, Tab 2 as **Bob**).
2. Send safe messages between Alice and Bob $\rightarrow$ both see them.
3. Send an abusive message from Alice $\rightarrow$ only Alice sees the blocked warning dialog; Bob's chat window remains clean.

### Test 6 — Standalone REST API Test
You can query the backend directly without using the chat UI:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/predict" -Method Post -ContentType "application/json" -Body '{"text": "Hello world"}'
```

---

## 7. Known Limitations

1. **Colloquial Dialect Variations:** Extreme misspellings or creative character substitutions (e.g. `f*ck`, `b!tch`) may reduce classification confidence if unseen during training.
2. **Context-Free Evaluation:** The model evaluates each comment individually. It does not track long-term conversational history across multiple days.
3. **False Positives / Negatives:** In complex linguistic contexts involving sarcasm, irony, or friendly banter, classification discrepancies may occur.
