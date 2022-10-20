import fetch from "node-fetch";
const AUTH0_TENANT = process.env.AUTH0_TENANT;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_SECRET = process.env.AUTH0_SECRET;
const TEMPLATE_ID = process.env.TEMPLATE_ID;

if (!AUTH0_TENANT) throw new Error("AUTH0_TENANT not set");
if (!AUTH0_CLIENT_ID) throw new Error("AUTH0_CLIENT_ID not set");
if (!AUTH0_SECRET) throw new Error("AUTH0_SECRET not set");
if (!TEMPLATE_ID) throw new Error("TEMPLATE_ID not set");

export default async function handler(req, res) {
  try {
    const result = await run();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

async function run() {
  const result = await fetch(`https://${AUTH0_TENANT}/vcs/presentation-request`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_SECRET,
      template_id: TEMPLATE_ID,
    }),
  });
  const { url, request_id, expires_at } = await result.json();

  // the url is the "QR Code" that a wallet would scan
  return { url, request_id, expires_at };
}
