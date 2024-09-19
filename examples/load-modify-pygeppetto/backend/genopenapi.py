# This script goal is to generate the openapi.json specification from the API
# the openapi.json file is used then to generate the frontend binding
from pathlib import Path
from pygeppetto_api import app
import json

openapi_output = Path(__file__).resolve().parent.parent / "openapi" / "openapi.json"

openapi = app.openapi()
openapi_output.write_text(json.dumps(openapi, indent=2))
