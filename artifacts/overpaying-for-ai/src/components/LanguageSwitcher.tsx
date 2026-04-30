import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const isZh = lang === "zh-CN" || lang.startsWith("zh");

  const toggle = () => {
    i18n.changeLanguage(isZh ? "en" : "zh-CN");
  };

  return (
    <button
      onClick={toggle}
      aria-label={isZh ? "Switch to English" : "切换至中文"}
      title={isZh ? "Switch to English" : "切换至中文"}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded border border-border/60 hover:border-border whitespace-nowrap"
    >
      <span className={isZh ? "text-foreground font-semibold" : ""}>中文</span>
      <span className="text-muted-foreground/40 select-none">|</span>
      <span className={!isZh ? "text-foreground font-semibold" : ""}>EN</span>
    </button>
  );
}
