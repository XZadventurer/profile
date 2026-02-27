import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { content } = req.body;

    const response = await fetch('https://www.xsjplay.com/proxy/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'sk-OymnAGVwyGGgtiDlIca6wAXlvyrCU9EqjV7EZwilOJ2fiySz',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `你是一位专业的简历顾问。请分析以下简历并提供：
1. 整体评分(0-100)
2. 优点(3-5条)
3. 改进建议(3-5条)
4. 关键技能提取
5. 适合的职位方向

请用JSON格式返回：{"score":数字,"strengths":[],"improvements":[],"skills":[],"positions":[]}

简历内容：
${content}`
          }
        ]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API调用失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
});
