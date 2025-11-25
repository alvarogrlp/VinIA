/**
 * Test de búsqueda avanzada de vinos
 * 
 * Abre la consola del navegador (F12) y pega este código
 * para probar la búsqueda avanzada
 */

// Importar el servicio (en consola del navegador no funcionará,
// pero este código te da una idea de cómo funciona)

const testBusqueda = async () => {
  console.log('🧪 Iniciando tests de búsqueda...\n');

  const tests = [
    { query: 'Viñátigo', expected: 'Debe encontrar vinos de Bodegas Viñátigo' },
    { query: 'Listán', expected: 'Debe encontrar vinos con uva Listán' },
    { query: 'Lanzarote', expected: 'Debe encontrar vinos de Lanzarote' },
    { query: '2020', expected: 'Debe encontrar vinos del año 2020' },
    { query: 'Tinto', expected: 'Debe encontrar vinos tintos' },
    { query: 'Pescados', expected: 'Debe encontrar vinos que mariden con pescados' },
    { query: 'Malvasía', expected: 'Debe encontrar vinos de variedad Malvasía' },
    { query: 'D.O. La Palma', expected: 'Debe encontrar vinos de esta denominación' },
    { query: 'Volcánica', expected: 'Debe encontrar vinos con características volcánicas' },
    { query: 'Frutos rojos', expected: 'Debe encontrar por aroma/sabor' },
  ];

  for (const test of tests) {
    console.log(`\n🔍 Test: "${test.query}"`);
    console.log(`📝 Esperado: ${test.expected}`);
    // Aquí iría la llamada al servicio
    // const resultados = await vinosService.advancedSearch(test.query);
    // console.log(`✅ Resultados: ${resultados.length} vinos`);
  }
};

console.log('💡 Ejemplos de búsqueda que puedes probar:');
console.log('   - "Viñátigo" → Bodega');
console.log('   - "Listán" → Variedad de uva');
console.log('   - "Lanzarote" → Región');
console.log('   - "2020" → Año');
console.log('   - "Tinto" → Tipo de vino');
console.log('   - "Pescados" → Maridaje');
console.log('   - "Volcánica" → Características');

