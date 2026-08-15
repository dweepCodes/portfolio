# Generates assets/img/og-cover.png (1200x630) in the site palette.
# Re-run after any identity change: pwsh -File make-og.ps1
Add-Type -AssemblyName System.Drawing

$W = 1200; $H = 630
$paper   = [System.Drawing.Color]::FromArgb(246, 247, 245)
$ink     = [System.Drawing.Color]::FromArgb(10, 10, 10)
$emerald = [System.Drawing.Color]::FromArgb(23, 190, 133)
$coral   = [System.Drawing.Color]::FromArgb(255, 90, 60)

$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear($paper)

$inkBrush     = New-Object System.Drawing.SolidBrush($ink)
$emeraldBrush = New-Object System.Drawing.SolidBrush($emerald)
$coralBrush   = New-Object System.Drawing.SolidBrush($coral)
$paperBrush   = New-Object System.Drawing.SolidBrush($paper)
$inkPen6      = New-Object System.Drawing.Pen($ink, 6)
$inkPen10     = New-Object System.Drawing.Pen($ink, 10)

# Outer frame
$g.FillRectangle($inkBrush, 0, 0, $W, 18)
$g.FillRectangle($inkBrush, 0, ($H - 18), $W, 18)

# --- Icosahedron mark, right side -------------------------------------------
$cx = 965.0; $cy = 315.0; $r = 168.0; $off = 20.0
$pts = @()
for ($k = 0; $k -lt 10; $k++) {
  $a = ([Math]::PI / 180) * (-90 + 36 * $k)
  $pts += (New-Object System.Drawing.PointF(($cx + $r * [Math]::Cos($a)), ($cy + $r * [Math]::Sin($a))))
}
$shadow = $pts | ForEach-Object { New-Object System.Drawing.PointF(($_.X + $off), ($_.Y + $off)) }
$g.FillPolygon($inkBrush, [System.Drawing.PointF[]]$shadow)
$g.FillPolygon($emeraldBrush, [System.Drawing.PointF[]]$pts)
$g.DrawPolygon($inkPen10, [System.Drawing.PointF[]]$pts)

$even = @($pts[0], $pts[2], $pts[4], $pts[6], $pts[8])
$odd  = @($pts[1], $pts[3], $pts[5], $pts[7], $pts[9])
$g.DrawPolygon($inkPen6, [System.Drawing.PointF[]]$even)
$g.DrawPolygon($inkPen6, [System.Drawing.PointF[]]$odd)
$centre = New-Object System.Drawing.PointF($cx, $cy)
foreach ($p in $pts) { $g.DrawLine($inkPen6, $centre, $p) }

# --- Type, left side ---------------------------------------------------------
# Archivo is not installed system-wide; the nearest heavy condensed face that
# ships with Windows stands in for the social card only.
$displayFamily = 'Arial Black'
if (-not ([System.Drawing.FontFamily]::Families.Name -contains $displayFamily)) { $displayFamily = 'Segoe UI Black' }
if (-not ([System.Drawing.FontFamily]::Families.Name -contains $displayFamily)) { $displayFamily = 'Arial' }

$monoFamily = 'Consolas'
if (-not ([System.Drawing.FontFamily]::Families.Name -contains $monoFamily)) { $monoFamily = 'Courier New' }

$x = 78.0
$textMaxWidth = 700.0   # keeps the headline clear of the mark
$lines = @('MODELS ARE EASY.', 'PRODUCTS ARE HARD.', 'I BUILD THE SECOND KIND.')

# Pick the largest display size at which every headline line still fits.
$fBig = $null
for ($size = 58; $size -ge 24; $size--) {
  $candidate = New-Object System.Drawing.Font($displayFamily, $size, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $widest = ($lines | ForEach-Object { $g.MeasureString($_, $candidate).Width } | Measure-Object -Maximum).Maximum
  if ($widest -le $textMaxWidth) { $fBig = $candidate; break }
  $candidate.Dispose()
}
if ($null -eq $fBig) { $fBig = New-Object System.Drawing.Font($displayFamily, 24, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel) }

$fName  = New-Object System.Drawing.Font($displayFamily, 40, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fMicro = New-Object System.Drawing.Font($monoFamily, 20, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

$g.DrawString('DWEEP SHISHODIA', $fName, $inkBrush, $x, 92)
$g.DrawString('ML ENGINEER  /  BS DATA SCIENCE, IIT MADRAS', $fMicro, $inkBrush, ($x + 4), 148)

$lineHeight = $g.MeasureString($lines[0], $fBig).Height
$y = 268.0
$g.DrawString($lines[0], $fBig, $inkBrush, $x, $y)
$g.DrawString($lines[1], $fBig, $inkBrush, $x, ($y + $lineHeight))

# Third line as a coral block with ink type, mirroring the hero.
$size3 = $g.MeasureString($lines[2], $fBig)
$blockY = $y + 2 * $lineHeight + 6
$g.FillRectangle($coralBrush, $x, $blockY, ($size3.Width + 18), ($size3.Height + 4))
$g.DrawRectangle($inkPen6, $x, $blockY, ($size3.Width + 18), ($size3.Height + 4))
$g.DrawString($lines[2], $fBig, $inkBrush, ($x + 9), ($blockY + 2))

$g.DrawString('MATRI6.COM', $fMicro, $inkBrush, ($x + 4), ($blockY + $size3.Height + 42))

$out = Join-Path $PSScriptRoot 'og-cover.png'
if ($args.Count -ge 1) { $out = $args[0] }
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose(); $bmp.Dispose()
"Wrote $out"
