import { Router } from 'express';
import { authRequired, readUsers, updateUsers } from './utils.js';

const router = Router();

// Helper to normalize campaigns array
const normalizeCampaigns = (campaigns) => {
  if (!Array.isArray(campaigns)) return [];
  return campaigns.map((c) => ({
    id: c.id || `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: c.name || 'Unnamed Campaign',
    ownerId: c.ownerId,
    ownerName: c.ownerName || 'Unknown',
    lastUsed: c.lastUsed || Date.now(),
    characters: Array.isArray(c.characters) ? c.characters : [],
  }));
};

// GET /campaigns/me - Get current user's campaigns with characters
router.get('/me', authRequired, async (req, res) => {
  const campaigns = normalizeCampaigns(req.user.campaigns);
  return res.json({ campaigns });
});

// DELETE /campaigns/:id - Delete a campaign if owned by user
router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  
  let deleted = false;
  await updateUsers((users) => {
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) return users;
    
    const userCampaigns = normalizeCampaigns(users[idx].campaigns);
    const campaignIdx = userCampaigns.findIndex((c) => c.id === id);
    
    if (campaignIdx === -1) return users;
    
    // Check ownership
    if (userCampaigns[campaignIdx].ownerId !== req.user.id) {
      return users;
    }
    
    userCampaigns.splice(campaignIdx, 1);
    users[idx] = { ...users[idx], campaigns: userCampaigns };
    deleted = true;
    return users;
  });
  
  if (!deleted) {
    return res.status(404).json({ error: 'Campaign not found or not owned by you.' });
  }
  
  return res.json({ success: true });
});

// DELETE /campaigns/:id/character/:charId - Remove a character from a campaign
router.delete('/:id/character/:charId', authRequired, async (req, res) => {
  const { id, charId } = req.params;
  
  let deleted = false;
  await updateUsers((users) => {
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) return users;
    
    const userCampaigns = normalizeCampaigns(users[idx].campaigns);
    const campaignIdx = userCampaigns.findIndex((c) => c.id === id);
    
    if (campaignIdx === -1) return users;
    
    // Check ownership
    if (userCampaigns[campaignIdx].ownerId !== req.user.id) {
      return users;
    }
    
    const campaign = userCampaigns[campaignIdx];
    const charIdx = campaign.characters.findIndex((ch) => ch.id === charId);
    
    if (charIdx === -1) return users;
    
    campaign.characters.splice(charIdx, 1);
    campaign.lastUsed = Date.now();
    userCampaigns[campaignIdx] = campaign;
    users[idx] = { ...users[idx], campaigns: userCampaigns };
    deleted = true;
    return users;
  });
  
  if (!deleted) {
    return res.status(404).json({ error: 'Character not found or not owned by you.' });
  }
  
  return res.json({ success: true });
});

export default router;
