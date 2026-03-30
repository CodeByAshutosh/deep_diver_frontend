#!/usr/bin/env python3
import sys
import os
from azure.identity import InteractiveBrowserCredential
from azure.mgmt.appcontainers import ContainerAppsAPIClient

subscription_id = "4e78cd80-41c7-4f58-b92b-334cde20f39b"
tenant_id = "2b08247b-be82-4b00-ad96-ca1606b8b51a"
resource_group = "deep-diver-rg"
container_app_name = "pr-slides-frontend"
image = "shuklaashu1/pr-slides-frontend:v7"

# Environment variables
env_vars = [
    {"name": "VITE_API_URL", "value": os.getenv("VITE_API_URL", "https://deep-diver-backend.mangodune-63e0e495.westus2.azurecontainerapps.io")},
]

try:
    # Authenticate
    print("Logging in to Azure...")
    credential = InteractiveBrowserCredential(tenant_id=tenant_id)
    
    # Create client
    client = ContainerAppsAPIClient(credential, subscription_id)
    
    print(f"Fetching container app: {container_app_name}")
    # Get existing container app
    container_app = client.container_apps.get(resource_group, container_app_name)
    
    # Update the template with new image and env vars
    if container_app.template.containers:
        container_app.template.containers[0].image = image
        container_app.template.containers[0].env = env_vars
    
    print(f"Updating container app with image: {image}")
    # Update the container app
    async_operation = client.container_apps.begin_create_or_update(
        resource_group, 
        container_app_name, 
        container_app
    )
    
    result = async_operation.result()
    print(f"✅ Deployment successful!")
    print(f"Container App: {result.name}")
    print(f"Provisioning State: {result.provisioning_state}")
    if hasattr(result, 'configuration') and result.configuration.ingress:
        print(f"URL: https://{result.configuration.ingress.fqdn}")
    
except Exception as e:
    print(f"❌ Error: {e}", file=sys.stderr)
    sys.exit(1)
