# PowerShell deployment using device code flow (no browser required)

$clientId = "04b07795-8ddb-461a-bbee-02f9e1bf7b46"
$tenantId = "2b08247b-be82-4b00-ad96-ca1606b8b51a"
$subscriptionId = "4e78cd80-41c7-4f58-b92b-334cde20f39b"
$resourceGroup = "deep-diver-rg"
$containerAppName = "pr-slides-frontend"
$image = "shuklaashu1/pr-slides-frontend:v5"

function Get-AzureToken {
    $deviceCodeUri = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/devicecode"
    $deviceCodeBody = "client_id=$clientId&scope=https://management.azure.com/.default%20offline_access"
    
    Write-Host "Requesting device code..."
    $deviceCodeResponse = Invoke-RestMethod -Uri $deviceCodeUri -Method POST -Body $deviceCodeBody -ContentType "application/x-www-form-urlencoded"
    
    Write-Host ""
    Write-Host "========================================"
    Write-Host "AZURE AUTHENTICATION REQUIRED"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "1. Open this URL: $($deviceCodeResponse.verification_uri)"
    Write-Host "2. Enter code: $($deviceCodeResponse.user_code)"
    Write-Host ""
    Write-Host "Waiting for authentication..."
    
    $tokenUri = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
    $maxAttempts = 120
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $attempt++
        
        $tokenBody = "grant_type=urn:ietf:params:oauth:grant-type:device_code&client_id=$clientId&device_code=$($deviceCodeResponse.device_code)"
        
        try {
            $tokenResponse = Invoke-RestMethod -Uri $tokenUri -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
            return $tokenResponse.access_token
        }
        catch {
            # Ignore errors and keep polling
            Write-Host "." -NoNewline
        }
    }
    
    throw "Authentication timeout"
}

try {
    Write-Host "Getting Azure authentication token..."
    $token = Get-AzureToken
    Write-Host ""
    Write-Host "AUTHENTICATED!"
    
    $apiUrl = "https://management.azure.com/subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.App/containerApps/$containerAppName`?api-version=2023-05-02"
    
    Write-Host ""
    Write-Host "Fetching container app: $containerAppName..."
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $containerApp = Invoke-RestMethod -Uri $apiUrl -Method GET -Headers $headers
    
    Write-Host "Updating image to: $image"
    $containerApp.properties.template.containers[0].image = $image
    
    Write-Host "Sending update to Azure..."
    $response = Invoke-RestMethod -Uri $apiUrl -Method PUT -Headers $headers -Body ($containerApp | ConvertTo-Json -Depth 10)
    
    Write-Host ""
    Write-Host "DEPLOYMENT SUCCESSFUL!"
    Write-Host "Container App: $($response.name)"
    Write-Host "Status: $($response.properties.provisioningState)"
    
    if ($response.properties.configuration.ingress.fqdn) {
        Write-Host "URL: https://$($response.properties.configuration.ingress.fqdn)"
    }
    
    Write-Host ""
    Write-Host "Waiting for deployment to complete (1-3 minutes)..."
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $_"
    exit 1
}
