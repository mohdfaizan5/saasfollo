
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-[#F6F6F6]">
            {children}
        </div>
    );
}
