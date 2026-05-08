import os
from rdflib import Graph, URIRef
from rdflib.plugins.sparql.processor import SPARQLResult

class KnowledgeGraphEngine:
    def __init__(self, data_paths: list):
        self.g = Graph()
        self.data_paths = data_paths
        self.load_data()

    def load_data(self):
        for path in self.data_paths:
            if os.path.exists(path):
                print(f"Loading {path}...")
                self.g.parse(path, format="turtle")
                print(f"Loaded {path}. Total triples: {len(self.g)}")
            else:
                print(f"Warning: Data file not found at {path}.")
        
        print("Extracting searchable entities...")
        self.searchable_entities = {}
        for node in set(self.g.all_nodes()):
            if isinstance(node, URIRef):
                uri_str = str(node)
                label = uri_str.split("/")[-1].replace("_", " ")
                self.searchable_entities[uri_str] = label
        print(f"Extracted {len(self.searchable_entities)} unique entities for search.")

    def query(self, sparql_query: str):
        try:
            results = self.g.query(sparql_query)
            return self._format_results(results)
        except Exception as e:
            return {"error": str(e)}

    def _format_results(self, results: SPARQLResult):
        if not results:
            return {"head": {"vars": []}, "results": {"bindings": []}}
            
        formatted_results = []
        for row in results:
            binding = {}
            for var in results.vars:
                val = row[var]
                if val:
                    # Determine type: uri or literal
                    type_str = "uri" if hasattr(val, "n3") and val.n3().startswith("<") else "literal"
                    lang = getattr(val, "language", None)
                    datatype = getattr(val, "datatype", None)
                    
                    binding[str(var)] = {"type": type_str, "value": str(val)}
                    if lang:
                        binding[str(var)]["xml:lang"] = lang
                    if datatype:
                        binding[str(var)]["datatype"] = str(datatype)
            formatted_results.append(binding)
            
        return {
            "head": {"vars": [str(v) for v in results.vars]},
            "results": {"bindings": formatted_results}
        }

    def search_entities(self, keyword: str):
        keyword = keyword.lower()
        matched_entities = []
        
        for uri_str, label in self.searchable_entities.items():
            if keyword in label.lower() or keyword in uri_str.lower():
                matched_entities.append((uri_str, label))
                if len(matched_entities) >= 50:
                    break
                    
        formatted_results = []
        for uri_str, label in matched_entities:
            formatted_results.append({
                "s": {"type": "uri", "value": uri_str},
                "label": {"type": "literal", "value": label}
            })
            
        return {
            "head": {"vars": ["s", "label"]},
            "results": {"bindings": formatted_results}
        }

    def get_entity_details(self, uri: str):
        # Fetch all incoming and outgoing triples for an entity
        query = f"""
        SELECT ?p ?o ?p_in ?s_in
        WHERE {{
            {{ <{uri}> ?p ?o }}
            UNION
            {{ ?s_in ?p_in <{uri}> }}
        }}
        """
        return self.query(query)
