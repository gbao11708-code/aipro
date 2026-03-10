export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Chưa có API Key trên Vercel!" });
  }

  try {
    // Sử dụng endpoint v1 và model gemini-1.5-flash chuẩn
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();
    
    // Nếu API trả về lỗi từ Google
    if (data.error) {
      return res.status(data.error.code || 400).json({ error: data.error.message });
    }

    // Kiểm tra xem có dữ liệu trả về không
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const reply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply });
    } else {
      res.status(500).json({ error: "AI không trả về nội dung phù hợp." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối: " + error.message });
  }
}