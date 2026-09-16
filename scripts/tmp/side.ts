import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL! }) });
async function main() {
  const r = await prisma.project.update({ where: { slug: "orbit-booking" }, data: { storySide: process.argv[2] ?? "RIGHT" }, select: { storySide: true } });
  console.log("orbit-booking storySide =", r.storySide);
  await prisma.$disconnect();
}
main();
