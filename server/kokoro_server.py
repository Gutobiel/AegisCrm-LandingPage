import sys
import os
import json

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

import io
import soundfile as sf
import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from kokoro import KPipeline

app = FastAPI(title="Kokoro TTS FastAPI Server (Português-BR)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROFILE_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "active_voice_profile.json"))

DEFAULT_PROFILE = {
    "name": "Locutor Comercial Alex (Padrão)",
    "mode": "single",
    "voice": "pm_alex",
    "voice_blend": { "pm_alex": 1.0, "pf_dora": 0.0, "pm_santa": 0.0 },
    "speed": 1.0,
    "pitch": 1.0,
    "response_format": "wav",
    "trim": True
}

def get_active_profile():
    if os.path.exists(PROFILE_FILE):
        try:
            with open(PROFILE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_PROFILE

def save_active_profile(profile_data):
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile_data, f, indent=2, ensure_ascii=False)

print("[Kokoro-FastAPI] Inicializando KPipeline (lang_code='p') para Português do Brasil...")
pipeline_pt = None
voice_cache = {}

def get_pipeline():
    global pipeline_pt
    if pipeline_pt is None:
        print("[Kokoro-FastAPI] Carregando KPipeline (lang_code='p') para Português do Brasil...")
        pipeline_pt = KPipeline(lang_code='p')
        print("[Kokoro-FastAPI] KPipeline (lang_code='p') carregado!")
    return pipeline_pt

def load_cached_voice(voice_name: str):
    pipeline = get_pipeline()
    if voice_name not in voice_cache:
        voice_cache[voice_name] = pipeline.load_voice(voice_name)
    return voice_cache[voice_name]

@app.on_event("startup")
async def startup_event():
    try:
        print("[Kokoro-FastAPI] 🚀 Pré-aquecendo modelos PyTorch e vozes na memória RAM...")
        pipeline = get_pipeline()
        load_cached_voice("pm_alex")
        load_cached_voice("pf_dora")
        print("[Kokoro-FastAPI] ⭐ Servidor Kokoro 100% aquecido e pronto para responder com baixíssima latência!")
    except Exception as e:
        print(f"[Kokoro-FastAPI] Aviso ao aquecer vozes: {e}")

def trim_silence(audio: np.ndarray, threshold=0.01):
    mask = np.abs(audio) > threshold
    if not np.any(mask):
        return audio
    start = np.argmax(mask)
    end = len(audio) - np.argmax(mask[::-1])
    return audio[start:end]

class TTSRequest(BaseModel):
    model: str = "kokoro"
    input: str = ""
    text: str = ""
    voice: str = "pm_alex"
    voice_blend: Optional[Dict[str, float]] = None
    response_format: str = "wav"
    speed: float = 1.0
    pitch: float = 1.0
    trim: bool = True

class VoiceProfileRequest(BaseModel):
    name: str = "Perfil de Voz Personalizado"
    mode: str = "single"
    voice: str = "pm_alex"
    voice_blend: Optional[Dict[str, float]] = None
    speed: float = 1.0
    pitch: float = 1.0
    response_format: str = "wav"
    trim: bool = True

@app.get("/api/active-voice-profile")
def get_profile():
    return get_active_profile()

@app.post("/api/active-voice-profile")
def set_profile(req: VoiceProfileRequest):
    p_data = req.dict()
    save_active_profile(p_data)
    print(f"[Kokoro-FastAPI] ⭐ Nova voz ativa definida para a Landing Page: {p_data.get('name')}")
    return {"status": "ok", "active_profile": p_data}

@app.post("/v1/audio/speech")
@app.post("/api/tts")
async def generate_speech(req: TTSRequest):
    raw_text = req.input or req.text
    if not raw_text:
        raise HTTPException(status_code=400, detail="Texto não informado")

    try:
        pipeline = get_pipeline()

        active_prof = get_active_profile()
        is_active = (req.voice == "active")

        prof_mode = active_prof.get("mode", "single") if is_active else ("blend" if req.voice_blend else "single")
        v_voice = active_prof.get("voice", "pf_dora") if is_active else req.voice
        v_blend = req.voice_blend if req.voice_blend is not None else (active_prof.get("voice_blend") if is_active else None)
        speed = req.speed if (not is_active and req.speed != 1.0) else active_prof.get("speed", 1.0)
        pitch = req.pitch if (not is_active and req.pitch != 1.0) else active_prof.get("pitch", 1.0)

        if prof_mode == "blend" and v_blend and isinstance(v_blend, dict) and len(v_blend) > 0:
            blended_tensor = None
            total_weight = sum(v_blend.values())
            for v_name, weight in v_blend.items():
                if v_name in ["pm_alex", "pf_dora", "pm_santa"]:
                    norm_weight = weight / total_weight if total_weight > 0 else 1.0
                    v_tensor = load_cached_voice(v_name)
                    if blended_tensor is None:
                        blended_tensor = norm_weight * v_tensor
                    else:
                        blended_tensor += norm_weight * v_tensor
            voice_input = blended_tensor if blended_tensor is not None else load_cached_voice("pf_dora")
        else:
            voice_name = v_voice if v_voice in ["pm_alex", "pf_dora", "pm_santa"] else "pf_dora"
            voice_input = load_cached_voice(voice_name)

        generator = pipeline(raw_text, voice=voice_input, speed=speed, split_pattern=r'\n+')
        
        audio_chunks = []
        for gs, ps, audio in generator:
            if audio is not None and len(audio) > 0:
                audio_chunks.append(audio)
            
        if not audio_chunks:
            raise HTTPException(status_code=500, detail="Falha ao gerar áudio com Kokoro")
            
        full_audio = np.concatenate(audio_chunks)

        if req.trim:
            full_audio = trim_silence(full_audio)

        sample_rate = 24000
        if pitch != 1.0 and 0.7 <= pitch <= 1.3:
            sample_rate = int(24000 * pitch)
        
        out_buf = io.BytesIO()
        audio_format = req.response_format.lower()
        
        if audio_format == "mp3":
            sf.write(out_buf, full_audio, sample_rate, format='MP3')
            media_type = "audio/mpeg"
        else:
            sf.write(out_buf, full_audio, sample_rate, format='WAV')
            media_type = "audio/wav"
            
        out_buf.seek(0)
        return Response(content=out_buf.read(), media_type=media_type)
    except Exception as e:
        print(f"[Kokoro-FastAPI] Erro ao sintetizar voz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

WEB_HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kokoro TTS — Gerenciador & Sidebar de Perfis de Voz</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0a0c10;
      --card-bg: rgba(22, 27, 34, 0.85);
      --card-border: rgba(255, 255, 255, 0.12);
      --primary: #3b82f6;
      --primary-glow: rgba(59, 130, 246, 0.4);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.4);
      --accent: #8b5cf6;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: radial-gradient(circle at 50% 0%, #171c26 0%, var(--bg-dark) 80%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem;
    }
    .header { text-align: center; margin-bottom: 1.2rem; width: 100%; max-width: 1240px; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
      border-radius: 99px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399; font-size: 0.85rem; font-weight: 600; margin-bottom: 10px;
    }
    .header h1 {
      font-size: 2.2rem; font-weight: 800;
      background: linear-gradient(135deg, #ffffff 0%, #a7f3d0 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px;
    }
    .header p { color: var(--text-muted); font-size: 0.95rem; }

    /* Active Banner */
    .active-banner {
      width: 100%; max-width: 1240px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px; padding: 12px 20px; margin-bottom: 1.2rem; display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
    }
    .active-info { display: flex; align-items: center; gap: 12px; }
    .active-icon { font-size: 1.6rem; }
    .active-title { font-weight: 700; font-size: 0.95rem; color: #ecfdf5; }
    .active-subtitle { font-size: 0.8rem; color: #a7f3d0; }

    /* Layout 2 Colunas */
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
      width: 100%;
      max-width: 1240px;
    }

    .editor-column {
      background: var(--card-bg); backdrop-filter: blur(20px);
      border: 1px solid var(--card-border); border-radius: 24px; padding: 1.8rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }

    .sidebar-column {
      background: var(--card-bg); backdrop-filter: blur(20px);
      border: 1px solid var(--card-border); border-radius: 24px; padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      display: flex; flex-direction: column; max-height: calc(100vh - 180px);
    }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;
    }
    .sidebar-header h3 { font-size: 1.05rem; font-weight: 700; color: #fff; }

    .profile-list {
      display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-right: 4px; flex: 1;
    }
    .profile-list::-webkit-scrollbar { width: 6px; }
    .profile-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; }

    /* Card Minimalista de Perfil na Sidebar */
    .prof-card {
      background: rgba(10, 12, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; padding: 12px; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 8px;
    }
    .prof-card:hover { border-color: rgba(255, 255, 255, 0.22); background: rgba(255, 255, 255, 0.04); }
    .prof-card.is-active { border-color: var(--success); background: rgba(16, 185, 129, 0.08); }
    .prof-card-top { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .prof-card-title { font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 6px; }
    .prof-card-badge {
      font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 99px;
      background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .prof-pill {
      font-size: 0.72rem; font-weight: 600; padding: 3px 8px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.06); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .prof-card-actions { display: flex; gap: 6px; width: 100%; margin-top: 2px; }

    .btn-sm {
      background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e5e7eb; font-weight: 600; font-size: 0.76rem; padding: 5px 9px; border-radius: 8px;
      cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
    }
    .btn-sm:hover { background: rgba(255, 255, 255, 0.14); color: #fff; }
    .btn-sm-primary { background: rgba(59, 130, 246, 0.18); border-color: rgba(59, 130, 246, 0.35); color: #60a5fa; flex: 1; justify-content: center; }
    .btn-sm-primary:hover { background: rgba(59, 130, 246, 0.3); color: #fff; }
    .btn-sm-active { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; border: none; font-weight: 700; flex: 1; justify-content: center; }
    .btn-sm-active:hover { transform: translateY(-1px); }

    .tab-nav { display: flex; gap: 10px; margin-bottom: 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; }
    .tab-btn {
      background: none; border: none; color: var(--text-muted); font-weight: 700; font-size: 0.92rem;
      padding: 8px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
    }
    .tab-btn.active { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }

    .form-group { margin-bottom: 1.2rem; }
    label { display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; color: #e5e7eb; margin-bottom: 6px; }
    label span.val { color: #60a5fa; font-weight: 700; }
    input[type="text"], textarea {
      width: 100%; padding: 12px 14px; border-radius: 12px; background: rgba(10, 12, 16, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.12); color: #ffffff; font-family: inherit; font-size: 0.95rem;
      outline: none; transition: border 0.2s;
    }
    textarea { height: 90px; resize: vertical; }
    input[type="text"]:focus, textarea:focus { border-color: var(--primary); }

    .voice-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .voice-card {
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; padding: 12px; cursor: pointer; text-align: center; transition: all 0.2s;
    }
    .voice-card:hover { background: rgba(255, 255, 255, 0.06); }
    .voice-card.selected { background: rgba(59, 130, 246, 0.15); border-color: var(--primary); box-shadow: 0 0 12px var(--primary-glow); }
    .voice-card .icon { font-size: 1.5rem; margin-bottom: 2px; }
    .voice-card .name { font-weight: 700; font-size: 0.9rem; color: #fff; }
    .voice-card .desc { font-size: 0.72rem; color: var(--text-muted); }
    
    .blend-box { background: rgba(10, 12, 16, 0.5); padding: 0.9rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); display: none; }
    .blend-box.active { display: block; }
    .blend-item { margin-bottom: 10px; }
    .blend-item:last-child { margin-bottom: 0; }
    
    .controls-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 1.2rem; }
    .control-box { background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
    input[type="range"] { width: 100%; accent-color: var(--primary); margin-top: 4px; }
    select {
      width: 100%; padding: 8px; border-radius: 8px; background: rgba(10,12,16,0.8);
      border: 1px solid rgba(255,255,255,0.15); color: #fff; outline: none; margin-top: 4px; font-family: inherit;
    }
    .toggle-group { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
    .btn-submit {
      width: 100%; padding: 15px; border-radius: 14px;
      background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
      color: #ffffff; border: none; font-family: inherit; font-size: 1.05rem; font-weight: 700;
      cursor: pointer; box-shadow: 0 8px 25px var(--primary-glow); transition: all 0.2s ease;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 12px 30px var(--primary-glow); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .result-box {
      margin-top: 1.2rem; padding: 1.2rem; background: rgba(10, 12, 16, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; display: none;
    }
    .result-box.active { display: block; }
    audio { width: 100%; margin-top: 10px; border-radius: 8px; }
    .download-link {
      display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
      color: #a78bfa; text-decoration: none; font-size: 0.88rem; font-weight: 600;
    }
    .download-link:hover { text-decoration: underline; }
    input[type="file"] { display: none; }

    @media (max-width: 900px) {
      .layout-grid { grid-template-columns: 1fr; }
      .sidebar-column { max-height: none; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="badge">⭐ Gerenciador de Perfis de Voz · Landing Page</div>
    <h1>Estúdio de Voz & Perfis Kokoro</h1>
    <p>Crie, edite e ative os perfis de voz da Landing Page no painel lateral à direita.</p>
  </div>

  <!-- Banner da Voz Ativa na Landing Page -->
  <div class="active-banner" id="active-banner">
    <div class="active-info">
      <div class="active-icon">🎙️</div>
      <div>
        <div class="active-title" id="active-title-text">Voz Ativa da Landing Page: Carregando...</div>
        <div class="active-subtitle" id="active-subtitle-text">Modo: -- | Velocidade: -- | Tom: --</div>
      </div>
    </div>
    <div style="font-size: 0.78rem; font-weight: 700; color: #34d399; background: rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 8px;">EM USO NO SITE</div>
  </div>

  <div class="layout-grid">
    <!-- COLUNA DA ESQUERDA: EDITOR E REPRODUTOR -->
    <div class="editor-column">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 8px;">
        <h2 style="font-size: 1.15rem; font-weight: 800; color: #fff;">🎛️ Editor de Configuração</h2>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button type="button" class="btn-sm btn-sm-primary" onclick="saveCurrentProfileToList()">➕ Salvar Perfil</button>
          <button type="button" class="btn-sm btn-sm-active" onclick="setAsLandingPageVoice()">⭐ Usar no Site</button>
        </div>
      </div>

      <div class="form-group">
        <label for="profile-name">Nome do Perfil Atual:</label>
        <input type="text" id="profile-name" value="Locutor Comercial Alex (Padrão)">
      </div>

      <div class="tab-nav">
        <button type="button" class="tab-btn active" id="tab-single" onclick="switchMode('single')">🗣️ Voz Única</button>
        <button type="button" class="tab-btn" id="tab-blend" onclick="switchMode('blend')">🎛️ Mistura de Vozes (Voice Blender)</button>
      </div>

      <form id="tts-form">
        <div class="form-group" id="group-single">
          <label>Selecione a Voz Base:</label>
          <div class="voice-options">
            <div class="voice-card selected" data-voice="pm_alex">
              <div class="icon">🚹</div>
              <div class="name">Alex</div>
              <div class="desc">Masculino (Padrão)</div>
            </div>
            <div class="voice-card" data-voice="pf_dora">
              <div class="icon">🚺</div>
              <div class="name">Dora</div>
              <div class="desc">Feminino</div>
            </div>
            <div class="voice-card" data-voice="pm_santa">
              <div class="icon">🎅</div>
              <div class="name">Santa</div>
              <div class="desc">Masculino Grave</div>
            </div>
          </div>
        </div>

        <div class="form-group blend-box" id="group-blend">
          <label>Proporção do Mix de Vozes Híbrida:</label>
          <div class="blend-item">
            <label>🚹 Alex (Masculino): <span class="val" id="val-alex">70%</span></label>
            <input type="range" id="blend-alex" min="0" max="100" value="70">
          </div>
          <div class="blend-item">
            <label>🚺 Dora (Feminino): <span class="val" id="val-dora">0%</span></label>
            <input type="range" id="blend-dora" min="0" max="100" value="0">
          </div>
          <div class="blend-item">
            <label>🎅 Santa (Grave): <span class="val" id="val-santa">30%</span></label>
            <input type="range" id="blend-santa" min="0" max="100" value="30">
          </div>
        </div>

        <div class="form-group">
          <label for="text-input">Texto para Teste de Síntese:</label>
          <textarea id="text-input" placeholder="Digite aqui o texto para testar este perfil...">Oi! Como posso te ajudar hoje?</textarea>
        </div>

        <div class="controls-grid">
          <div class="control-box">
            <label>⚡ Velocidade: <span class="val" id="speed-val">1.0x</span></label>
            <input type="range" id="speed-range" min="0.5" max="2.0" step="0.1" value="1.0">
          </div>

          <div class="control-box">
            <label>🎵 Tom / Pitch: <span class="val" id="pitch-val">Normal (1.0x)</span></label>
            <input type="range" id="pitch-range" min="0.8" max="1.2" step="0.05" value="1.0">
          </div>

          <div class="control-box">
            <label>🔀 Formato de Áudio:</label>
            <select id="format-select">
              <option value="wav">WAV (Sem Perda · 24kHz)</option>
              <option value="mp3">MP3 (Compacto · Web)</option>
            </select>
          </div>

          <div class="control-box">
            <label>✂️ Cortar Silêncio (Trim):</label>
            <div class="toggle-group">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Remover margem de silêncio</span>
              <input type="checkbox" id="trim-check" checked style="width: 18px; height: 18px; accent-color: var(--primary);">
            </div>
          </div>
        </div>

        <button type="submit" class="btn-submit" id="btn-gen">
          <span>🔊 Testar Perfil & Sintetizar Áudio</span>
        </button>
      </form>

      <div class="result-box" id="result-box">
        <label id="result-title">🎵 Áudio Sintetizado:</label>
        <audio id="audio-player" controls autoplay></audio>
        <div>
          <a id="download-btn" class="download-link" download="kokoro_audio.wav" href="#">📥 Baixar arquivo de áudio</a>
        </div>
      </div>
    </div>

    <!-- COLUNA DA DIREITA: SIDEBAR DE PERFIS EMPILHADOS -->
    <div class="sidebar-column">
      <div class="sidebar-header">
        <h3>📚 Perfis Salvos</h3>
        <div>
          <button type="button" class="btn-sm" onclick="document.getElementById('import-file').click()">📂 Importar JSON</button>
          <input type="file" id="import-file" accept=".json" onchange="importProfileJSON(event)">
        </div>
      </div>

      <!-- Lista de cards empilhados -->
      <div class="profile-list" id="profile-list">
        <!-- Injetados via JavaScript -->
      </div>
    </div>
  </div>

  <script>
    let mode = 'single';
    let selectedVoice = 'pm_alex';
    let activeProfileData = null;

    // Lista de Perfis Pré-configurados
    const defaultProfilesList = [
      {
        id: 'p_alex_std',
        name: 'Locutor Alex Comercial',
        mode: 'single',
        voice: 'pm_alex',
        voice_blend: { pm_alex: 1.0, pf_dora: 0.0, pm_santa: 0.0 },
        speed: 1.0, pitch: 1.0, response_format: 'wav', trim: true
      },
      {
        id: 'p_dora_std',
        name: 'Voz Dora Atendimento',
        mode: 'single',
        voice: 'pf_dora',
        voice_blend: { pm_alex: 0.0, pf_dora: 1.0, pm_santa: 0.0 },
        speed: 1.0, pitch: 1.0, response_format: 'wav', trim: true
      },
      {
        id: 'p_santa_std',
        name: 'Santa Autoridade Grave',
        mode: 'single',
        voice: 'pm_santa',
        voice_blend: { pm_alex: 0.0, pf_dora: 0.0, pm_santa: 1.0 },
        speed: 0.95, pitch: 0.95, response_format: 'wav', trim: true
      },
      {
        id: 'p_mix_vendas',
        name: 'Locutor Híbrido Marcante',
        mode: 'blend',
        voice: 'pm_alex',
        voice_blend: { pm_alex: 0.7, pf_dora: 0.0, pm_santa: 0.3 },
        speed: 1.0, pitch: 0.95, response_format: 'wav', trim: true
      },
      {
        id: 'p_mix_suave',
        name: 'Atendimento Quente (Dora+Alex)',
        mode: 'blend',
        voice: 'pf_dora',
        voice_blend: { pm_alex: 0.4, pf_dora: 0.6, pm_santa: 0.0 },
        speed: 1.0, pitch: 1.05, response_format: 'wav', trim: true
      }
    ];

    function getSavedProfiles() {
      try {
        const stored = localStorage.getItem('kokoro_saved_profiles');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      localStorage.setItem('kokoro_saved_profiles', JSON.stringify(defaultProfilesList));
      return defaultProfilesList;
    }

    function saveSavedProfiles(list) {
      localStorage.setItem('kokoro_saved_profiles', JSON.stringify(list));
      renderProfilesSidebar();
    }

    function fetchActiveProfile() {
      fetch('/api/active-voice-profile')
        .then(r => r.json())
        .then(prof => {
          activeProfileData = prof;
          const bannerTitle = document.getElementById('active-title-text');
          const bannerSub = document.getElementById('active-subtitle-text');
          const pName = prof.name || 'Perfil Padrão';
          const pMode = prof.mode === 'blend' ? 'Mistura (Mix)' : (prof.voice === 'pf_dora' ? 'Dora' : (prof.voice === 'pm_santa' ? 'Santa' : 'Alex'));
          bannerTitle.textContent = `Voz Ativa da Landing Page: ${pName}`;
          bannerSub.textContent = `Voz: ${pMode} | Velocidade: ${prof.speed}x | Tom: ${prof.pitch}x`;
          renderProfilesSidebar();
        })
        .catch(console.error);
    }

    function renderProfilesSidebar() {
      const list = getSavedProfiles();
      const container = document.getElementById('profile-list');
      container.innerHTML = '';

      list.forEach((prof, idx) => {
        const isCurrentActive = activeProfileData && activeProfileData.name === prof.name;
        
        const card = document.createElement('div');
        card.className = `prof-card ${isCurrentActive ? 'is-active' : ''}`;
        
        let voiceTag = '🚹 Alex';
        if (prof.mode === 'blend') {
          voiceTag = '🎛️ Mix';
        } else if (prof.voice === 'pf_dora') {
          voiceTag = '🚺 Dora';
        } else if (prof.voice === 'pm_santa') {
          voiceTag = '🎅 Santa';
        }

        card.innerHTML = `
          <div class="prof-card-top">
            <div class="prof-card-title">
              <span>${prof.name}</span>
              ${isCurrentActive ? '<span class="prof-card-badge">⭐ ATIVA</span>' : ''}
            </div>
            <span class="prof-pill">${voiceTag}</span>
          </div>
          <div class="prof-card-actions">
            <button class="btn-sm btn-sm-primary" onclick="loadProfileIndex(${idx})">✏️ Editar</button>
            <button class="btn-sm btn-sm-active" onclick="setProfileIndexActive(${idx})">⭐ Usar no Site</button>
            <button class="btn-sm" onclick="exportProfileIndex(${idx})" title="Exportar JSON">📥</button>
            ${list.length > 1 ? `<button class="btn-sm" onclick="deleteProfileIndex(${idx})" title="Excluir" style="color: #f87171;">🗑️</button>` : ''}
          </div>
        `;
        container.appendChild(card);
      });
    }

    function switchMode(newMode) {
      mode = newMode;
      document.getElementById('tab-single').classList.toggle('active', mode === 'single');
      document.getElementById('tab-blend').classList.toggle('active', mode === 'blend');
      document.getElementById('group-single').style.display = mode === 'single' ? 'block' : 'none';
      document.getElementById('group-blend').classList.toggle('active', mode === 'blend');
    }

    document.querySelectorAll('#group-single .voice-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#group-single .voice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedVoice = card.dataset.voice;
      });
    });

    ['alex', 'dora', 'santa'].forEach(v => {
      const slider = document.getElementById(`blend-${v}`);
      const valLabel = document.getElementById(`val-${v}`);
      slider.addEventListener('input', () => { valLabel.textContent = slider.value + '%'; });
    });

    const speedRange = document.getElementById('speed-range');
    const speedVal = document.getElementById('speed-val');
    speedRange.addEventListener('input', () => { speedVal.textContent = speedRange.value + 'x'; });

    const pitchRange = document.getElementById('pitch-range');
    const pitchVal = document.getElementById('pitch-val');
    pitchRange.addEventListener('input', () => {
      const p = parseFloat(pitchRange.value);
      if (p < 0.95) pitchVal.textContent = `Grave (${p}x)`;
      else if (p > 1.05) pitchVal.textContent = `Agudo (${p}x)`;
      else pitchVal.textContent = `Normal (${p}x)`;
    });

    function getProfileObjectFromUI() {
      const name = document.getElementById('profile-name').value.trim() || 'Perfil Sem Nome';
      return {
        id: 'p_' + Date.now(),
        name: name,
        mode: mode,
        voice: selectedVoice,
        voice_blend: {
          pm_alex: parseFloat(document.getElementById('blend-alex').value) / 100,
          pf_dora: parseFloat(document.getElementById('blend-dora').value) / 100,
          pm_santa: parseFloat(document.getElementById('blend-santa').value) / 100
        },
        speed: parseFloat(speedRange.value),
        pitch: parseFloat(pitchRange.value),
        response_format: document.getElementById('format-select').value,
        trim: document.getElementById('trim-check').checked
      };
    }

    function loadProfileIntoUI(prof) {
      if (prof.name) document.getElementById('profile-name').value = prof.name;
      if (prof.mode) switchMode(prof.mode);
      if (prof.voice) {
        selectedVoice = prof.voice;
        document.querySelectorAll('#group-single .voice-card').forEach(c => {
          c.classList.toggle('selected', c.dataset.voice === selectedVoice);
        });
      }
      if (prof.voice_blend) {
        if (prof.voice_blend.pm_alex !== undefined) {
          const v = Math.round(prof.voice_blend.pm_alex * 100);
          document.getElementById('blend-alex').value = v;
          document.getElementById('val-alex').textContent = v + '%';
        }
        if (prof.voice_blend.pf_dora !== undefined) {
          const v = Math.round(prof.voice_blend.pf_dora * 100);
          document.getElementById('blend-dora').value = v;
          document.getElementById('val-dora').textContent = v + '%';
        }
        if (prof.voice_blend.pm_santa !== undefined) {
          const v = Math.round(prof.voice_blend.pm_santa * 100);
          document.getElementById('blend-santa').value = v;
          document.getElementById('val-santa').textContent = v + '%';
        }
      }
      if (prof.speed) {
        speedRange.value = prof.speed;
        speedVal.textContent = prof.speed + 'x';
      }
      if (prof.pitch) {
        pitchRange.value = prof.pitch;
        const p = prof.pitch;
        if (p < 0.95) pitchVal.textContent = `Grave (${p}x)`;
        else if (p > 1.05) pitchVal.textContent = `Agudo (${p}x)`;
        else pitchVal.textContent = `Normal (${p}x)`;
      }
      if (prof.response_format) document.getElementById('format-select').value = prof.response_format;
      if (prof.trim !== undefined) document.getElementById('trim-check').checked = prof.trim;
    }

    function loadProfileIndex(idx) {
      const list = getSavedProfiles();
      if (list[idx]) {
        loadProfileIntoUI(list[idx]);
      }
    }

    function saveCurrentProfileToList() {
      const prof = getProfileObjectFromUI();
      const list = getSavedProfiles();
      
      const existingIdx = list.findIndex(p => p.name === prof.name);
      if (existingIdx >= 0) {
        list[existingIdx] = prof;
      } else {
        list.unshift(prof);
      }
      saveSavedProfiles(list);
      alert(`Perfil "${prof.name}" salvo na lista lateral!`);
    }

    async function setProfileIndexActive(idx) {
      const list = getSavedProfiles();
      if (!list[idx]) return;
      const prof = list[idx];
      loadProfileIntoUI(prof);
      
      try {
        const res = await fetch('/api/active-voice-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prof)
        });
        if (!res.ok) throw new Error('Erro ao salvar no servidor');
        fetchActiveProfile();
        alert(`⭐ Voz da Landing Page alterada para "${prof.name}"!`);
      } catch (err) {
        alert('Erro ao definir voz ativa: ' + err.message);
      }
    }

    async function setAsLandingPageVoice() {
      const prof = getProfileObjectFromUI();
      saveCurrentProfileToList();
      try {
        const res = await fetch('/api/active-voice-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prof)
        });
        if (!res.ok) throw new Error('Erro ao salvar no servidor');
        fetchActiveProfile();
        alert(`⭐ Voz ativada com sucesso! A Landing Page agora utilizará o perfil "${prof.name}".`);
      } catch (err) {
        alert('Erro ao definir voz da Landing Page: ' + err.message);
      }
    }

    function deleteProfileIndex(idx) {
      const list = getSavedProfiles();
      if (list.length <= 1) return alert('Você deve manter ao menos 1 perfil na lista.');
      const name = list[idx].name;
      if (confirm(`Deseja excluir o perfil "${name}"?`)) {
        list.splice(idx, 1);
        saveSavedProfiles(list);
      }
    }

    function exportProfileIndex(idx) {
      const list = getSavedProfiles();
      const prof = list[idx] || getProfileObjectFromUI();
      const jsonStr = JSON.stringify(prof, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (prof.name || 'perfil').toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `perfil_voz_${safeName}.json`;
      a.click();
    }

    function importProfileJSON(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const prof = JSON.parse(e.target.result);
          loadProfileIntoUI(prof);
          saveCurrentProfileToList();
          alert(`Perfil "${prof.name || 'carregado'}" importado e adicionado à lista lateral!`);
        } catch (err) {
          alert('Erro ao ler arquivo JSON de perfil: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    const form = document.getElementById('tts-form');
    const btnGen = document.getElementById('btn-gen');
    const resultBox = document.getElementById('result-box');
    const audioPlayer = document.getElementById('audio-player');
    const downloadBtn = document.getElementById('download-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = document.getElementById('text-input').value.trim();
      if (!text) return alert('Por favor, digite um texto!');

      btnGen.disabled = true;
      btnGen.innerHTML = '⏳ Sintetizando Voz Personalizada...';

      const prof = getProfileObjectFromUI();
      const reqBody = {
        input: text,
        speed: prof.speed,
        pitch: prof.pitch,
        response_format: prof.response_format,
        trim: prof.trim
      };

      if (prof.mode === 'single') {
        reqBody.voice = prof.voice;
      } else {
        reqBody.voice_blend = prof.voice_blend;
      }

      try {
        const res = await fetch('/v1/audio/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqBody)
        });

        if (!res.ok) throw new Error('Erro na síntese Kokoro');

        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);

        audioPlayer.src = audioUrl;
        downloadBtn.href = audioUrl;
        downloadBtn.download = `kokoro_audio.${reqBody.response_format}`;
        resultBox.classList.add('active');
        audioPlayer.play();
      } catch (err) {
        alert('Erro ao sintetizar áudio: ' + err.message);
      } finally {
        btnGen.disabled = false;
        btnGen.innerHTML = '🔊 Testar Perfil & Sintetizar Áudio';
      }
    });

    fetchActiveProfile();
  </script>
</body>
</html>
"""

@app.get("/web", response_class=HTMLResponse)
@app.get("/", response_class=HTMLResponse)
def get_web_ui():
    return HTMLResponse(content=WEB_HTML)

@app.get("/health")
def health():
    return {"status": "ok", "language": "pt-br", "voices": ["pm_alex", "pf_dora", "pm_santa"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8880)
