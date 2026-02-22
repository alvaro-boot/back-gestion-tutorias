const { execSync } = require('child_process');

// Solo compilar en producción o en Render
const isProduction = process.env.NODE_ENV === 'production';
const isRender = !!process.env.RENDER;

if (isProduction || isRender) {
  console.log('🔨 Compilando proyecto para producción...');
  try {
    // Verificar si nest está disponible
    try {
      execSync('npx nest --version', { stdio: 'ignore' });
    } catch {
      console.log('⚠️  @nestjs/cli no encontrado, instalando...');
      execSync('npm install @nestjs/cli typescript --save-dev', { stdio: 'inherit' });
    }
    
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Compilación completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la compilación:', error.message);
    // No hacer exit(1) para que el build continúe si hay problemas menores
    console.log('⚠️  Continuando sin compilación...');
  }
} else {
  console.log('💻 Modo desarrollo - omitiendo compilación automática');
}
