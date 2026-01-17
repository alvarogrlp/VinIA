$dest = "c:\Users\alvar\Desktop\VinIA\Content\public\images\vinos"
$images = @{
    "pedrera-rosado.jpg"        = "https://tienda.vinofilos.es/4902-thickbox_default/pedrera-rosado-2023.jpg"
    "gloc-espumoso-rosado.jpg"  = "https://tienda.vinofilos.es/3568-thickbox_default/gloc-espumoso-ancestral-rosado-2019.jpg"
    "guiri-ancestral-tinto.jpg" = "https://tienda.vinofilos.es/4704-thickbox_default/guiri-ancestral-tinto-2023.jpg"
    "vinarda-tinto.jpg"         = "https://tienda.vinofilos.es/3158-thickbox_default/vinarda-tinto-varietal-2021.jpg"
    "vidueno-ancestral.jpg"     = "https://tienda.vinofilos.es/5796-thickbox_default/vidueno-ancestral-2023-75cl.jpg"
    "uwe-urbach-tinto.jpg"      = "https://tienda.vinofilos.es/4815-thickbox_default/uwe-urbach-tinto-ecologico-2022.jpg"
    "tuets-brutal.jpg"          = "https://tienda.vinofilos.es/3398-thickbox_default/tuets-brutal-2021.jpg"
    "tajinaste-tradicional.jpg" = "https://tienda.vinofilos.es/50-thickbox_default/tajinaste-tradicional-2023-75cl.jpg"
    "tajinaste-rosado.jpg"      = "https://tienda.vinofilos.es/6062-thickbox_default/tajinaste-rosado-2024-75cl.jpg"
    "taganan-tinto.jpg"         = "https://tienda.vinofilos.es/6073-thickbox_default/taganan-tinto-2023-75cl.jpg"
    "pedrera-tinto.jpg"         = "https://tienda.vinofilos.es/6345-thickbox_default/pedrera-tinto-monastrell-2024-75cl.jpg"
    "paisaje-islas-blanco.jpg"  = "https://tienda.vinofilos.es/6060-thickbox_default/paisaje-de-las-islas-malvasia-aromatica-y-marmajuelo-2024-75cl.jpg"
    "moscatel-promesa.jpg"      = "https://tienda.vinofilos.es/335-thickbox_default/moscatel-promesa.jpg"
    "monje-tradicional.jpg"     = "https://tienda.vinofilos.es/4830-thickbox_default/monje-tradicional-2022.jpg"
    "juan-gil-bruto.jpg"        = "https://tienda.vinofilos.es/5873-thickbox_default/juan-gil-bruto-monastrell-2022-75cl.jpg"
    "guiri-tinto.jpg"           = "https://tienda.vinofilos.es/4702-thickbox_default/guiri-tinto-2023.jpg"
    "gloc-espumoso-blanco.jpg"  = "https://tienda.vinofilos.es/3642-thickbox_default/gloc-espumoso-ancestral-blanco-2020.jpg"
    "eidan-tinto.jpg"           = "https://tienda.vinofilos.es/6226-thickbox_default/eidan-tinto-seleccion-2023-75cl.jpg"
    "disfrutando-00.jpg"        = "https://tienda.vinofilos.es/5743-thickbox_default/disfrutando-00-blanco-espumoso.jpg"
    "clandestina-ancestral.jpg" = "https://tienda.vinofilos.es/5422-thickbox_default/clandestina-ancestral-confiscat-2021-75cl.jpg"
    "default-vino.jpg"          = "https://dummyimage.com/300x400/e0e0e0/888888&text=Vino"
}

foreach ($name in $images.Keys) {
    $url = $images[$name]
    $out = Join-Path $dest $name
    Write-Host "Downloading $url to $out"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    }
    catch {
        Write-Host "Failed to download $name specifically, using placeholder"
        Invoke-WebRequest -Uri "https://dummyimage.com/300x400/cccccc/000000&text=Error" -OutFile $out -UseBasicParsing
    }
}
