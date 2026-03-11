export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { prompt, image } = req.body; // Nhận thêm trường image (base64)
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    let payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    // Nếu có gửi kèm ảnh, thêm dữ liệu ảnh vào payload cho Gemini 1.5 Flash
    if (image) {
      payload.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: image
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI không phản hồi.";
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Lỗi Server: " + error.message });
  }
}