import { TRANSLATIONS, getLanguageDirection, formatNumber, type AppLanguage } from "../src/utils/i18n";

const languages: AppLanguage[] = ["fa", "en", "ru", "de", "ar"];
for (const lang of languages) {
  if (!TRANSLATIONS[lang]?.tabs?.settings) throw new Error(`Missing translation: ${lang}`);
}
if (getLanguageDirection("fa") !== "rtl" || getLanguageDirection("ar") !== "rtl" || getLanguageDirection("en") !== "ltr") throw new Error("Direction mapping failed");
if (!formatNumber(1234.5, "en").includes("1,234")) throw new Error("Locale number formatting failed");
console.log("i18n tests passed");
