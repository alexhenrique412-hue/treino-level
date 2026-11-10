Add-Type -AssemblyName System.Drawing

function Create-AppIcon([int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Background dark navy
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 18, 24, 36))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Green accent glow ring
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 16, 185, 129), ($size * 0.05))
    $offset = [int]($size * 0.08)
    $g.DrawEllipse($pen, $offset, $offset, $size - ($offset * 2), $size - ($offset * 2))

    # Inner circular badge
    $innerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 24, 32, 48))
    $innerOffset = [int]($size * 0.12)
    $g.FillEllipse($innerBrush, $innerOffset, $innerOffset, $size - ($innerOffset * 2), $size - ($innerOffset * 2))

    # Text "IL" (Iron Level)
    $font = New-Object System.Drawing.Font('Impact', [float]($size * 0.38), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
    $g.DrawString("IL", $font, $textBrush, $rect, $sf)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Create-AppIcon 192 "C:\Users\alexh\.gemini\antigravity\scratch\treino-level-up\icon-192.png"
Create-AppIcon 512 "C:\Users\alexh\.gemini\antigravity\scratch\treino-level-up\icon-512.png"
Write-Host "Icons generated successfully!"
