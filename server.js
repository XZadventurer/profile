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
            content: `请对以下文本进行结构化分析和信息提取：

任务：
1. 评估文本的完整性和专业性（0-100分）
2. 识别文本中的优势特征（3-5条）
3. 识别可以改进的地方（3-5条）
4. 提取关键技术词汇
5. 根据内容推断适合的技术领域

请用JSON格式返回，所有内容使用中文：
{"score":数字,"strengths":["特征1","特征2"],"improvements":["改进点1","改进点2"],"skills":["技术1","技术2"],"positions":["领域1","领域2"]}

文本内容：
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
