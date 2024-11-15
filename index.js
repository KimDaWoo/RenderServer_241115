// Express 설정
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

// CORS 미들웨어 설정 
app.use(cors({
  origin: 'http://www.zazaero.com'  // 허용할 도메인 설정 (또는 '*'로 모든 도메인 허용)
}));

app.use(express.json());

// 액세스 토큰 발급 엔드포인트
app.get('/process-auth', async (req, res) => {
  const code = req.query.code;
  const customerKey = req.query.customerKey;

  if (!code || !customerKey) {
    return res.status(400).send("Missing code or customerKey");
  }

  // Toss Payments API 호출
  const widgetSecretKey = process.env.WIDGET_SECRET_KEY;
  const encodedKey = Buffer.from(`${widgetSecretKey}:`).toString('base64');
  const url = "https://api.tosspayments.com/v1/brandpay/authorizations/access-token";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      grantType: "AuthorizationCode",
      customerKey: customerKey,
      code: code
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(data);

    // 전체 응답 데이터와 함께 accessToken이 있다면 표시
    res.json({
      success: data.accessToken ? true : false,
      message: data.accessToken ? "Access Token 발급 성공" : "Access Token 발급 실패",
      accessToken: data.accessToken || null,
      fullResponse: data
    });
  } catch (error) {
    console.error("Error requesting access token:", error);
    res.status(500).json({ 
      message: "Error requesting access token",
      error: error.message
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
