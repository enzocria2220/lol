from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize LLM Chat
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Game Models
class DialogueRequest(BaseModel):
    context: str
    character_name: str
    phase: str

class DialogueResponse(BaseModel):
    dialogue: str

class EnemyRequest(BaseModel):
    enemy_type: str
    phase: str

class EnemyResponse(BaseModel):
    name: str
    description: str
    hp: int
    attack: int
    defense: int

class AbilityRequest(BaseModel):
    ability_type: str
    level: int

class AbilityResponse(BaseModel):
    name: str
    description: str
    damage: int
    effect: str

class BattleAction(BaseModel):
    action_type: str  # "attack", "heal", "buff"
    ability_id: str
    target: str  # "enemy" or "self"

class BattleResult(BaseModel):
    success: bool
    damage: int
    message: str
    player_hp: int
    enemy_hp: int
    is_battle_over: bool
    winner: Optional[str] = None


# Game AI Generation Endpoints
@api_router.post("/generate/dialogue", response_model=DialogueResponse)
async def generate_dialogue(request: DialogueRequest):
    """Gera diálogos contextuais para o jogo usando IA"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"dialogue_{uuid.uuid4()}",
            system_message=f"""Você é um narrador de RPG ambientado na Biblioteca de Alexandria.
            Personagem: {request.character_name}
            Fase: {request.phase}
            
            Crie diálogos épicos, filosóficos e inspirados em mitologia grega.
            Use linguagem poética mas compreensível. Máximo 2-3 frases."""
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=request.context)
        response = await chat.send_message(user_message)
        
        return DialogueResponse(dialogue=response)
    except Exception as e:
        logging.error(f"Error generating dialogue: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate/enemy", response_model=EnemyResponse)
async def generate_enemy(request: EnemyRequest):
    """Gera descrições de inimigos usando IA"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"enemy_{uuid.uuid4()}",
            system_message=f"""Você cria inimigos para um RPG na Biblioteca de Alexandria.
            Fase: {request.phase}
            Tipo: {request.enemy_type}
            
            Retorne APENAS no formato JSON:
            {{"name": "Nome do Inimigo", "description": "Descrição curta e épica (1-2 frases)"}}
            
            Para Fase da Saúde: inimigos relacionados a doenças, vírus, desequilíbrios
            Para Fase da Programação: bugs, algoritmos corrompidos
            Para Fase da Arte: sombras de artistas esquecidos"""
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=f"Crie um inimigo do tipo {request.enemy_type}")
        response = await chat.send_message(user_message)
        
        # Parse the response
        import json
        try:
            data = json.loads(response)
            name = data.get("name", request.enemy_type)
            description = data.get("description", "Um inimigo misterioso")
        except:
            name = request.enemy_type
            description = response[:100]
        
        # Generate stats based on enemy type
        base_hp = 30
        base_attack = 8
        base_defense = 5
        
        if "boss" in request.enemy_type.lower() or "echo" in request.enemy_type.lower():
            base_hp = 100
            base_attack = 15
            base_defense = 10
        
        return EnemyResponse(
            name=name,
            description=description,
            hp=base_hp + random.randint(-5, 10),
            attack=base_attack + random.randint(-2, 5),
            defense=base_defense + random.randint(-2, 3)
        )
    except Exception as e:
        logging.error(f"Error generating enemy: {e}")
        # Fallback response
        return EnemyResponse(
            name=request.enemy_type,
            description="Um inimigo formidável da biblioteca",
            hp=30,
            attack=8,
            defense=5
        )

@api_router.post("/generate/ability", response_model=AbilityResponse)
async def generate_ability(request: AbilityRequest):
    """Gera descrições de habilidades usando IA"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"ability_{uuid.uuid4()}",
            system_message=f"""Você cria habilidades para um RPG baseado em sabedoria.
            Tipo: {request.ability_type}
            Nível: {request.level}
            
            Tipos de habilidades:
            - Lógica: ataques baseados em razão
            - Inspiração: buffs e fortalecimento
            - Cura: recuperação de HP
            
            Retorne APENAS no formato JSON:
            {{"name": "Nome da Habilidade", "description": "Descrição épica (1 frase)", "effect": "descrição do efeito"}}"""
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=f"Crie uma habilidade de {request.ability_type} nível {request.level}")
        response = await chat.send_message(user_message)
        
        # Parse the response
        import json
        try:
            data = json.loads(response)
            name = data.get("name", request.ability_type)
            description = data.get("description", "Uma habilidade poderosa")
            effect = data.get("effect", "Causa dano")
        except:
            name = request.ability_type
            description = response[:80]
            effect = "Efeito misterioso"
        
        # Calculate damage based on type and level
        damage = 0
        if request.ability_type == "Lógica":
            damage = 10 + (request.level * 3)
        elif request.ability_type == "Inspiração":
            damage = 5 + (request.level * 2)  # Buff amount
        elif request.ability_type == "Cura":
            damage = 15 + (request.level * 4)  # Heal amount
        
        return AbilityResponse(
            name=name,
            description=description,
            damage=damage,
            effect=effect
        )
    except Exception as e:
        logging.error(f"Error generating ability: {e}")
        return AbilityResponse(
            name=request.ability_type,
            description="Uma habilidade poderosa",
            damage=10,
            effect="Causa efeito"
        )

@api_router.post("/game/battle-action", response_model=BattleResult)
async def process_battle_action(action: BattleAction):
    """Processa uma ação de batalha"""
    # This is a simple validation endpoint
    # The actual battle logic will be handled in the frontend
    return BattleResult(
        success=True,
        damage=0,
        message="Action processed",
        player_hp=100,
        enemy_hp=100,
        is_battle_over=False
    )

# Health check
@api_router.get("/")
async def root():
    return {"message": "Os Fragmentos de Alexandria - API Ready", "status": "active"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()