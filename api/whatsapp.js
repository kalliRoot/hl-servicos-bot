const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  
  try {
    const mensagem = (req.body.Body || '').toLowerCase().trim();
    const from = req.body.From;
    
    let resposta = `🔌 HL SERVIÇOS - Digite: 1-Orçamento, 2-Agendar, 3-Atendente`;
    
    if (mensagem === '1') resposta = '✅ ORÇAMENTO - Escolha: 11-Elétrica, 12-Câmeras, 13-Portões';
    if (mensagem === '11') resposta = '📍 Envie seu ENDEREÇO COMPLETO';
    
    await client.messages.create({
      body: resposta,
      from: 'whatsapp:+14155238886',
      to: from
    });

    res.setHeader('Content-Type', 'text/xml');
    res.send('<?xml version="1.0"?><Response></Response>');
  } catch (error) {
    res.setHeader('Content-Type', 'text/xml');
    res.send('<?xml version="1.0"?><Response></Response>');
  }
};
