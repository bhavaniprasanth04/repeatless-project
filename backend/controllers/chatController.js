require('dotenv').config();

/**
 * Validates and retrieves the n8n chat webhook URL.
 */
const getChatWebhookUrl = () => {
  const url = process.env.N8N_CHAT_WEBHOOK_URL;
  if (!url || url === 'your_n8n_chat_webhook_url_here') {
    throw new Error('N8N_CHAT_WEBHOOK_URL environment variable is not configured.');
  }
  return url;
};

/**
 * Handle Conversational Chat Queries proxy
 * POST /api/chat
 */
exports.handleChatQuery = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const chatWebhookUrl = getChatWebhookUrl();
    console.log('[Chat Proxy] Forwarding chat query to n8n...');

    const response = await fetch(chatWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`n8n chat webhook returned status ${response.status}`);
    }

    const data = await response.json();

    // Propagate AI response and database citations straight back to UI
    return res.json({
      response: data.response || data.output || data.text || 'No response from AI agent',
      citations: data.citations || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Chat Proxy Error]:', error.message);
    return res.status(502).json({
      error: 'Failed to communicate with n8n chat agent',
      message: error.message
    });
  }
};
