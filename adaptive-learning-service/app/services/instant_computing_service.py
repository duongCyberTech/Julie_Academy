import json
from pathlib import Path

# Get the path to the directory where this file lives
# Then go up one level to 'app' and into 'core'
BASE_DIR = Path(__file__).resolve().parent.parent
JSON_PATH = BASE_DIR / "core" / "default_index.json"

with open(JSON_PATH, "r", encoding="utf-8") as f:
  default_index = json.load(f)
print("Loaded default index:", default_index)
from app.schemas.instant_computing import InstantComputingParams, InstantComputingResponse

class InstantComputingService:
  def compute_instant_knowledge(self, data: InstantComputingParams, params: dict) -> InstantComputingResponse:
    """
    Compute the instant knowledge using the formula:
    Instant Knowledge = (Prior * (1 - Slips)) + (Learns * (1 - Guesses))
    """
    prior = params.get("prior", default_index["prior"])
    learns = params.get("learns", default_index["learns"])
    guesses = params.get("guesses", default_index["guesses"])
    slips = params.get("slips", default_index["slips"])
    prior_n = prior
    for question in data:
      posterior = 0.0
      if question["is_correct"]:
        posterior = (prior_n * (1 - slips)) / ((prior_n * (1 - slips)) + (1 - prior_n) * guesses)
      else:
        posterior = (prior_n * slips) / ((prior_n * slips) + (1 - prior_n) * (1 - guesses))
      prior_n = posterior + learns * (1 - posterior)
    
    return InstantComputingResponse(p_l=prior_n)