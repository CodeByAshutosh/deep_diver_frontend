#!/usr/bin/env python3
import os
import requests
import json
from azure.identity import InteractiveBrowserCredential

# Configuration
subscription_id = "4e78cd80-41c7-4f58-b92b-334cde20f39b"
tenant_id = "2b08247b-be82-4b00-ad96-ca1606b8b51a"
resource_group = "deep-diver-rg"
container_app_name = "pr-slides-frontend"
image = "shuklaashu1/pr-slides-frontend:v3"

try:
    # Get auth token
    print("Getting Azure authentication token...")
    credential = InteractiveBrowserCredential(tenant_id=tenant_id, timeout=300)
    token = credential.get_token("https://management.azure.com/.default").token
    
    # Prepare API endpoint
    api_url = f"https://management.azure.com/subscriptions/{subscription_id}/resourceGroups/{resource_group}/providers/Microsoft.App/containerApps/{container_app_name}?api-version=2023-05-02"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Get current container app
    print(f"Fetching container app: {container_app_name}")
    resp = requests.get(api_url, headers=headers)
    if resp.status_code != 200:
        raise Exception(f"Failed to fetch container app: {resp.text}")
    
    container_app = resp.json()
    
    # Update image
    print(f"Updating image to: {image}")
    container_app["properties"]["template"]["containers"][0]["image"] = image
    
    # Send update
    resp = requests.patch(api_url, headers=headers, json=container_app)
    if resp.status_code not in [200, 201]:
        raise Exception(f"Failed to update container app: {resp.text}")
    
    print("✅ Deployment successful!")
    result = resp.json()
    fqdn = result.get("properties", {}).get("configuration", {}).get("ingress", {}).get("fqdn", "")
    if fqdn:
        print(f"URL: https://{fqdn}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
