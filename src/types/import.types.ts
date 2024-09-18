interface OrigXmlData {
    bibl: {
        note: XmlNode[];
        $: {
            n: string;
        };
    };
    p: {
        s: {
            w?: WordNode[];
            seg?: {
                w?: WordNode[];
                pc?: PcNode[];
            }[];
            pc?: PcNode[] | PcNode;
            $: {
                "xml:id": string;
            };
        }[];
        $: {
            "xml:id": string;
        };
    }[];
    $: {
        "xml:id": string;
        corresp: string;
    };
}

interface ErrXmlData {
    link: {
        $: {
            type: string;
            target: string;
        };
    }[];
    $: {
        type: string;
        targFunc: string;
        corresp: string;
    };
}

interface XmlNode {
    $?: Record<string, string>;
    $text?: string;
}

interface WordNode {
    $: {
        ana: string;
        msd: string;
        lemma?: string;
        "xml:id": string;
    };
    $text: string;
}

type PcNode = Omit<WordNode, "lemma">;
