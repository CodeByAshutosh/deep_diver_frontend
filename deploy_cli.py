#!/usr/bin/env python3
import subprocess
import json
import sys

subscription_id = "4e78cd80-41c7-4f58-b92b-334cde20f39b"
resource_group = "deep-diver-rg"
container_app_name = "pr-slides-frontend"
image = "shuklaashu1/pr-slides-frontend:v3"

try:
    # Use az CLI to update container app
    print("Updating container app...")
    cmd = [
        "az", "containerapp", "update",
        "--name", container_app_name,
        "--resource-group", resource_group,
        "--image", image,
        "--subscription", subscription_id
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    print("✅ Deployment successful!")
    print(result.stdout)
    
except subprocess.CalledProcessError as e:
    print(f"❌ Error: {e.stderr}", file=sys.stderr)
    sys.exit(1)
except FileNotFoundError:
    print("❌ Azure CLI not installed. Please install it first.", file=sys.stderr)
    sys.exit(1)
