import { NotFoundBody } from "@/components/site/not-found-body";
import { getBlocks } from "@/lib/queries/content";

/** notFound() inside the (site) group: the layout already carries the header and footer. */
export default async function NotFound() {
  const blocks = await getBlocks(["Errors"]);
  return <NotFoundBody blocks={blocks} />;
}
