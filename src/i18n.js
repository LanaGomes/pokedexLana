import { createI18n } from "vue-i18n";
import pt from "./lang/pt.json";
import en from "./lang/en.json";
import es from "./lang/es.json";

const savedLocale = localStorage.getItem("locale") || "pt";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en",
  messages: {
    pt,
    en,
    es,
  },
});

export default i18n;
