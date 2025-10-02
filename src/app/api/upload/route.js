import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // nombre único
    const fileName = Date.now() + "-" + file.name;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    await writeFile(filePath, buffer);

    return new Response(JSON.stringify({ fileName }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Error uploading file" }), { status: 500 });
  }
}
