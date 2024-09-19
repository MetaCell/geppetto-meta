from pathlib import Path
from api import api
import json

openapi_output = Path(__file__).resolve().parent.parent / "openapi" / "openapi.json"

openapi = api.openapi()
openapi_output.write_text(json.dumps(openapi, indent=2))
