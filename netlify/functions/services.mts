import type { Config } from "@netlify/functions";
import { asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { services } from "../../db/schema.js";

export default async () => {
  try {
    const rows = await db
      .select({
        name: services.name,
        category: services.category,
        icon: services.icon,
        description: services.description,
        address: services.address,
        hours: services.hours,
        phone: services.phone,
        verified: services.verified,
        search: services.search,
      })
      .from(services)
      .orderBy(asc(services.id));
    return Response.json({ services: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not read services from the database", error);
    return Response.json({ error: "Could not load services." }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/services",
  method: "GET",
};
