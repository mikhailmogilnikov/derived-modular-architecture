import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/shared/ui/layout-options";

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    <HomeLayout {...baseOptions(lang)} className="[&>main]:max-w-none">
      {children}
    </HomeLayout>
  );
}
