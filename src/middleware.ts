import createMiddleware from "next-intl/middleware";
import { locales } from "@/navigation";

export default createMiddleware({
    locales,
    defaultLocale: "sl",
    localePrefix: "as-needed",
    localeDetection: false,
});

export const config = {
    // Match only internationalized pathnames
    matcher: ["/((?!api|_next|monitoring|.*\\..*).*)"],
};
