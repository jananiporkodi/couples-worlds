import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * The "Us" page was folded into Home ... This route is kept only as a redirect for any old bookmarks/links, and is
 * removed entirely from the repo in the next commit (see `git rm`).
 */
export default function UsPageRedirect() {
  const slug = headers().get("x-world-slug") ?? "our-world";
  redirect(`/w/${slug}`);
}
