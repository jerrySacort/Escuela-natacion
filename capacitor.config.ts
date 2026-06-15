import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuración de Capacitor para empaquetar la app (SSR) en Android.
 *
 * Como la app corre en un servidor (Astro + Node + Supabase), la APK NO
 * compila el servidor: es un WebView nativo que carga tu sitio desplegado.
 * Por eso `server.url` debe apuntar a tu URL pública con HTTPS.
 *
 *  >>> CAMBIA server.url por tu dominio real antes de compilar <<<
 */
const config: CapacitorConfig = {
  appId: 'mx.dioneacuatica.app',
  appName: 'Dione Acuática',
  // Carpeta web local (obligatoria). Se usa como pantalla de respaldo;
  // la app real se carga desde server.url.
  webDir: 'capacitor/www',
  server: {
    // ↓↓↓ REEMPLAZA con tu URL pública desplegada (con https://) ↓↓↓
    url: 'https://TU-URL-DESPLEGADA',
    androidScheme: 'https',
    // Mantener en false: solo se permite tráfico HTTPS (más seguro).
    cleartext: false,
  },
  android: {
    // Permite que el botón "atrás" navegue dentro del WebView.
    allowMixedContent: false,
  },
};

export default config;
