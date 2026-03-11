// api/claude.js
export default async function handler(req, res) {
    const { prompt, image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        let parts = [{ text: prompt }];
        if (image) {
            const base64Data = image.split(',')[1];
            parts.push({ inline_data: { mime_type: "image/jpeg", data: base64Data } });
        }

        // FIX TÊN MODEL: Bỏ chữ "-latest" đi để không bị lỗi 400
       // Thay đổi dòng này trong api/claude.js
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
});
        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI không phản hồi.";
        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ error: "Lỗi Server: " + error.message });
    }
}