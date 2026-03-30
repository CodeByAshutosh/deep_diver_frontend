#!/usr/bin/env python3
"""
Generic Azure Container App deployment script
Deploys any container app to Azure using browser-based auth
"""
import sys
import os
from azure.identity import InteractiveBrowserCredential
from azure.mgmt.appcontainers import ContainerAppsAPIClient

# Configuration
subscription_id = "4e78cd80-41c7-4f58-b92b-334cde20f39b"
tenant_id = "2b08247b-be82-4b00-ad96-ca1606b8b51a"
resource_group = "deep-diver-rg"

# Target: frontend with v3 image
container_app_name = "pr-slides-frontend"
image = "shuklaashu1/pr-slides-frontend:v4"

try:
    # Authenticate
    print("Logging in to Azure...")
    print("A browser window will open for authentication...")
    print("")
    
    credential = InteractiveBrowserCredential(tenant_id=tenant_id)
    
    # Create client
    client = ContainerAppsAPIClient(credential, subscription_id)
    
    print(f"Fetching container app: {container_app_name}")
    # Get existing container app
    container_app = client.container_apps.get(resource_group, container_app_name)
    
    # Update the image
    print(f"Updating image to: {image}")
    if container_app.template.containers:
        container_app.template.containers[0].image = image
    
    print(f"Sending update to Azure...")
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
    if hasattr(result, 'ingress') and result.ingress:
        print(f"URL: https://{result.ingress.fqdn}")
    
except Exception as e:
    print(f"❌ Error: {e}", file=sys.stderr)
    sys.exit(1)
