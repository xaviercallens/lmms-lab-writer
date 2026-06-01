/* global console, fetch */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function fail(message) {
  console.error(`[aur] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    tag: "",
    version: "",
    pkgrel: "1",
    outDir: "aur-dist/lmms-lab-writer",
    repo: "EvolvingLMMs-Lab/lmms-lab-writer",
    sha256: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--tag") {
      args.tag = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--version") {
      args.version = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--pkgrel") {
      args.pkgrel = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--out-dir") {
      args.outDir = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--repo") {
      args.repo = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--sha256") {
      args.sha256 = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      console.log(`Usage:
  node scripts/generate-aur-source-package.mjs --tag v0.1.3

Options:
  --tag <vX.Y.Z>       Git tag used in release URL
  --version <X.Y.Z>    Package version (overrides --tag)
  --pkgrel <N>         AUR package release number (default: 1)
  --out-dir <dir>      Output directory for PKGBUILD/.SRCINFO
  --repo <owner/repo>  GitHub repo for source archive URL
  --sha256 <hash>      Override source archive SHA-256`);
      process.exit(0);
    }
    fail(`Unknown argument '${arg}'`);
  }

  return args;
}

function normalizeVersion(input) {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("v") ? trimmed.slice(1) : trimmed;
}

function inferVersionFromTagOrArg(args) {
  const version = normalizeVersion(args.version || args.tag);
  if (!version) {
    fail("Provide --tag or --version");
  }
  if (version.includes("-")) {
    fail(`AUR stable package generation only supports stable versions. Got '${version}'`);
  }
  if (!/^\d+\.\d+\.\d+(?:\.[0-9A-Za-z]+)?$/.test(version)) {
    fail(`Invalid version '${version}'`);
  }
  return version;
}

function validatePkgrel(input) {
  const pkgrel = input.trim();
  if (!/^[1-9]\d*$/.test(pkgrel)) {
    fail(`Invalid pkgrel '${input}'`);
  }
  return pkgrel;
}

async function sha256Url(url) {
  const response = await fetch(url);
  if (!response.ok) {
    fail(
      `Failed to download source archive for checksum: ${response.status} ${response.statusText}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const RUNTIME_DEPENDS = [
  "gtk3",
  "webkit2gtk-4.1",
  "libappindicator-gtk3",
  "openssl",
  "xdg-utils",
  "opencode",
  "texlive-bin",
  "texlive-binextra",
  "texlive-latex",
  "texlive-latexrecommended",
  "texlive-latexextra",
  "texlive-fontsrecommended",
  "texlive-langcjk",
];

const MAKE_DEPENDS = ["git", "nodejs", "pnpm", "rust", "cargo", "curl", "wget", "file", "patchelf"];

function buildPkgbuild({ version, pkgrel, sourceUrl, sha256 }) {
  const depends = RUNTIME_DEPENDS.map((dependency) => `'${dependency}'`).join(" ");
  const makedepends = MAKE_DEPENDS.map((dependency) => `'${dependency}'`).join(" ");

  return `pkgname=lmms-lab-writer
pkgver=${version}
pkgrel=${pkgrel}
pkgdesc="AI-native LaTeX editor desktop application"
arch=('x86_64')
url="https://github.com/EvolvingLMMs-Lab/lmms-lab-writer"
license=('MIT')
depends=(${depends})
makedepends=(${makedepends})
provides=('lmms-lab-writer')
conflicts=('lmms-lab-writer-bin')
options=(!strip)
source=("\${pkgname}-\${pkgver}.tar.gz::${sourceUrl}")
sha256sums=('${sha256}')

_source_dir() {
  local dir="\${srcdir}/\${pkgname}-\${pkgver}"
  if [[ -d "\${dir}" ]]; then
    printf '%s\\n' "\${dir}"
    return
  fi

  find "\${srcdir}" -maxdepth 1 -type d -name "\${pkgname}-*" | head -n 1
}

prepare() {
  cd "$(_source_dir)"

  export CARGO_HOME="\${srcdir}/cargo-home"
  export PNPM_HOME="\${srcdir}/pnpm-home"
  export PATH="\${PNPM_HOME}:\${PATH}"

  pnpm --filter @lmms-lab/writer-desktop... install \\
    --frozen-lockfile \\
    --store-dir "\${srcdir}/pnpm-store" \\
    --network-concurrency 8 \\
    --fetch-retries 5 \\
    --fetch-retry-mintimeout 20000 \\
    --fetch-retry-maxtimeout 120000
}

build() {
  cd "$(_source_dir)"

  export CARGO_HOME="\${srcdir}/cargo-home"
  export PNPM_HOME="\${srcdir}/pnpm-home"
  export PATH="\${PNPM_HOME}:\${PATH}"

  pnpm --filter @lmms-lab/writer-desktop tauri build --ci --no-bundle
}

package() {
  cd "$(_source_dir)"

  install -Dm755 "apps/desktop/src-tauri/target/release/lmms-lab-writer" \\
    "\${pkgdir}/usr/bin/lmms-lab-writer"
  install -Dm644 LICENSE "\${pkgdir}/usr/share/licenses/\${pkgname}/LICENSE"

  install -Dm644 "apps/desktop/src-tauri/icons/32x32.png" \\
    "\${pkgdir}/usr/share/icons/hicolor/32x32/apps/lmms-lab-writer.png"
  install -Dm644 "apps/desktop/src-tauri/icons/128x128.png" \\
    "\${pkgdir}/usr/share/icons/hicolor/128x128/apps/lmms-lab-writer.png"
  install -Dm644 "apps/desktop/src-tauri/icons/icon.png" \\
    "\${pkgdir}/usr/share/icons/hicolor/512x512/apps/lmms-lab-writer.png"

  install -Dm644 /dev/stdin "\${pkgdir}/usr/share/applications/lmms-lab-writer.desktop" <<'EOF'
[Desktop Entry]
Type=Application
Name=LMMs-Lab Writer
Comment=AI-native LaTeX editor
Exec=lmms-lab-writer %U
Icon=lmms-lab-writer
Terminal=false
Categories=Office;Science;TextEditor;
StartupNotify=true
EOF
}
`;
}

function buildSrcinfo({ version, pkgrel, sourceUrl, sha256 }) {
  const depends = RUNTIME_DEPENDS.map((dependency) => `\tdepends = ${dependency}`).join("\n");
  const makedepends = MAKE_DEPENDS.map((dependency) => `\tmakedepends = ${dependency}`).join("\n");

  return `pkgbase = lmms-lab-writer
\tpkgdesc = AI-native LaTeX editor desktop application
\tpkgver = ${version}
\tpkgrel = ${pkgrel}
\turl = https://github.com/EvolvingLMMs-Lab/lmms-lab-writer
\tarch = x86_64
\tlicense = MIT
${depends}
${makedepends}
\tprovides = lmms-lab-writer
\tconflicts = lmms-lab-writer-bin
\toptions = !strip
\tsource = lmms-lab-writer-${version}.tar.gz::${sourceUrl}
\tsha256sums = ${sha256}

pkgname = lmms-lab-writer
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const version = inferVersionFromTagOrArg(args);
  const pkgrel = validatePkgrel(args.pkgrel);
  const tag = args.tag || `v${version}`;
  const sourceUrl = `https://github.com/${args.repo}/archive/refs/tags/${tag}.tar.gz`;
  const sha256 = args.sha256 || (await sha256Url(sourceUrl));

  fs.mkdirSync(args.outDir, { recursive: true });

  fs.writeFileSync(
    path.join(args.outDir, "PKGBUILD"),
    buildPkgbuild({
      version,
      pkgrel,
      sourceUrl,
      sha256,
    }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(args.outDir, ".SRCINFO"),
    buildSrcinfo({
      version,
      pkgrel,
      sourceUrl,
      sha256,
    }),
    "utf8",
  );
  fs.writeFileSync(
    path.join(args.outDir, "README.md"),
    `# lmms-lab-writer (AUR)\n\nGenerated from release tag ${tag}.\n\nFiles:\n- PKGBUILD\n- .SRCINFO\n`,
    "utf8",
  );

  console.log(`[aur] generated AUR source package files in ${args.outDir}`);
  console.log(`[aur] source URL: ${sourceUrl}`);
  console.log(`[aur] sha256: ${sha256}`);
}

main();
