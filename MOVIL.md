# Empaquetado para Android (Capacitor) — pasos para generar el APK

**Estado: no se ha compilado ningún APK.** En el PC donde se cerró la entrega (21-nov-2026) no hay
Android SDK ni Gradle:

```
$ which gradle sdkmanager adb
/usr/bin/adb            ← solo adb; ni gradle ni sdkmanager
$ ls ~/Android
ls: cannot access '/home/mark02/Android': No such file or directory
$ java -version
openjdk version "21.0.12.1" 2026-08-18
```

No se instalaron SDKs de varios GB a propósito. Por eso tampoco se ha probado la app en un teléfono:
cámara nativa, vibración, acelerómetro, batería y GPS real están verificados solo en navegador.

## Requisitos (en la máquina de César)

1. **Android Studio** (trae el Android SDK, `sdkmanager`, el emulador y su propio JDK 21).
   Al abrirlo la primera vez: *SDK Manager* → instalar **Android SDK Platform 35** (o la que pida
   Capacitor 8) y **Android SDK Build-Tools**.
2. Variables de entorno (Linux, en `~/.bashrc`):
   ```bash
   export ANDROID_HOME="$HOME/Android/Sdk"
   export PATH="$PATH:$ANDROID_HOME/platform-tools"
   ```
3. Node 20+ y npm.

## Pasos exactos (desde la raíz del repositorio)

```bash
npm install
npm install -D @capacitor/cli@8
npm install @capacitor/android@8

cp .env.example .env              # opcional: llaves de Supabase/GIPHY (se incrustan en el build)
npm run build                     # genera dist/ (webDir de capacitor.config.json)
npx cap add android               # crea la carpeta android/ (solo la primera vez)
npx cap sync android              # copia dist/ y registra los plugins (camera, geolocation, haptics,
                                  # network, motion, device)
```

### Permisos (una sola vez, después de `cap add android`)

En `android/app/src/main/AndroidManifest.xml`, dentro de `<manifest>`, agregar:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

(`INTERNET` ya viene en la plantilla de Capacitor.)

### APK de depuración

```bash
cd android
./gradlew assembleDebug
# Resultado: android/app/build/outputs/apk/debug/app-debug.apk
```

Instalar en un teléfono con *Depuración USB* activa:

```bash
adb devices
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

O, desde Android Studio: `npx cap open android` → botón ▶ *Run* con el teléfono conectado.

Cada vez que cambie el código web: `npm run build && npx cap sync android` y volver a compilar.

## Qué probar en el teléfono (lista corta)

- [ ] Login y registro (con `.env` de Supabase, en dos teléfonos distintos para el tiempo real).
- [ ] Crear reporte: permiso de ubicación, foto con la cámara, vibración al enviar.
- [ ] Mapa: «Seguir mi ubicación» caminando unos metros.
- [ ] Modo avión: el indicador de red cambia y se bloquea el envío.
- [ ] Challenges 14 y 16: acelerómetro, batería y seguimiento real.

Notas: la carpeta `android/` puede subirse al repositorio (Capacitor la trata como código fuente);
`android/app/build/` ya la ignora la plantilla de Capacitor.
