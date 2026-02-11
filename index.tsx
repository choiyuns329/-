
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal: Root element not found in index.html");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React Mounting Error:", error);
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; color: #ef4444; font-family: sans-serif; padding: 20px;">
        <h2 style="font-weight: 800; margin-bottom: 8px;">렌더링 오류</h2>
        <p style="color: #64748b; margin-bottom: 16px;">어플리케이션을 시작하는 중 오류가 발생했습니다.</p>
        <pre style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-size: 12px; color: #334155; text-align: left; max-width: 100%; overflow-x: auto;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
        <button onclick="location.reload()" style="margin-top:20px; padding:12px 24px; background:#6366f1; color:white; border:none; border-radius:12px; font-weight:700; cursor:pointer;">다시 시도</button>
      </div>
    `;
  }
}
