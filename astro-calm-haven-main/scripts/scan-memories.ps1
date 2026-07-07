# Memory Lane Metadata Generator
Write-Host "🎞️ MEMORY LANE METADATA GENERATOR" -ForegroundColor Cyan
Write-Host "=" * 50

$memoriesPath = "public/memories"
$metadataPath = "$memoriesPath/metadata"

# Create metadata directory if it doesn't exist
New-Item -Path $metadataPath -ItemType Directory -Force

# Categories with empty items
$categories = @{
    "family" = @{
        name = "Family"
        description = "Photos and videos of family members"
        voiceTriggers = @("family", "parents", "children", "siblings", "mom", "dad", "mother", "father")
        emotionTriggers = @("lonely", "homesick", "nostalgic", "sad")
        items = @()
    }
    "friends" = @{
        name = "Friends"
        description = "Memories with friends and colleagues"
        voiceTriggers = @("friends", "buddies", "colleagues", "team", "crew")
        emotionTriggers = @("lonely", "isolated", "bored")
        items = @()
    }
    "home" = @{
        name = "Home"
        description = "Photos of home, city, and neighborhood"
        voiceTriggers = @("home", "house", "apartment", "city", "town")
        emotionTriggers = @("homesick", "nostalgic", "longing")
        items = @()
    }
    "earth" = @{
        name = "Earth"
        description = "Beautiful Earth landscapes and nature"
        voiceTriggers = @("earth", "planet", "nature", "beach", "mountain")
        emotionTriggers = @("homesick", "awestruck", "peaceful")
        items = @()
    }
    "pets" = @{
        name = "Pets"
        description = "Photos of pets and animals"
        voiceTriggers = @("pet", "dog", "cat", "animal", "buddy")
        emotionTriggers = @("lonely", "sad", "needing comfort")
        items = @()
    }
    "achievements" = @{
        name = "Achievements"
        description = "Personal achievements and milestones"
        voiceTriggers = @("achievement", "success", "graduation", "award")
        emotionTriggers = @("demotivated", "tired", "needing inspiration")
        items = @()
    }
}

# Scan each category folder
foreach ($category in $categories.Keys) {
    $photosPath = "$memoriesPath/$category/photos"
    $videosPath = "$memoriesPath/$category/videos"
    
    # Scan photos
    if (Test-Path $photosPath) {
        $photoFiles = Get-ChildItem -Path $photosPath -File | Where-Object {
            $_.Extension -match '\.(jpg|jpeg|png|webp|gif)$'
        }
        
        foreach ($file in $photoFiles) {
            $itemId = "$category-photo-$($categories[$category].items.Count + 1)"
            $fileName = $file.Name
            $caption = $file.BaseName.Replace('-', ' ').Replace('_', ' ')
            
            $item = @{
                id = $itemId
                type = "photo"
                filename = $fileName
                path = "/memories/$category/photos/$fileName"
                caption = $caption
                date = (Get-Date).ToString("yyyy-MM-dd")
                tags = @($category, "photo", "memory")
                duration = $null
                size = "$([math]::Round($file.Length / 1MB, 2)) MB"
                file_size = $file.Length
                added = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
            
            $categories[$category].items += $item
            Write-Host "✅ Added: $caption ($fileName)" -ForegroundColor Green
        }
    }
    
    # Scan videos
    if (Test-Path $videosPath) {
        $videoFiles = Get-ChildItem -Path $videosPath -File | Where-Object {
            $_.Extension -match '\.(mp4|webm|mov|avi)$'
        }
        
        foreach ($file in $videoFiles) {
            $itemId = "$category-video-$($categories[$category].items.Count + 1)"
            $fileName = $file.Name
            $caption = $file.BaseName.Replace('-', ' ').Replace('_', ' ')
            
            $item = @{
                id = $itemId
                type = "video"
                filename = $fileName
                path = "/memories/$category/videos/$fileName"
                caption = $caption
                date = (Get-Date).ToString("yyyy-MM-dd")
                tags = @($category, "video", "memory")
                duration = 30  # Default 30 seconds
                size = "$([math]::Round($file.Length / 1MB, 2)) MB"
                file_size = $file.Length
                added = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
            
            $categories[$category].items += $item
            Write-Host "✅ Added: $caption ($fileName)" -ForegroundColor Green
        }
    }
}

# Create memories.json
$memoriesJson = @{
    categories = $categories
} | ConvertTo-Json -Depth 10

$memoriesJson | Out-File -FilePath "$metadataPath/memories.json" -Encoding UTF8

# Create voice triggers
$voiceTriggers = @{
    triggers = @(
        @{
            id = "trigger-001"
            phrases = @("i miss my family", "show family", "family photos", "my family")
            category = "family"
            priority = "high"
            response = "Showing cherished family memories"
        },
        @{
            id = "trigger-002"
            phrases = @("i miss my friends", "show friends", "my buddies", "colleagues")
            category = "friends"
            priority = "high"
            response = "Showing fun moments with friends"
        }
    )
} | ConvertTo-Json -Depth 5

$voiceTriggers | Out-File -FilePath "$metadataPath/voice-triggers.json" -Encoding UTF8

# Create emotion map
$emotionMap = @{
    mappings = @(
        @{
            emotion = "lonely"
            categories = @("family", "friends", "pets")
            priority = "high"
            message = "Remembering loved ones can help"
        }
    )
} | ConvertTo-Json -Depth 5

$emotionMap | Out-File -FilePath "$metadataPath/emotion-map.json" -Encoding UTF8

# Show statistics
$totalItems = ($categories.Values | ForEach-Object { $_.items.Count } | Measure-Object -Sum).Sum
Write-Host "`n📊 SCAN COMPLETE!" -ForegroundColor Green
Write-Host "Total items found: $totalItems" -ForegroundColor Yellow

foreach ($category in $categories.Keys) {
    $count = $categories[$category].items.Count
    Write-Host "  $($categories[$category].name): $count items" -ForegroundColor White
}

Write-Host "`n✅ Metadata saved to: $metadataPath/" -ForegroundColor Green
