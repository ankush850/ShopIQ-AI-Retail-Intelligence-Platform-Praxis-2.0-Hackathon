# Fix theme switching issues in view files
$files = @(
    "components\views\behavior-view.tsx",
    "components\views\comparison-view.tsx", 
    "components\views\upload-view.tsx"
)

foreach ($file in $files) {
    $path = Join-Path "a:\ShopIQ-AI-Retail-Intelligence-Platform" $file
    if (Test-Path $path) {
        $content = Get-Content -Path $path -Raw
        
        # Replace dark card styling with theme-aware styling
        $content = $content -replace 'border-white/10 bg-gradient-to-br from-\[#080808\] to-\[#030303\] shadow-lg hover:shadow-\[0_0_25px_rgba\(255,255,255,0\.05\)\] transition-all duration-300', 'transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]'
        
        # Replace hardcoded text colors with CSS variables
        $content = $content -replace 'text-white', 'text-card-foreground'
        $content = $content -replace 'border-white/\d+', 'border-border'
        
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "`nAll files updated successfully!"
