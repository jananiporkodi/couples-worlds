import { redirect } from "next/navigation";

/**
 * The "Us" page was folded into Home (countdowns, "did you know" facts, and the stats dashboard
 * all live there now). This route is kept only as a redirect for any old bookmarks/links, and is
 * removed entirely from the repo in the next commit (see `git rm`).
 */
export default function UsPageRedirect() {
  redirect("/");
}
