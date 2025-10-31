Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "C:\projects\ai-platform\youtube_shorts.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

# Remove XML tags
$text = $content -replace '<[^>]+>', ' ' -replace '\s+', ' '
Write-Output $text
