// ================================================================
// FILE: supabase.js - Database Connection & Functions
// ================================================================

const SUPABASE_URL = 'https://qwcfcqkgbwzabsjvkrse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Y2ZjcWtnYnd6YWJzanZrcnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1Mzk0NzIsImV4cCI6MjEwMDExNTQ3Mn0.mlC1lCjD8xhKnMP5YX4fxbehuwoH6KkfO6OtEgiGgnM';

// Initialize Supabase client
let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient) {
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized.');
        } else {
            console.error('❌ Supabase library not loaded. Make sure to include the CDN script.');
        }
    }
    return supabaseClient;
}

// ================================================================
// USER FUNCTIONS
// ================================================================

async function getUser(username) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error);
        return null;
    }
    return data;
}

async function createUser(username, userId, referredBy) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
        .from('users')
        .insert([{
            username: username,
            user_id: userId,
            referred_by: referredBy || null,
            total_points: 0,
            total_games: 0,
            total_wins: 0,
            balance: 0,
            available_balance: 0,
            joined: new Date().toISOString()
        }])
        .select()
        .single();
    if (error) {
        console.error('Error creating user:', error);
        return null;
    }
    return data;
}

async function updateUserStats(username, points, games, wins) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client
        .from('users')
        .update({
            total_points: points,
            total_games: games,
            total_wins: wins
        })
        .eq('username', username);
    if (error) {
        console.error('Error updating stats:', error);
    }
}

async function updateUserBalance(username, balance, availableBalance) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client
        .from('users')
        .update({
            balance: balance,
            available_balance: availableBalance
        })
        .eq('username', username);
    if (error) {
        console.error('Error updating balance:', error);
    }
}

async function getAllUsers() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('users')
        .select('*')
        .order('total_points', { ascending: false });
    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    return data;
}

async function deleteUser(username) {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
        .from('users')
        .delete()
        .eq('username', username);
    if (error) {
        console.error('Error deleting user:', error);
        return false;
    }
    return true;
}

// ================================================================
// REFERRAL FUNCTIONS
// ================================================================

async function getReferrals(referrer) {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('referrals')
        .select('*')
        .eq('referrer', referrer);
    if (error) {
        console.error('Error fetching referrals:', error);
        return [];
    }
    return data;
}

async function addReferral(referrer, referee) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client
        .from('referrals')
        .insert([{
            referrer: referrer,
            referee: referee,
            active: false,
            date: new Date().toISOString()
        }]);
    if (error) {
        console.error('Error adding referral:', error);
    }
}

async function activateReferral(referee) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client
        .from('referrals')
        .update({ active: true })
        .eq('referee', referee);
    if (error) {
        console.error('Error activating referral:', error);
    }
}

async function getAllReferrals() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('referrals')
        .select('*');
    if (error) {
        console.error('Error fetching all referrals:', error);
        return [];
    }
    return data;
}

// ================================================================
// WITHDRAWAL FUNCTIONS
// ================================================================

async function getWithdrawals(username) {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('withdrawals')
        .select('*')
        .eq('username', username)
        .order('date', { ascending: false });
    if (error) {
        console.error('Error fetching withdrawals:', error);
        return [];
    }
    return data;
}

async function createWithdrawal(txn, username, account, amount) {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
        .from('withdrawals')
        .insert([{
            txn: txn,
            username: username,
            account: account,
            amount: amount,
            status: 'pending',
            date: new Date().toISOString()
        }]);
    if (error) {
        console.error('Error creating withdrawal:', error);
        return false;
    }
    return true;
}

async function updateWithdrawalStatus(txn, status, txnId) {
    const client = getSupabase();
    if (!client) return false;
    const updateData = { status: status };
    if (txnId) updateData.txn_id = txnId;
    const { error } = await client
        .from('withdrawals')
        .update(updateData)
        .eq('txn', txn);
    if (error) {
        console.error('Error updating withdrawal:', error);
        return false;
    }
    return true;
}

async function getPendingWithdrawals() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('amount', { ascending: false });
    if (error) {
        console.error('Error fetching pending withdrawals:', error);
        return [];
    }
    return data;
}

async function getAllWithdrawals() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('withdrawals')
        .select('*')
        .order('date', { ascending: false });
    if (error) {
        console.error('Error fetching withdrawals:', error);
        return [];
    }
    return data;
}

// ================================================================
// SETTINGS FUNCTIONS
// ================================================================

async function getSetting(key) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
    if (error) {
        return null;
    }
    return data ? data.value : null;
}

async function setSetting(key, value) {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
        .from('settings')
        .upsert({ key: key, value: value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
        console.error('Error setting setting:', error);
        return false;
    }
    return true;
}

// ================================================================
// PRIZE POOL FUNCTIONS
// ================================================================

async function getPrizePool() {
    const val = await getSetting('current_pool');
    return val ? parseFloat(val) : 45230;
}

async function updatePrizePool(amount) {
    return await setSetting('current_pool', String(amount));
}

// ================================================================
// ADMIN PASSWORD FUNCTIONS (Supports Change & Forgot)
// ================================================================

async function getAdminPassword() {
    return await getSetting('admin_password') || '';
}

async function setAdminPassword(password) {
    return await setSetting('admin_password', password);
}

// Change password (requires current password)
async function changeAdminPassword(currentPassword, newPassword) {
    const current = await getAdminPassword();
    if (current && current !== currentPassword) {
        return { success: false, error: 'Current password is incorrect.' };
    }
    const success = await setAdminPassword(newPassword);
    if (success) {
        return { success: true, error: null };
    }
    return { success: false, error: 'Failed to update password.' };
}

// Reset password (forgot password - requires security answer)
async function getSecurityQuestion() {
    return await getSetting('security_question') || 'What is your favorite color?';
}

async function getSecurityAnswer() {
    return await getSetting('security_answer') || '';
}

async function setSecurityQuestion(question, answer) {
    await setSetting('security_question', question);
    await setSetting('security_answer', answer.toLowerCase().trim());
}

async function resetAdminPassword(securityAnswer, newPassword) {
    const storedAnswer = await getSecurityAnswer();
    if (!storedAnswer) {
        return { success: false, error: 'Security question not set. Please contact support.' };
    }
    if (securityAnswer.toLowerCase().trim() !== storedAnswer) {
        return { success: false, error: 'Incorrect security answer.' };
    }
    const success = await setAdminPassword(newPassword);
    if (success) {
        return { success: true, error: null };
    }
    return { success: false, error: 'Failed to reset password.' };
}

// ================================================================
// AD SETTINGS FUNCTIONS
// ================================================================

async function getAdSetting(key) {
    return await getSetting(key) || '';
}

async function updateAdSetting(key, value) {
    return await setSetting(key, value);
}

// ================================================================
// BANNER FUNCTIONS
// ================================================================

async function getHomeBanner() {
    return await getSetting('home_banner_code') || '';
}

async function setHomeBanner(code) {
    return await setSetting('home_banner_code', code);
}

// ================================================================
// BOT FUNCTIONS
// ================================================================

async function getBotEnabled() {
    const val = await getSetting('bot_enabled');
    return val === 'true';
}

async function setBotEnabled(enabled) {
    return await setSetting('bot_enabled', enabled ? 'true' : 'false');
}

// ================================================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ================================================================

window.getUser = getUser;
window.createUser = createUser;
window.updateUserStats = updateUserStats;
window.updateUserBalance = updateUserBalance;
window.getAllUsers = getAllUsers;
window.deleteUser = deleteUser;
window.getReferrals = getReferrals;
window.addReferral = addReferral;
window.activateReferral = activateReferral;
window.getAllReferrals = getAllReferrals;
window.getWithdrawals = getWithdrawals;
window.createWithdrawal = createWithdrawal;
window.updateWithdrawalStatus = updateWithdrawalStatus;
window.getPendingWithdrawals = getPendingWithdrawals;
window.getAllWithdrawals = getAllWithdrawals;
window.getPrizePool = getPrizePool;
window.updatePrizePool = updatePrizePool;
window.getAdminPassword = getAdminPassword;
window.setAdminPassword = setAdminPassword;
window.changeAdminPassword = changeAdminPassword;
window.resetAdminPassword = resetAdminPassword;
window.getSecurityQuestion = getSecurityQuestion;
window.setSecurityQuestion = setSecurityQuestion;
window.getAdSetting = getAdSetting;
window.updateAdSetting = updateAdSetting;
window.getHomeBanner = getHomeBanner;
window.setHomeBanner = setHomeBanner;
window.getBotEnabled = getBotEnabled;
window.setBotEnabled = setBotEnabled;
window.getSetting = getSetting;
window.setSetting = setSetting;

console.log('✅ Supabase.js loaded successfully! All functions are ready.');
