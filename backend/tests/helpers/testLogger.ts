/**
 * Helper para logging en pruebas unitarias
 * Muestra mensajes formateados en consola para evidencias
 */

export const testLogger = {
  /**
   * Log de inicio de prueba
   */
  startTest: (testName: string) => {
    console.log('\n📋 ============================================');
    console.log(`📋 INICIANDO PRUEBA: ${testName}`);
    console.log('📋 ============================================\n');
  },

  /**
   * Log de acción realizada
   */
  logAction: (action: string, details?: any) => {
    const timestamp = new Date().toLocaleTimeString('es-CL');
    console.log(`✅ [${timestamp}] Acción: ${action}`);
    if (details) {
      console.log(`   📝 Detalles:`, details);
    }
  },

  /**
   * Log de resultado esperado
   */
  logExpected: (expected: string, actual?: any) => {
    console.log(`🎯 Resultado Esperado: ${expected}`);
    if (actual !== undefined) {
      console.log(`   ✓ Obtenido:`, actual);
    }
  },

  /**
   * Log de verificación
   */
  logAssert: (assertion: string, passed: boolean = true) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} Verificación: ${assertion}`);
  },

  /**
   * Log de error
   */
  logError: (error: string, errorDetails?: any) => {
    console.log(`❌ ERROR: ${error}`);
    if (errorDetails) {
      console.log(`   🔍 Detalles del error:`, errorDetails);
    }
  },

  /**
   * Log de datos de prueba
   */
  logTestData: (label: string, data: any) => {
    console.log(`📊 ${label}:`);
    console.log(JSON.stringify(data, null, 2));
  },

  /**
   * Log de separador
   */
  separator: () => {
    console.log('\n─────────────────────────────────────────────\n');
  },

  /**
   * Log de fin de prueba
   */
  endTest: (testName: string, passed: boolean = true) => {
    const icon = passed ? '✅' : '❌';
    console.log('\n📋 ============================================');
    console.log(`${icon} PRUEBA COMPLETADA: ${testName}`);
    console.log('📋 ============================================\n');
  }
};


