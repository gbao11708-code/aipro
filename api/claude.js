// api/claude.js
export default async function handler(req, res) {
    const { prompt, image } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    try {
        let messages = [];

        if (image) {
            // Groq hỗ trợ vision với model llama-4-scout hoặc llama-4-maverick
            const base64Data = image.split(',')[1] || image;
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
                model: image ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile",
                messages,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });

        const reply = data.choices?.[0]?.message?.content || "AI không phản hồi.";
        res.status(200).json({ reply });

    } catch (error) {
        res.status(500).json({ error: "Lỗi kết nối: " + error.message });
    }
}