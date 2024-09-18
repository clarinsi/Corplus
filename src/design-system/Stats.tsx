interface StatsProps {
    title: string;
    value: string;
}

export default function Stats({ title, value }: StatsProps) {
    return (
        <div className="border-t border-white flex flex-col text-white">
            <span className="py-4 headline-l">{value}</span>

            <span className="callout">{title}</span>
        </div>
    );
}
