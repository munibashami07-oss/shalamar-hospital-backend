require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Serve Static Files ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Auth & Appointment API Routes ───────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─── MediAI Chat Route ────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MEDIAI_SYSTEM_PROMPT = `You are MediAI, a warm and knowledgeable health assistant for Shalamar Hospital.

When a patient first describes their symptoms OR shares an image, ALWAYS start by asking them one short triage question to understand severity — for example: "On a scale of 1–10, how bad is your discomfort right now?" or "Are you experiencing any difficulty breathing, chest pain, or feel like you might faint?" — then wait for their response before giving advice.

If the patient shares a photo of a wound, rash, skin condition, or injury:
- Carefully analyze what is visible in the image
- Describe what you observe in a calm, non-alarming way
- Suggest what the condition might be (never definitively diagnose)
- Provide appropriate care advice based on what you see
- Always recommend seeing a doctor for anything that looks serious

Once they reply to your triage question, respond using this structure:

1. 🩺 **Understanding Your Condition** — Briefly explain what their symptoms or image might indicate in simple, non-alarming language.
2. 🚑 **Immediate Steps** — List the first things they should do right now.
3. 🏠 **Home Care & Treatment** — Practical home remedies, rest advice, hydration tips, safe over-the-counter options.
4. ⚠️ **Cautions & Things to Avoid** — Warn about things that could make it worse.
5. 🔴 **When to See a Doctor** — Only if symptoms indicate something serious. If emergency-level, skip all other steps and immediately urge them to call 115 or go to the ER.

Always speak in a calm, caring, easy-to-understand tone. Avoid heavy medical jargon.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, image } = req.body;

    const openaiMessages = messages.map((msg, index) => {
      if (image && index === messages.length - 1 && msg.role === 'user') {
        const contentArray = [];
        if (msg.content && msg.content.trim()) {
          contentArray.push({ type: 'text', text: msg.content });
        } else {
          contentArray.push({ type: 'text', text: 'Please analyze this image and help me understand what you see.' });
        }
        contentArray.push({ type: 'image_url', image_url: { url: image, detail: 'high' } });
        return { role: 'user', content: contentArray };
      }
      return { role: msg.role === 'ai' ? 'assistant' : msg.role, content: msg.content };
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: MEDIAI_SYSTEM_PROMPT }, ...openaiMessages],
      max_tokens: 600
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Page Routes ─────────────────────────────────────────────────
// Landing page (root)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Auth page (login/signup)
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Appointment booking page (protected — JWT checked client-side)
app.get('/appointment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'appointment.html'));
});

// MediAI page
app.get('/mediai', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mediai.html'));
});

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Shalamar Hospital server is running', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Start Server ────────────────────────────────────────────────
async function startServer() {
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🏥  Shalamar Hospital — Unified Server');
    console.log(`🌐  http://localhost:${PORT}`);
    console.log('📋  Pages: /  |  /auth  |  /appointment  |  /mediai');
  });
}

startServer();
