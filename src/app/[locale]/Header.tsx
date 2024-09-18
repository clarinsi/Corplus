"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import LangSwitcher from "@/app/[locale]/LangSwitcher";
import { LoadingIcon } from "@/assets/icons/LoadingIcon";
import SwitcherIcon from "@/assets/icons/SwitcherIcon";
import kostLogo from "@/assets/images/kost-logo.svg";
import HeaderSearchBar from "@/components/HeaderSearchBar";
import OtherSources from "@/components/OtherSources";
import IconButton from "@/design-system/button/IconButton";
import TextButton from "@/design-system/button/TextButton";
import { Link } from "@/navigation";

interface HeaderProps {
    lemma?: string;
    showSearch?: boolean;
    showAllSources?: boolean;
}

export default function Header({ lemma, showSearch = false, showAllSources = false }: HeaderProps) {
    const t = useTranslations("Header");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
            <header className="py-2 bg-surface-static-emphasised">
                <div className="flex justify-between items-center px-8 max-w-custom mx-auto">
                    <Link href={"/"}>
                        <Image src={kostLogo} height={30} alt="cjvt logo" priority={true} />
                    </Link>

                    {showSearch && (
                        <div className="flex items-center gap-2 col-span-2">
                            <Suspense>
                                <HeaderSearchBar setIsLoading={setIsLoading} />
                                <IconButton
                                    bg="emphasised"
                                    shape="round"
                                    hiearchy="primary"
                                    size="small"
                                    onClick={() => setIsOpen(!isOpen)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <LoadingIcon className="stroke-white" /> : <SwitcherIcon />}
                                </IconButton>
                            </Suspense>
                        </div>
                    )}
                    {!showSearch && <div className="col-span-2" aria-hidden />}

                    <div className="justify-self-end flex items-center gap-2 text-white">
                        <TextButton
                            type="link"
                            href="https://www.cjvt.si/korpus-kost/"
                            bg="emphasised"
                            hiearchy="ghost"
                            size="medium"
                        >
                            <span className="body-2">{t("about")}</span>
                        </TextButton>
                        <LangSwitcher />
                        {showAllSources && (
                            <TextButton
                                bg="light"
                                hiearchy="primary"
                                size="medium"
                                leadingIcon={<SwitcherIcon />}
                                type="link"
                                href="https://viri.cjvt.si/"
                            >
                                {t("all-sources")}
                            </TextButton>
                        )}
                    </div>
                </div>
            </header>

            {isOpen && <OtherSources currentLemma={lemma} />}
        </>
    );
}
