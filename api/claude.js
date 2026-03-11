export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, image } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    let parts = [{ text: prompt }];
    if (image) {
      parts.push({ inline_data: { mime_type: "image/jpeg", data: image } });
    }

    // Sử dụng v1beta với gemini-2.0-flash-latest để đảm bảo chạy được mọi tính năng
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI không phản hồi.";
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối: " + error.message });
  }
}