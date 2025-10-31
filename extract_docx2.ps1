[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "C:\projects\ai-platform\youtube_shorts.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

# Remove XML tags and clean up
$text = $content -replace '<w:br[^>]*/>',"`n" -replace '<[^>]+>','' -replace '&quot;','"' -replace '&apos;',"'" -replace '&lt;','<' -replace '&gt;','>' -replace '&amp;','&' -replace '\s+', ' '
$text = $text.Trim()

# Output to file with UTF-8 encoding
$text | Out-File -FilePath "C:\projects\ai-platform\youtube_content.txt" -Encoding UTF8
