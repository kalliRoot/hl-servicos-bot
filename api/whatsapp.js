module.exports = async (req, res) => {
  console.log('✅ WEBHOOK CHAMADO');
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>🔌 HL SERVIÇOS - TESTE OK! Funcionando!</Message>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
};
