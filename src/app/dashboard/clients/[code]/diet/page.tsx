import { redirect } from "next/navigation";

type Params = Promise<{ code: string }>;

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default async function Page({ params }: { params: Params }) {
  const { code } = await params;
  redirect(`/dashboard/clients/${encodeURIComponent(code)}?tab=diet`);
}
