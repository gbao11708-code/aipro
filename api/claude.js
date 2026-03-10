export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { messages, system, model, max_tokens } = req.body;
        // Key này chúng ta sẽ cài trên web Vercel sau, không viết vào code này
        const API_KEY = process.env.ANTHROPIC_API_KEY; 

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: model || "claude-3-5-sonnet-20240620",
                max_tokens: max_tokens || 1500,
                system: system,
                messages: messages
            })
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}