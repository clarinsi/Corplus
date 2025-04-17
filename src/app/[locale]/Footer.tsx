import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import cjvt from "@/assets/images/cjvt-logo-red.svg";
import clarin from "@/assets/images/clarin-logo.svg";
import mzk from "@/assets/images/mzk-logo.svg";
import uniLJ from "@/assets/images/unilj-logo.png";
import arisLogo from "@/assets/images/aris-logo.svg";
import { clsx } from "clsx";

export default function Footer() {
    const t = useTranslations("Footer");

    return (
        <>
            <footer className="bg-footer text-white pb-48 min-h-[14rem]">
                <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 px-8 max-w-custom mx-auto">
                    <FooterCell title={t("title.issued-by")}>
                        <Link href="https://www.uni-lj.si/">
                            <Image src={uniLJ} height={120} alt={t("accessibility.uni")} />
                        </Link>
                    </FooterCell>

                    <FooterCell title={t("title.manager")}>
                        <Link href="https://www.cjvt.si/">
                            <Image src={cjvt} alt={t("accessibility.cjvt")} />
                        </Link>
                    </FooterCell>

                    <FooterCell title={t("title.supporters")}>
                        <div className="flex h-full flex-col justify-between">
                            <Link href="https://www.gov.si/drzavni-organi/ministrstva/ministrstvo-za-kulturo/">
                                <Image src={mzk} alt={t("accessibility.mzk")} />
                            </Link>

                            <Link href="https://www.arrs.si/sl/">
                                <Image src={arisLogo} alt="Aris" />
                            </Link>
                        </div>
                    </FooterCell>

                    <FooterCell title={t("title.source")}>
                        <Link href="https://www.clarin.si/repository/xmlui/handle/11356/1887">
                            <Image src={clarin} height={100} alt={t("accessibility.clarin")} />
                        </Link>
                    </FooterCell>

                    <FooterCell title={t("title.accessibility")} colSpan={2}>
                        <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                            <p className="pb-6 text-xs">{t("body.accessibility")}</p>
                            <Image
                                src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg"
                                width={82}
                                height={28}
                                alt="CC BY-SA 4.0"
                            />
                        </a>
                    </FooterCell>

                    <FooterCell title={t("title.info")} colSpan={2}>
                        <div className="grid grid-cols-2 grid-rows-2 gap-y-2 gap-x-8 text-xs">
                            <p className="whitespace-pre-line">{t("body.cjvt")}</p>
                            <p>
                                <span className="text-light-grey">{t("title.phone")}</span>
                                <br />
                                <span>{t("body.phone")}</span>
                            </p>
                            <p className="text-light-grey whitespace-pre-line">{t("body.address")}</p>
                            <p>
                                <span className="text-light-grey">{t("title.email")}</span>
                                <br />
                                <span>{t("body.email")}</span>
                            </p>
                        </div>
                    </FooterCell>
                </ul>
            </footer>

            <p className="flex gap-2 bg-footer px-3 py-2 text-white/30 text-xs">
                {process.env.NEXT_PUBLIC_VERSION_REF || "unknown"}
            </p>
        </>
    );
}

const FooterCell = ({ title, colSpan = 1, children }: { title?: string; colSpan?: number; children: ReactNode }) => {
    const dynamicClasses = clsx(
        title ? "grid-rows-[3.5rem_1fr]" : "grid-rows-1",
        colSpan === 2 && "col-span-2 md:border-transparent lg:border-grey"
    );

    const dynamicBodyClasses = clsx(title ? "items-end justify-start" : "items-center justify-center");

    return (
        <li className={`grid grid-cols-1 p-6 pb-0 border-l border-transparent md:border-grey ${dynamicClasses}`}>
            {title && <h5 className="text-xs text-light-grey">{title}</h5>}
            <div className={`text-white body-2 !font-light flex ${dynamicBodyClasses}`}>{children}</div>
        </li>
    );
};
