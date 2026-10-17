import { PostsListView } from "@/components/practice/views/posts-list";

/** Browser coach session: not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return <PostsListView />;
}
