require('dotenv').config();

// Track in-memory sync status for the UI polling
const syncStatus = {
  isSyncing: false,
  lastSyncedAt: null,
  totalSyncedCount: 0,
  categoriesCount: {
    Work: 0,
    Finance: 0,
    Newsletter: 0
  }
};

/**
 * Validates and retrieves the n8n sync webhook URL.
 */
const getSyncWebhookUrl = () => {
  const url = process.env.N8N_SYNC_WEBHOOK_URL;
  if (!url || url === 'your_n8n_sync_webhook_url_here') {
    throw new Error('N8N_SYNC_WEBHOOK_URL environment variable is not configured.');
  }
  return url;
};

/**
 * Sync Emails proxy endpoint
 * POST /api/emails/sync
 */
exports.syncEmails = async (req, res) => {
  if (syncStatus.isSyncing) {
    return res.status(400).json({ error: 'Sync is already in progress' });
  }

  syncStatus.isSyncing = true;

  try {
    const syncWebhookUrl = getSyncWebhookUrl();
    console.log('[Sync Proxy] Forwarding sync request to n8n...');
    
    const response = await fetch(syncWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers['authorization'] || ''
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...req.body
      })
    });

    if (!response.ok) {
      throw new Error(`n8n sync webhook returned status ${response.status}`);
    }

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      result = { status: 'success' };
    }

    syncStatus.isSyncing = false;
    syncStatus.lastSyncedAt = new Date().toISOString();
    syncStatus.totalSyncedCount = result.totalSyncedCount || result.count || 0;
    
    if (result.categoriesCount) {
      syncStatus.categoriesCount = result.categoriesCount;
    }

    console.log('[Sync Proxy] Sync complete from n8n response.');
    
    return res.json({
      success: true,
      message: 'Sync Complete',
      status: syncStatus,
      data: result
    });
  } catch (error) {
    console.error('[Sync Proxy Error]:', error.message);
    syncStatus.isSyncing = false;
    return res.status(502).json({
      success: false,
      error: 'Failed to communicate with n8n sync service',
      message: error.message
    });
  }
};

exports.getSyncStatus = (req, res) => {
  res.json({ status: syncStatus });
};

exports.syncStatus = syncStatus;
