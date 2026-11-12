#!/usr/bin/env bash
# Compila o APK de release do gym-fire e, com --install, instala no celular por adb.
#
#   scripts/build-apk.sh                 # só compila
#   scripts/build-apk.sh --install       # compila e instala no aparelho conectado
#   scripts/build-apk.sh --clean         # regenera android/ do zero antes de compilar
#
# A pasta android/ é gerada (gitignored): este script a recria com `expo prebuild`
# e reaplica a assinatura de release a cada vez, então nada precisa ser versionado.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

# ---- toolchain -------------------------------------------------------------
TOOLCHAIN="${GYMFIRE_TOOLCHAIN:-$HOME/.local/android-toolchain}"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1 && nvm use default >/dev/null 2>&1 || true
if [ -z "${JAVA_HOME:-}" ]; then
  JAVA_HOME="$(find "$TOOLCHAIN" -maxdepth 1 -name 'jdk-*' | sort | tail -1)"
  export JAVA_HOME
fi
export ANDROID_HOME="${ANDROID_HOME:-$TOOLCHAIN/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

command -v node >/dev/null || { echo "ERRO: node não encontrado (nvm em $NVM_DIR)."; exit 1; }
[ -x "$JAVA_HOME/bin/java" ] || { echo "ERRO: JDK não encontrado em $TOOLCHAIN."; exit 1; }
[ -d "$ANDROID_HOME" ] || { echo "ERRO: Android SDK não encontrado em $ANDROID_HOME."; exit 1; }

# ---- credenciais de assinatura --------------------------------------------
CRED="${GYMFIRE_KEYSTORE_PROPERTIES:-$RAIZ/../gym-fire-release/keystore.properties}"
if [ ! -f "$CRED" ]; then
  echo "ERRO: não achei as credenciais de assinatura em:"
  echo "      $CRED"
  echo "      Sem elas o APK sairia assinado com a chave de depuração e o"
  echo "      aparelho recusaria a atualização por cima (perdendo os dados)."
  exit 1
fi
# shellcheck disable=SC1090
set -a; . "$CRED"; set +a
[ -f "$GYMFIRE_STORE_FILE" ] || { echo "ERRO: keystore não encontrada: $GYMFIRE_STORE_FILE"; exit 1; }

INSTALAR=0
LIMPAR=""
for arg in "$@"; do
  case "$arg" in
    --install) INSTALAR=1 ;;
    --clean)   LIMPAR="--clean" ;;
    *) echo "Argumento desconhecido: $arg"; exit 2 ;;
  esac
done

# ---- projeto nativo --------------------------------------------------------
echo "==> expo prebuild"
npx expo prebuild --platform android $LIMPAR

echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# ---- assinatura de release ------------------------------------------------
# O template do Expo assina o release com a debug.keystore (chave pública,
# igual para todo mundo, e trocada a cada regeneração). Trocamos por uma
# signingConfig que lê as credenciais via -P, com queda para a debug.
GRADLE_APP="android/app/build.gradle"
if ! grep -q "GYMFIRE_STORE_FILE" "$GRADLE_APP"; then
  echo "==> aplicando signingConfig de release"
  python3 - "$GRADLE_APP" <<'PY'
import sys
caminho = sys.argv[1]
s = open(caminho, encoding="utf-8").read()

ancora = "    signingConfigs {\n        debug {\n"
bloco = """    signingConfigs {
        release {
            storeFile file(findProperty('GYMFIRE_STORE_FILE') ?: 'debug.keystore')
            storePassword findProperty('GYMFIRE_STORE_PASSWORD') ?: 'android'
            keyAlias findProperty('GYMFIRE_KEY_ALIAS') ?: 'androiddebugkey'
            keyPassword findProperty('GYMFIRE_KEY_PASSWORD') ?: 'android'
        }
        debug {
"""
if ancora not in s:
    sys.exit("ERRO: não achei o bloco signingConfigs esperado em " + caminho)
s = s.replace(ancora, bloco, 1)

antes = s
s = s.replace(
    "            // Caution! In production, you need to generate your own keystore file.\n"
    "            // see https://reactnative.dev/docs/signed-apk-android.\n"
    "            signingConfig signingConfigs.debug\n",
    "            signingConfig signingConfigs.release\n",
    1,
)
if s == antes:
    sys.exit("ERRO: não achei a signingConfig do buildType release em " + caminho)

open(caminho, "w", encoding="utf-8").write(s)
PY
fi

# ---- build ----------------------------------------------------------------
echo "==> gradlew assembleRelease"
cd android
./gradlew assembleRelease --no-daemon \
  -PGYMFIRE_STORE_FILE="$GYMFIRE_STORE_FILE" \
  -PGYMFIRE_STORE_PASSWORD="$GYMFIRE_STORE_PASSWORD" \
  -PGYMFIRE_KEY_ALIAS="$GYMFIRE_KEY_ALIAS" \
  -PGYMFIRE_KEY_PASSWORD="$GYMFIRE_KEY_PASSWORD"
cd "$RAIZ"

APK="android/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK" ] || { echo "ERRO: APK não foi gerado em $APK"; exit 1; }

# Confere que saiu assinado com a SUA chave, não com a de depuração.
if "$JAVA_HOME/bin/keytool" -printcert -jarfile "$APK" 2>/dev/null | grep -q "androiddebugkey"; then
  echo "ERRO: o APK saiu assinado com a chave de depuração."
  exit 1
fi

mkdir -p dist
cp "$APK" "dist/gym-fire.apk"
echo
echo "APK pronto: $RAIZ/dist/gym-fire.apk ($(du -h "dist/gym-fire.apk" | cut -f1))"

if [ "$INSTALAR" = "1" ]; then
  echo "==> adb install"
  adb install -r "dist/gym-fire.apk"
fi
