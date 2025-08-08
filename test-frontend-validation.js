const fetch = require('node-fetch');

async function validateFrontendData() {
  console.log('🔍 VALIDANDO DATOS DEL FRONTEND...\n');
  
  try {
    // 1. Verificar datos del backend
    console.log('📡 Verificando datos del backend...');
    const backendResponse = await fetch('http://localhost:3001/api/unified-data');
    const backendData = await backendResponse.json();
    
    if (backendData.success) {
      const codeQuality = backendData.data.technical.codeQuality;
      console.log('✅ Backend - Datos actualizados:');
      console.log(`   - Total Classes: ${codeQuality.totalClasses}`);
      console.log(`   - Large Classes: ${codeQuality.largeClasses}`);
      console.log(`   - Average Class Size: ${codeQuality.averageClassSize}`);
      console.log(`   - Average API Version: ${codeQuality.averageApiVersion}`);
    } else {
      console.log('❌ Error en backend:', backendData.error);
      return;
    }
    
    // 2. Verificar que el frontend esté ejecutándose
    console.log('\n🌐 Verificando frontend...');
    const frontendResponse = await fetch('http://localhost:3000');
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend está ejecutándose en puerto 3000');
    } else {
      console.log('❌ Frontend no está ejecutándose');
      return;
    }
    
    // 3. Simular llamada desde el frontend al backend
    console.log('\n🔄 Simulando llamada del frontend al backend...');
    const frontendToBackendResponse = await fetch('http://localhost:3001/api/unified-data', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    
    if (frontendToBackendResponse.ok) {
      const frontendData = await frontendToBackendResponse.json();
      const frontendCodeQuality = frontendData.data.technical.codeQuality;
      
      console.log('✅ Frontend puede acceder a datos actualizados:');
      console.log(`   - Total Classes: ${frontendCodeQuality.totalClasses}`);
      console.log(`   - Large Classes: ${frontendCodeQuality.largeClasses}`);
      console.log(`   - Average Class Size: ${frontendCodeQuality.averageClassSize}`);
      console.log(`   - Average API Version: ${frontendCodeQuality.averageApiVersion}`);
      
      // 4. Validar que los datos coincidan
      console.log('\n🔍 VALIDACIÓN DE CONSISTENCIA:');
      
      const backendClasses = backendData.data.technical.codeQuality.totalClasses;
      const frontendClasses = frontendData.data.technical.codeQuality.totalClasses;
      
      if (backendClasses === frontendClasses) {
        console.log('✅ CONSISTENCIA: Los datos del backend y frontend coinciden');
        console.log(`   - Backend: ${backendClasses} clases`);
        console.log(`   - Frontend: ${frontendClasses} clases`);
      } else {
        console.log('❌ INCONSISTENCIA: Los datos no coinciden');
        console.log(`   - Backend: ${backendClasses} clases`);
        console.log(`   - Frontend: ${frontendClasses} clases`);
      }
      
      // 5. Verificar que los datos reflejen las nuevas clases
      console.log('\n🎯 VALIDACIÓN DE INYECCIÓN:');
      
      if (frontendClasses >= 169) {
        console.log('✅ INYECCIÓN EXITOSA: Las nuevas clases se reflejan en el frontend');
        console.log(`   - Clases esperadas: ≥169 (incluyendo TestValidationClass)`);
        console.log(`   - Clases actuales: ${frontendClasses}`);
      } else {
        console.log('❌ INYECCIÓN FALLIDA: Las nuevas clases no se reflejan');
        console.log(`   - Clases esperadas: ≥169`);
        console.log(`   - Clases actuales: ${frontendClasses}`);
      }
      
    } else {
      console.log('❌ Error en comunicación frontend-backend');
    }
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
  }
}

// Ejecutar validación
validateFrontendData();
