import { MainHeader } from "@/components/layout/main-header";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
        <MainHeader />
            {children}
        </>
    );
}
