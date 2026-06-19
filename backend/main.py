import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

from kg_engine import KnowledgeGraphEngine

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = FastAPI(title="Linguantuk Semantic Web API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize KG Engine
ONTOLOGY_PATH = os.path.join(os.path.dirname(__file__), "..", "ontology_schema.ttl")
KG_PATH = os.path.join(os.path.dirname(__file__), "knowledge_graph.ttl")
kg = KnowledgeGraphEngine([ONTOLOGY_PATH, KG_PATH])

# Initialize Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-flash-latest as default, or whatever is available
    model = genai.GenerativeModel('gemini-flash-lite-latest')
else:
    model = None

class SparqlRequest(BaseModel):
    query: str

class AiRequest(BaseModel):
    query: str
    context: str = ""

@app.get("/")
def read_root():
    return {"message": "Welcome to Linguantuk Semantic Web API"}

@app.post("/sparql")
def execute_sparql_post(request: SparqlRequest):
    return kg.query(request.query)

@app.get("/sparql")
def execute_sparql_get(query: str):
    return kg.query(query)

@app.get("/api/search")
def search(q: str):
    if not q:
        return {"head": {"vars": []}, "results": {"bindings": []}}
    return kg.search_entities(q)

@app.get("/api/entity")
def get_entity(uri: str):
    return kg.get_entity_details(uri)

# Valid relations from ontology_schema.ttl
VALID_RELATIONS = {
    "antonym", "atlocation", "dbpedia", "derivedfrom",
    "distinctfrom", "etymologicallyderivedfrom", "etymologicallyrelatedto",
    "instanceof", "isa", "partof", "relatedto", "similarto", "synonym"
}

# Valid groups from ontology_schema.ttl
VALID_GROUPS = {
    "semanticopposition", "spatialrelation", "externalknowledge",
    "etymologicalrelation", "taxonomicrelation", "semanticsimilarity"
}

@app.get("/api/relations")
def get_relations(
    page: int = 1,
    page_size: int = 15,
    group: str = "all",
    relation: str = "all"
):
    """Fetch paginated relations from the knowledge graph with optional filters."""
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 15

    offset = (page - 1) * page_size

    # Build filter clauses safely to avoid SPARQL injection and pyparsing bugs
    group_filter = ""
    if group != "all":
        # Sanitize: only allow known group names
        group_name = group.replace("grp:", "").strip()
        if group_name in VALID_GROUPS:
            group_filter = f"?predicate <http://linguantuk.ac.id/relation/belongstogroup> <http://linguantuk.ac.id/group/{group_name}> ."

    relation_filter = ""
    if relation != "all":
        # Sanitize: only allow known relation names
        rel_name = relation.replace("rel:", "").strip()
        if rel_name in VALID_RELATIONS:
            relation_filter = f"FILTER(?predicate = <http://linguantuk.ac.id/relation/{rel_name}>)"
    
    if not relation_filter:
        relation_filter = "FILTER(STRSTARTS(STR(?predicate), \"http://linguantuk.ac.id/relation/\"))"

    query = (
        "PREFIX ex: <http://linguantuk.ac.id/concept/>\n"
        "PREFIX rel: <http://linguantuk.ac.id/relation/>\n"
        "PREFIX grp: <http://linguantuk.ac.id/group/>\n"
        "\n"
        "SELECT ?subject ?predicate ?object\n"
        "WHERE {\n"
        "  ?subject ?predicate ?object .\n"
    )
    if group_filter:
        query += f"  {group_filter}\n"
    query += f"  {relation_filter}\n"
    query += "}\n"
    query += f"LIMIT {page_size}\n"
    query += f"OFFSET {offset}"

    return kg.query(query)

@app.post("/api/ai/recommend")
def ai_recommendation(req: AiRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured.")
    
    prompt = f"""
    You are an expert Semantic Web and Linguistics assistant.
    The user is asking: {req.query}
    
    Here is some context from our local Knowledge Graph:
    {req.context}
    
    Please provide a helpful, concise explanation or recommendation based on the user's query and the context.
    """
    
    try:
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
