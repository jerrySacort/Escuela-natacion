#!/usr/bin/env node
/**
 * Automatiza una nueva release del APK de Android.
 *
 *   npm run release:android -- 1.0.2
 *   npm run release:android -- 1.0.2 --notes "Qué cambió en esta versión"
 *   npm run release:android -- 1.0.2 --no-sync   (omite cap sync)
 *   npm run release:android -- 1.0.2 --no-push   (no commitea el manifiesto)
 *
 * Qué hace:
 *   1) Sube versionCode (+1) y versionName en android/app/build.gradle.
 *   2) (opc.) npx cap sync android  — copia web + plugins al proyecto nativo.
 *   3) Compila el APK release FIRMADO con el JDK del JBR de Android Studio.
 *   4) Renombra el APK a dione-acuatica.apk.
 *   5) Crea la release en GitHub y sube el APK.
 *   6) Actualiza public/app-version.json (versión + versionCode).
 *   7) (opc.) commitea y pushea el manifiesto → Vercel lo despliega.
 *
 * Requisitos: keystore configurado (android/keystore.properties), gh CLI,
 * y el JBR de Android Studio (o variable JAVA_HOME apuntando a un JDK 17-21).
 */
import { execSync, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'jerrySacort/Escuela-natacion';
const APK_NAME = 'dione-acuatica.apk';
const isWin = process.platform === 'win32';

// ---- args ---------------------------------------------------------------
const args = process.argv.slice(2);
const version = args.find((a) => /^\d+\.\d+\.\d+$/.test(a));
const noSync = args.includes('--no-sync');
const noPush = args.includes('--no-push');
const notesIdx = args.indexOf('--notes');
const notes =
  notesIdx >= 0 && args[notesIdx + 1]
    ? args[notesIdx + 1]
    : `Versión ${version}.`;

if (!version) {
  console.error('\n❌ Falta la versión. Uso:\n   npm run release:android -- 1.0.2 [--notes "..."]\n');
  process.exit(1);
}

const step = (n, msg) => console.log(`\n\x1b[36m[${n}/7]\x1b[0m ${msg}`);
const run = (cmd, opts = {}) =>
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });

// ---- JDK para Gradle ----------------------------------------------------
const JBR = 'C:\\Program Files\\Android\\Android Studio\\jbr';
const javaHome = process.env.JAVA_HOME && existsSync(process.env.JAVA_HOME)
  ? process.env.JAVA_HOME
  : existsSync(JBR)
    ? JBR
    : null;
if (!javaHome) {
  console.error('❌ No encontré un JDK. Define JAVA_HOME (JDK 17-21) o instala Android Studio.');
  process.exit(1);
}
const env = { ...process.env, JAVA_HOME: javaHome };

// ---- helpers ------------------------------------------------------------
function findGh() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return 'gh';
  } catch {
    const known = join(
      process.env.LOCALAPPDATA || '',
      'Microsoft\\WinGet\\Packages\\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\\bin\\gh.exe',
    );
    if (existsSync(known)) return known;
    throw new Error('No encontré la CLI de GitHub (gh). Instálala o agrégala al PATH.');
  }
}

/** Token de GitHub: usa GH_TOKEN si existe, o lo toma de las credenciales de git. */
function ghToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const out = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8',
    });
    const m = out.match(/password=(.+)/);
    return m ? m[1].trim() : '';
  } catch {
    return '';
  }
}

// ========================================================================
// 1) Subir versión en build.gradle
// ========================================================================
step(1, 'Subiendo versionCode/versionName en android/app/build.gradle');
const gradlePath = join(ROOT, 'android', 'app', 'build.gradle');
if (!existsSync(gradlePath)) {
  console.error('❌ No existe android/app/build.gradle. ¿Corriste "npx cap add android"?');
  process.exit(1);
}
let gradle = readFileSync(gradlePath, 'utf8');
const codeMatch = gradle.match(/versionCode\s+(\d+)/);
if (!codeMatch) {
  console.error('❌ No encontré versionCode en build.gradle.');
  process.exit(1);
}
const newCode = Number(codeMatch[1]) + 1;
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${newCode}`)
  .replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
writeFileSync(gradlePath, gradle);
console.log(`   versionCode ${codeMatch[1]} → ${newCode}, versionName "${version}"`);

// ========================================================================
// 2) cap sync (opcional)
// ========================================================================
if (noSync) {
  console.log('\n[2/7] (omitido --no-sync)');
} else {
  step(2, 'npx cap sync android');
  run('npx cap sync android', { env });
}

// ========================================================================
// 3) Compilar APK release firmado
// ========================================================================
step(3, 'Compilando APK release firmado (puede tardar varios minutos)…');
if (!existsSync(join(ROOT, 'android', 'keystore.properties'))) {
  console.error('❌ Falta android/keystore.properties (configuración de firma).');
  process.exit(1);
}
const gradlew = isWin ? 'gradlew.bat' : './gradlew';
run(`${gradlew} assembleRelease --no-daemon`, {
  cwd: join(ROOT, 'android'),
  env,
});

// ========================================================================
// 4) Renombrar el APK
// ========================================================================
step(4, `Preparando ${APK_NAME}`);
const apkDir = join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release');
const apkSrc = join(apkDir, 'app-release.apk');
const apkOut = join(apkDir, APK_NAME);
if (!existsSync(apkSrc)) {
  console.error(`❌ No se generó el APK en ${apkSrc}`);
  process.exit(1);
}
copyFileSync(apkSrc, apkOut);
console.log(`   ${apkOut}`);

// ========================================================================
// 5) Crear release en GitHub y subir el APK
// ========================================================================
step(5, `Creando release v${version} en GitHub y subiendo el APK`);
const gh = findGh();
const ghEnv = { ...env, GH_TOKEN: ghToken() };
try {
  execFileSync(
    gh,
    ['release', 'create', `v${version}`, apkOut, '--repo', REPO, '--title', `Dione Acuatica v${version}`, '--notes', notes],
    { stdio: 'inherit', env: ghEnv },
  );
} catch {
  console.log('   La release ya existía; reemplazando el APK con --clobber…');
  execFileSync(gh, ['release', 'upload', `v${version}`, apkOut, '--repo', REPO, '--clobber'], {
    stdio: 'inherit',
    env: ghEnv,
  });
}

// ========================================================================
// 6) Actualizar el manifiesto
// ========================================================================
step(6, 'Actualizando public/app-version.json');
const manifestPath = join(ROOT, 'public', 'app-version.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.latestVersionCode = newCode;
manifest.latestVersion = version;
manifest.notes = notes;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`   latestVersionCode ${newCode}, latestVersion "${version}"`);

// ========================================================================
// 7) Commit + push del manifiesto (Vercel despliega)
// ========================================================================
if (noPush) {
  console.log('\n[7/7] (omitido --no-push) — recuerda commitear public/app-version.json');
} else {
  step(7, 'Commit + push del manifiesto');
  run('git add public/app-version.json');
  run(`git commit -m "chore: app v${version} (build ${newCode})"`);
  run('git push');
}

console.log(`\n\x1b[32m✓ Release v${version} lista.\x1b[0m`);
console.log(`  APK: https://github.com/${REPO}/releases/tag/v${version}`);
console.log('  Al desplegar Vercel, los usuarios en versiones anteriores verán el aviso de actualización.\n');
