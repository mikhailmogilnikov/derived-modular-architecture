import { HomePage } from "@/features/home/public/home-page";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  return <HomePage lang={lang} />;
}
