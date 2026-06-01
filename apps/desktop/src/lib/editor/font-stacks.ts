const CJK_MONO_FONTS = [
  '"Maple Mono NF CN"',
  '"Maple Mono SC NF"',
  '"Sarasa Mono SC"',
  '"LXGW WenKai Mono"',
  '"Noto Sans Mono CJK SC"',
  '"Source Han Mono SC"',
  '"WenQuanYi Zen Hei Mono"',
];

const CJK_SANS_FALLBACK_FONTS = [
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei UI"',
  '"Microsoft YaHei"',
  '"Noto Sans CJK SC"',
];

const APPLE_GOOGLE_MONO_FONTS = [
  '"SF Mono"',
  "SFMono-Regular",
  '"SF Pro Mono"',
  '"Google Sans Code"',
  '"Roboto Mono"',
  "var(--font-geist-mono)",
  "ui-monospace",
  "Menlo",
  "Consolas",
  '"Liberation Mono"',
  '"Courier New"',
];

export const EDITOR_MONO_FONT_FAMILY = [
  ...APPLE_GOOGLE_MONO_FONTS,
  ...CJK_MONO_FONTS,
  ...CJK_SANS_FALLBACK_FONTS,
  "monospace",
].join(", ");

export function resolveMonoFontFamily(customFontFamily?: string | null): string {
  const trimmedFontFamily = customFontFamily?.trim();
  if (!trimmedFontFamily) {
    return EDITOR_MONO_FONT_FAMILY;
  }

  return `${trimmedFontFamily}, ${EDITOR_MONO_FONT_FAMILY}`;
}
