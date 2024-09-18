import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }: { locale: string }) => ({
    messages: (await import(`./lang/${locale}.json`)).default,
    timeZone: "Europe/Ljubljana",
}));
