$dest = "c:\Users\alvar\Desktop\Programacion\VinIA\Content\public\images\vinos"
$images = @{
    "baboso-negro.jpg" = "https://vinatigo.com/wp-content/uploads/2021/04/Baboso-Negro.jpg"
    "vina-norte-blanco.jpg" = "https://bodegasinsulares.es/wp-content/uploads/2020/05/vina-norte-blanco-seco.jpg"
    "trenzado.jpg" = "https://suertesdelmarques.com/wp-content/uploads/2020/06/Trenzado.jpg"
    "tajinaste-tinto.jpg" = "https://bodegastajinaste.com/wp-content/uploads/2020/02/Tajinaste-Tradicional.jpg"
    "tajinaste-blanco.jpg" = "https://bodegastajinaste.com/wp-content/uploads/2020/02/Tajinaste-Afrutado.jpg"
    "default-vino.jpg" = "https://dummyimage.com/300x400/e0e0e0/888888&text=Vino"
}

foreach ($name in $images.Keys) {
    $url = $images[$name]
    $out = Join-Path $dest $name
    Write-Host "Downloading $url to $out"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    } catch {
        Write-Host "Failed to download $name specifically, using placeholder"
        Invoke-WebRequest -Uri "https://dummyimage.com/300x400/cccccc/000000&text=Error" -OutFile $out -UseBasicParsing
    }
}
