# Publicar actualizaciones de la app Android

La APK es un **WebView que carga el sitio desplegado** (`server.url` en
`capacitor.config.ts`). Por eso hay dos tipos de actualización:

| Tipo de cambio | ¿Necesita APK nueva? | Cómo se actualiza |
| --- | --- | --- |
| Páginas, estilos, funciones (web) | **No** | Automático: al desplegar a Vercel, la app carga lo nuevo al abrirse. |
| Nativo (plugins, ícono, permisos, versión de Capacitor) | **Sí** | APK nueva + **aviso de actualización dentro de la app**. |

## Cómo funciona el aviso

1. La app lee su `versionCode` instalado con `@capacitor/app`.
2. Descarga [`/app-version.json`](public/app-version.json) del sitio.
3. Si el manifiesto anuncia un `versionCode` mayor, muestra un diálogo para
   descargar el APK (abre `apkUrl` en el navegador). Una vez por sesión, y
   solo en la app nativa (en web no hace nada).

Lógica: [`src/components/AppUpdate.astro`](src/components/AppUpdate.astro),
incluido en `BaseLayout`.

## Requisitos (una sola vez)

- **Android Studio** instalado (aporta el JDK del JBR que usa Gradle).
- **GitHub CLI** (`gh`) autenticada: `gh auth login` _(o el script toma el
  token de las credenciales de git automáticamente)_.
- **Keystore de firma** ya configurado:
  - `android/dione-release.keystore` y `android/keystore.properties`.
  - **⚠️ Respáldalos.** Si pierdes el keystore o su contraseña **no podrás
    publicar más actualizaciones** (Android exige siempre la misma firma).
  - No están en git (`android/` y `*.keystore` están en `.gitignore`).

## Publicar una actualización (automático)

```bash
npm run release:android -- 1.0.2 --notes "Qué cambió en esta versión"
```

El script:

1. Sube `versionCode` (+1) y `versionName` en `android/app/build.gradle`.
2. `npx cap sync android` (omitible con `--no-sync`).
3. Compila el **APK release firmado** (con el JDK del JBR).
4. Renombra el APK a `dione-acuatica.apk`.
5. Crea la **release en GitHub** y sube el APK.
6. Actualiza `public/app-version.json` (versión + versionCode + notas).
7. Commitea y pushea el manifiesto → **Vercel lo despliega** (omitible con
   `--no-push`).

Al terminar, quien tenga una versión anterior verá el aviso al abrir la app.

### Opciones

| Flag | Efecto |
| --- | --- |
| `--notes "texto"` | Notas de la release y del manifiesto. |
| `--no-sync` | Omite `cap sync` (si no cambiaron plugins nativos). |
| `--no-push` | No commitea/pushea el manifiesto (lo haces tú). |

## Publicar una actualización (manual)

```bash
# 1. Sube versionCode/versionName en android/app/build.gradle
# 2. (si cambiaron plugins) npx cap sync android
# 3. Compila (usa el JDK del JBR, no el 23):
cd android
JAVA_HOME="C:\Program Files\Android\Android Studio\jbr" ./gradlew.bat assembleRelease --no-daemon
# 4. Sube el APK a una release:
cp app/build/outputs/apk/release/app-release.apk dione-acuatica.apk
gh release create v1.0.2 dione-acuatica.apk --title "Dione Acuatica v1.0.2" --notes "..."
# 5. Edita public/app-version.json (latestVersionCode, latestVersion) y push a main
```

## Instalar el APK

Descarga directa (siempre la última):
`https://github.com/jerrySacort/Escuela-natacion/releases/latest/download/dione-acuatica.apk`

> ⚠️ Si ya había una versión instalada con **otra firma** (p. ej. un build
> debug de Android Studio), **desinstálala antes** — Android no actualiza
> sobre firmas distintas. Desde la v1.0.1 todas usan el mismo keystore.

## Problemas comunes

- **"Gradle no soporta Java 23"**: usa el JDK del JBR (JDK 21) con
  `JAVA_HOME`. El wrapper está en Gradle 8.7.
- **No instala / "app no instalada"**: firma distinta a la instalada →
  desinstala la anterior primero.
- **El aviso no aparece**: solo funciona desde el primer APK que incluye
  `@capacitor/app` (v1.0.1+), y solo si `app-version.json` anuncia un
  `versionCode` mayor al instalado.
