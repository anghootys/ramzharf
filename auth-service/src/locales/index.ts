import i18next from "i18next";
import fa from "./fa.json" with { type: "json" };

i18next.init({
    lng: "fa",
    fallbackLng: "fa",
    resources: {
        fa: { translation: fa }
    }
});

const supportedLocales = ["fa"];

export default function (lng?: string) {
    if (lng && supportedLocales.includes(lng)) {
        return i18next.getFixedT(lng);
    } else {
        return i18next.getFixedT("fa");
    }
}