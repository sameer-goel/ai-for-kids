export async function onRequestPost(context) {
  const { request } = context;

  try {
    const data = await request.json();
    const { email, children } = data;

    if (!email || !children || !children.length) {
      return Response.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const childList = children.map(c => `${c.name} (age ${c.age})`).join(", ");

    const notifyBody = [
      `Parent: ${email}`,
      `Children: ${childList}`,
      `Time: ${new Date().toISOString()}`
    ].join("\n");

    await fetch("https://ntfy.sh/ai-for-kids-signups-sameer", {
      method: "POST",
      headers: {
        "Title": `${childList} - ${email}`,
        "Priority": "high",
        "Tags": "child,sparkles"
      },
      body: notifyBody
    });

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false, message: e.message }, { status: 500 });
  }
}
