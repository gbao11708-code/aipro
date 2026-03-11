// api/claude.js
export default async function handler(req, res) {
    // Cho phép CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // Kiểm tra API key tồn tại
    if (!apiKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY chưa được cấu hình trong Vercel Environment Variables' });
    }

    const { prompt, image } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Thiếu prompt' });
    }

    try {
        let messages = [];

        if (image) {
            // Dùng model vision khi có ảnh
            const base64Data = image.includes(',') ? image.split(',')[1] : image;
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Data}`
                        }
                    }
                ]
            });
        } else {
            messages.push({
                role: "user",
                content: prompt
            });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: image
                    ? "meta-llama/llama-4-scout-17b-16e-instruct"  // Model vision
                    : "llama-3.3-70b-versatile",                    // Model text
                messages,
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        const data = await response.json();

        // Log lỗi chi tiết từ Groq
        if (!response.ok || data.error) {
            console.error('Groq API error:', data);
            return res.status(response.status).json({
                error: data.error?.message || `Groq API lỗi: ${response.status}`
            });
        }

        const reply = data.choices?.[0]?.message?.content || "AI không phản hồi.";
        res.status(200).json({ reply });

    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ error: "Lỗi kết nối: " + error.message });
    }
}