import os
from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS, OWL

# Namespaces based on ontology_schema.ttl
EX = Namespace("http://linguantuk.ac.id/concept/")
GRP = Namespace("http://linguantuk.ac.id/group/")
REL = Namespace("http://linguantuk.ac.id/relation/")

def generate_mock_data(schema_path: str, output_path: str):
    g = Graph()
    
    # Load schema
    if os.path.exists(schema_path):
        g.parse(schema_path, format="turtle")
    else:
        print(f"Warning: Schema file not found at {schema_path}. Creating an empty graph.")
    
    # Bind namespaces
    g.bind("ex", EX)
    g.bind("grp", GRP)
    g.bind("rel", REL)
    g.bind("owl", OWL)

    # --- Generate mock instances (A-Box) ---
    
    # 1. Semantic Similarity (Synonyms)
    g.add((EX.Happy, RDF.type, EX.lexicalconcept))
    g.add((EX.Happy, RDFS.label, Literal("Happy", lang="en")))
    g.add((EX.Happy, RDFS.label, Literal("Bahagia", lang="id")))
    
    g.add((EX.Joyful, RDF.type, EX.lexicalconcept))
    g.add((EX.Joyful, RDFS.label, Literal("Joyful", lang="en")))
    g.add((EX.Joyful, RDFS.label, Literal("Gembira", lang="id")))
    
    g.add((EX.Happy, REL.synonym, EX.Joyful))
    
    # 2. Semantic Opposition (Antonyms)
    g.add((EX.Sad, RDF.type, EX.lexicalconcept))
    g.add((EX.Sad, RDFS.label, Literal("Sad", lang="en")))
    g.add((EX.Sad, RDFS.label, Literal("Sedih", lang="id")))
    
    g.add((EX.Happy, REL.antonym, EX.Sad))
    
    # 3. Taxonomic Relation (is-a / part-of)
    g.add((EX.Emotion, RDF.type, EX.lexicalconcept))
    g.add((EX.Emotion, RDFS.label, Literal("Emotion", lang="en")))
    g.add((EX.Emotion, RDFS.label, Literal("Emosi", lang="id")))
    
    g.add((EX.Happy, REL.isa, EX.Emotion))
    g.add((EX.Sad, REL.isa, EX.Emotion))
    
    g.add((EX.Car, RDF.type, EX.lexicalconcept))
    g.add((EX.Car, RDFS.label, Literal("Car", lang="en")))
    g.add((EX.Car, RDFS.label, Literal("Mobil", lang="id")))
    
    g.add((EX.Wheel, RDF.type, EX.lexicalconcept))
    g.add((EX.Wheel, RDFS.label, Literal("Wheel", lang="en")))
    g.add((EX.Wheel, RDFS.label, Literal("Roda", lang="id")))
    
    g.add((EX.Wheel, REL.partof, EX.Car))
    g.add((EX.Vehicle, RDF.type, EX.lexicalconcept))
    g.add((EX.Vehicle, RDFS.label, Literal("Vehicle", lang="en")))
    g.add((EX.Car, REL.isa, EX.Vehicle))

    # 4. External Knowledge (DBpedia)
    g.add((EX.Car, REL.dbpedia, URIRef("http://dbpedia.org/resource/Car")))
    g.add((EX.Emotion, REL.dbpedia, URIRef("http://dbpedia.org/resource/Emotion")))
    
    # 5. Etymological Relation
    g.add((EX.Automobile, RDF.type, EX.lexicalconcept))
    g.add((EX.Automobile, RDFS.label, Literal("Automobile", lang="en")))
    g.add((EX.Automobile, REL.synonym, EX.Car))
    
    g.add((EX.Autos, RDF.type, EX.lexicalconcept)) # Greek
    g.add((EX.Autos, RDFS.label, Literal("Autos (Greek: Self)", lang="en")))
    
    g.add((EX.Automobile, REL.etymologicallyderivedfrom, EX.Autos))

    # Save data
    g.serialize(destination=output_path, format="turtle")
    print(f"Mock data successfully written to {output_path}")

if __name__ == "__main__":
    schema = os.path.join(os.path.dirname(__file__), "..", "..", "ontology_schema.ttl")
    output = os.path.join(os.path.dirname(__file__), "..", "data.ttl")
    generate_mock_data(schema, output)
