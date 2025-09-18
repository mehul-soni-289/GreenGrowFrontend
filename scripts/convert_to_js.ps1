Param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Move to project root (this script is placed inside TSX/GreenGrow/scripts)
$projectRoot = Join-Path $PSScriptRoot '..'
Set-Location $projectRoot

Write-Host "Working directory: $(Get-Location)"

function Rename-FilesToNewExtension {
    param(
        [Parameter(Mandatory = $true)][string] $BasePath,
        [Parameter(Mandatory = $true)][string] $SearchPattern,
        [Parameter(Mandatory = $true)][string] $NewExtension,
        [scriptblock] $Predicate
    )

    if (-not (Test-Path $BasePath)) { return }

    Get-ChildItem -Path $BasePath -Recurse -File -Filter $SearchPattern |
    Where-Object { if ($Predicate) { & $Predicate $_ } else { $true } } |
    ForEach-Object {
        $newName = "$($_.BaseName)$NewExtension"
        if ($_.Name -ne $newName) {
            Rename-Item -LiteralPath $_.FullName -NewName $newName -Force
        }
    }
}

# 1) .tsx -> .jsx in app, components (excluding components/ui), hooks
Rename-FilesToNewExtension -BasePath '.\app' -SearchPattern '*.tsx' -NewExtension '.jsx'
Rename-FilesToNewExtension -BasePath '.\components' -SearchPattern '*.tsx' -NewExtension '.jsx' -Predicate { param($f) -not ($f.FullName.ToLower().Contains("\components\ui\")) }
Rename-FilesToNewExtension -BasePath '.\hooks' -SearchPattern '*.tsx' -NewExtension '.jsx'

# 2) .ts -> .js in lib, hooks (exclude declaration files)
Rename-FilesToNewExtension -BasePath '.\lib' -SearchPattern '*.ts' -NewExtension '.js' -Predicate { param($f) -not $f.Name.ToLower().EndsWith('.d.ts') }
Rename-FilesToNewExtension -BasePath '.\hooks' -SearchPattern '*.ts' -NewExtension '.js' -Predicate { param($f) -not $f.Name.ToLower().EndsWith('.d.ts') }

Write-Host 'Rename complete.'


