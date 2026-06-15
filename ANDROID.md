# Generar la APK de Android (Capacitor)

Tu app es **SSR** (corre en un servidor con Astro + Supabase). La APK no compila el
servidor: es un **WebView nativo** que carga tu sitio ya desplegado. Por eso solo
necesitas una URL pública con HTTPS y empaquetarla con Capacitor.

> **Importante:** la compilación final se hace **en tu equipo** con Android Studio,
> porque trae el Android SDK, Gradle y el JDK 17 que se necesitan.

---

## 1. Requisitos (una sola vez)

- **Node.js 18+** (ya lo tienes).
- **Android Studio** (incluye Android SDK, plataforma, build-tools y un JDK 17):
  https://developer.android.com/studio
- Al abrir Android Studio por primera vez, deja que instale el **SDK** y las
  **Android SDK Build-Tools** que sugiere.

---

## 2. Configurar tu URL

Abre `capacitor.config.ts` y reemplaza el valor de `server.url` por tu dominio real:

```ts
server: {
  url: 'https://mi-escuela.com',   // ← tu URL pública desplegada
  androidScheme: 'https',
  cleartext: false,
},
```

Si quieres, cambia también `appName` (nombre visible) y `appId` (identificador del
paquete, p. ej. `mx.miescuela.app`). El `appId` debe ser único y **no se puede
cambiar fácilmente** una vez publicado, así que elígelo bien.

---

## 3. Instalar y crear el proyecto Android

Desde la carpeta del proyecto, en una terminal:

```bash
npm install
npx cap add android
npx cap sync android
```

Esto crea la carpeta `android/` (un proyecto Gradle nativo).

---

## 4. (Opcional) Ícono y splash

Coloca un logo cuadrado de al menos 1024×1024 px en `resources/icon.png` y, si
quieres, `resources/splash.png` (2732×2732). Luego:

```bash
npx @capacitor/assets generate --android
npx cap sync android
```

Genera automáticamente todos los tamaños de ícono y splash.

---

## 5. Compilar la APK

### Opción A — Android Studio (recomendada)

```bash
npx cap open android
```

En Android Studio: menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
Cuando termine, aparece un aviso con el enlace **locate**; la APK queda en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción B — Línea de comandos

```bash
cd android
./gradlew assembleDebug          # en Windows: gradlew.bat assembleDebug
```

Mismo resultado en `android/app/build/outputs/apk/debug/app-debug.apk`.

Esa **APK de depuración** ya se puede instalar en cualquier teléfono (activando
"Orígenes desconocidos"). Sirve para probar y repartir internamente.

---

## 6. APK firmada (para distribuir o subir a Google Play)

Para una APK/AAB de **release** necesitas un *keystore* (tu firma digital).

> Por seguridad, **crea tú** el keystore y guarda sus contraseñas en un lugar
> seguro: si lo pierdes, no podrás actualizar la app en Play. No lo subas a Git.

```bash
keytool -genkey -v -keystore mi-escuela.keystore \
  -alias miescuela -keyalg RSA -keysize 2048 -validity 10000
```

Después, en Android Studio: **Build → Generate Signed Bundle / APK**, elige tu
keystore y genera el **AAB** (para Play) o la **APK** firmada.

---

## 7. Actualizaciones

Como la app es un WebView de tu sitio:

- **Cambios de contenido / funciones web** → solo redepliega tu sitio. La app los
  toma sola; **no** hace falta recompilar la APK.
- **Solo recompila la APK** si cambias algo nativo: ícono, nombre, `appId`,
  permisos, plugins de Capacitor o la versión.

---

## Notas

- La sesión de Supabase usa cookies; funcionan dentro del WebView con HTTPS.
- Mantén `cleartext: false` (solo HTTPS) por seguridad.
- No subas a Git la carpeta `android/` generada ni el keystore si no quieres
  (puedes regenerar `android/` con `npx cap add android`).
