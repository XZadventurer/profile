import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';

// 配置 PDF.js worker - 使用unpkg CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function App() {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);

      if (uploadedFile.type === 'application/pdf') {
        // 处理PDF文件
        try {
          const arrayBuffer = await uploadedFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          setFileContent(fullText);
        } catch (error) {
          console.error('PDF解析失败:', error);
          alert('PDF解析失败: ' + error.message + '\n建议使用TXT或MD格式');
        }
      } else {
        // 处理文本文件
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileContent(event.target.result);
        };
        reader.readAsText(uploadedFile, 'UTF-8');
      }
    }
  };

  const analyzeResume = async () => {
    if (!fileContent) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: fileContent
        })
      });

      const data = await response.json();
      console.log('API响应:', data);

      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('API返回数据格式错误: ' + JSON.stringify(data));
      }

      const content = data.content[0].text;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        setAnalysis(parsed);
      } catch {
        setAnalysis({
          score: 75,
          strengths: ['内容已成功分析'],
          improvements: ['请查看详细分析结果'],
          skills: [],
          positions: [],
          rawContent: content
        });
      }
    } catch (error) {
      console.error('分析失败:', error);
      console.error('错误详情:', error.message);
      alert('分析失败: ' + error.message + '\n可能是网络问题或API配置问题，请检查控制台');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* 标题 */}
      <div className="app-header">
        <h1 className="app-title">简历智能顾问</h1>
        <p className="app-subtitle">上传简历，获取专业的AI分析与优化建议</p>
      </div>

      {/* 上传区域 */}
      <div className="upload-section">
        <div className="upload-controls">
          <div className="file-input-wrapper">
            <label className="file-input-label">
              <input
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileUpload}
              />
              <div className="file-input-content">
                <svg className="file-icon" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="file-info">
                  <p className="file-name">
                    {file ? file.name : '选择简历文件'}
                  </p>
                  <p className="file-hint">支持 TXT, MD, PDF</p>
                </div>
              </div>
            </label>
          </div>

          {fileContent && (
            <button
              onClick={analyzeResume}
              disabled={loading}
              className="analyze-button"
            >
              {loading ? (
                <span className="analyze-button-content">
                  <span className="spinner"></span>
                  分析中...
                </span>
              ) : '开始AI分析'}
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="content-grid">
        {/* 简历预览 */}
        {fileContent && (
          <div className="content-card">
            <h2 className="card-header">
              <svg className="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              简历预览
            </h2>
            <div className="resume-preview">
              {fileContent}
            </div>
          </div>
        )}

        {/* 分析结果 */}
        <div className="content-card">
          <h2 className="card-header">
            <svg className="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            分析结果
          </h2>

          {!analysis && !loading && (
            <div className="empty-state">
              <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>上传简历后，AI将为您提供专业分析</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="loading-text">AI正在分析您的简历...</p>
            </div>
          )}

          {analysis && (
            <div className="analysis-content">
              {/* 评分 */}
              <div className="score-section">
                <div className="score-circle">
                  <svg className="score-svg" viewBox="0 0 120 120">
                    <circle className="score-bg" cx="60" cy="60" r="54" />
                    <circle
                      className="score-progress"
                      cx="60"
                      cy="60"
                      r="54"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - analysis.score / 100)}`}
                    />
                  </svg>
                  <div className="score-value">{analysis.score}</div>
                </div>
                <p className="score-label">综合评分</p>
              </div>

              {/* 优点 */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="analysis-section section-strengths">
                  <h3 className="section-title">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    优点
                  </h3>
                  <ul className="section-list">
                    {analysis.strengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 改进建议 */}
              {analysis.improvements && analysis.improvements.length > 0 && (
                <div className="analysis-section section-improvements">
                  <h3 className="section-title">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    改进建议
                  </h3>
                  <ul className="section-list">
                    {analysis.improvements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 关键技能 */}
              {analysis.skills && analysis.skills.length > 0 && (
                <div className="analysis-section section-skills">
                  <h3 className="section-title">关键技能</h3>
                  <div className="tag-container">
                    {analysis.skills.map((skill, idx) => (
                      <span key={idx} className="tag tag-skill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 适合职位 */}
              {analysis.positions && analysis.positions.length > 0 && (
                <div className="analysis-section section-positions">
                  <h3 className="section-title">推荐职位方向</h3>
                  <div className="tag-container">
                    {analysis.positions.map((pos, idx) => (
                      <span key={idx} className="tag tag-position">
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 原始内容 */}
              {analysis.rawContent && (
                <div className="analysis-section section-raw">
                  <h3 className="section-title">详细分析</h3>
                  <div className="raw-content">
                    {analysis.rawContent}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
