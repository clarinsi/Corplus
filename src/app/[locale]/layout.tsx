import { ReactNode } from "react";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { redirect } from "next/navigation";
import Footer from "@/app/[locale]/Footer";
import Providers from "@/app/[locale]/Providers";
import "@/design-system/styles/index.css";
import { locales } from "@/navigation";
import { clsx } from "clsx";
import "../globals.css";

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-plex-sans",
});
const ibmPlexSerif = IBM_Plex_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-plex-serif" });

interface RootLayoutProps {
    children: ReactNode;
    params: {
        locale: string;
    };
}

export async function generateMetadata() {
    const t = await getTranslations("Index");

    return {
        title: t("title"),
        description: t("subtitle"),
    };
}

export default function RootLayout({ children, params }: RootLayoutProps) {
    const { locale } = params;
    if (!locales.includes(locale as any)) redirect("/sl");
    // Receive messages provided in `i18n.ts`
    const messages = useMessages();

    const classes = clsx(ibmPlexSans.variable, ibmPlexSerif.variable, "font-sans");

    return (
        <html lang={locale} className={classes}>
             <head>
                <link rel="icon" href="https://viri.cjvt.si/solar/favicon.ico" />
            </head>
            <body>
                <Providers>
                    <NextIntlClientProvider timeZone="Europe/Ljubljana" locale={locale} messages={messages}>
                        {children}
                        <Footer />
                    </NextIntlClientProvider>
                </Providers>
            </body>
        </html>
    );
}
