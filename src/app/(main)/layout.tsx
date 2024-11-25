import HeaderBar from "@/components/shared/header-bar";
import Menubar from "@/components/shared/menubar";
import RightBar from "@/components/shared/right-bar";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-full flex flex-col max-w-[1440px] mx-auto">
      <HeaderBar />
      <div className="flex flex-grow gap-4 overflow-hidden px-7.5">
        <Menubar className="sticky hidden h-full flex-none space-y-3 rounded-2xl bg-card py-2.5 sm:block xl:w-48" />
        {children}
        <RightBar className="sticky w-[280px] h-full flex-none space-y-5 rounded-2xl bg-card py-2.5" />
      </div>
    </div>
  );
};

export default MainLayout;
