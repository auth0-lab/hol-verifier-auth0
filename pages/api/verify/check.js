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
    const id = req.body.request_id;
    const result = await run(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

async function run(id) {
  if (!id) throw new Error("request_id not found");

  const result = await fetch(`https://${AUTH0_TENANT}/vcs/presentation-request/${id}/status`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_SECRET,
      template_id: TEMPLATE_ID,
    }),
  });

  const data = await result.json();

  if (data.presentation) {
    data.presentation = JSON.parse(data.presentation);
  }

  return data;
}
