# Generates the raster DS-monogram icons that favicon.svg cannot cover
# (older browsers, and Apple's touch-icon which requires a PNG).
# Re-run after any identity change: pwsh -File make-favicon.ps1
Add-Type -AssemblyName System.Drawing

$ink   = [System.Drawing.Color]::FromArgb(10, 10, 10)
$coral = [System.Drawing.Color]::FromArgb(255, 90, 60)

$displayFamily = 'Arial Black'
if (-not ([System.Drawing.FontFamily]::Families.Name -contains $displayFamily)) { $displayFamily = 'Segoe UI Black' }
if (-not ([System.Drawing.FontFamily]::Families.Name -contains $displayFamily)) { $displayFamily = 'Arial' }

function New-Mark {
  param([int]$Size, [string]$Path)

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::Transparent)

  # Border weight matches --rule (3px) at the 40px reference size used by
  # favicon.svg, scaled proportionally for larger raster sizes.
  $borderPx = [Math]::Max(1.0, $Size * (3.0 / 40.0))
  $inkBrush   = New-Object System.Drawing.SolidBrush($ink)
  $coralBrush = New-Object System.Drawing.SolidBrush($coral)
  $inkPen     = New-Object System.Drawing.Pen($ink, $borderPx)

  $inset = $borderPx / 2
  $rect = New-Object System.Drawing.RectangleF($inset, $inset, ($Size - 2 * $inset), ($Size - 2 * $inset))
  $g.FillRectangle($coralBrush, $rect)
  $g.DrawRectangle($inkPen, $inset, $inset, ($Size - 2 * $inset), ($Size - 2 * $inset))

  # Condense the fallback face by scaling the transform horizontally,
  # same trick favicon.svg uses, so it reads heavy-and-narrow at any size.
  $state = $g.Save()
  $g.TranslateTransform($Size / 2.0, $Size / 2.0)
  $g.ScaleTransform(0.86, 1.0)
  $g.TranslateTransform(-$Size / 2.0, -$Size / 2.0)

  $font = New-Object System.Drawing.Font($displayFamily, ($Size * 0.5), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString('DS', $font, $inkBrush, ($Size / 2.0), ($Size / 2.0) + ($Size * 0.02), $fmt)
  $g.Restore($state)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  "Wrote $Path"
}

$dir = $PSScriptRoot
New-Mark -Size 16  -Path (Join-Path $dir 'favicon-16.png')
New-Mark -Size 32  -Path (Join-Path $dir 'favicon-32.png')
New-Mark -Size 180 -Path (Join-Path $dir 'apple-touch-icon.png')
