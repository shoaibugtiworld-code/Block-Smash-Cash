// ================================================================
// FILE: supabase.js - Database Connection & Functions
// ================================================================

const SUPABASE_URL = 'https://qwcfcqkgbwzabsjvkrse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Y2ZjcWtnYnd6YWJzanZrcnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1Mzk0NzIsImV4cCI6MjEwMDExNTQ3Mn0.mlC1lCjD8xhKnMP5YX4fxbehuwoH6KkfO6OtEgiGgnM';

// Initialize Supabase client
const supabase = window.supabase || supabase;
if (!window.supabase) {
    // Load Supabase CDN if not already loaded
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    document.head.appendChild(script);
    // Wait for it to load
    script.onload = function() {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    };
} else {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ================================================================
// DATABASE FUNCTIONS
// ================================================================

/**
 * Get a user by username
 */
async function getUser(username) {
    const { data, error } = await window.supabase
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

/**
 * Create a new user
 */
async function createUser(username, userId, referredBy) {
    const { data, error } = await window.supabase
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

/**
 * Update user's game stats
 */
async function updateUserStats(username, points, games, wins) {
    const { error } = await window.supabase
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

/**
 * Update user's balance
 */
async function updateUserBalance(username, balance, availableBalance) {
    const { error } = await window.supabase
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

/**
 * Get all users (for leaderboard)
 */
async function getAllUsers() {
    const { data, error } = await window.supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false });
    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    return data;
}

/**
 * Get all referrals for a referrer
 */
async function getReferrals(referrer) {
    const { data, error } = await window.supabase
        .from('referrals')
        .select('*')
        .eq('referrer', referrer);
    if (error) {
        console.error('Error fetching referrals:', error);
        return [];
    }
    return data;
}

/**
 * Add a referral record
 */
async function addReferral(referrer, referee) {
    const { error } = await window.supabase
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

/**
 * Mark referral as active
 */
async function activateReferral(referee) {
    const { error } = await window.supabase
        .from('referrals')
        .update({ active: true })
        .eq('referee', referee);
    if (error) {
        console.error('Error activating referral:', error);
    }
}

/**
 * Get withdrawal history for a user
 */
async function getWithdrawals(username) {
    const { data, error } = await window.supabase
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

/**
 * Create a withdrawal request
 */
async function createWithdrawal(txn, username, account, amount) {
    const { error } = await window.supabase
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

/**
 * Update withdrawal status (admin)
 */
async function updateWithdrawalStatus(txn, status, txnId) {
    const updateData = { status: status };
    if (txnId) updateData.txn_id = txnId;
    const { error } = await window.supabase
        .from('withdrawals')
        .update(updateData)
        .eq('txn', txn);
    if (error) {
        console.error('Error updating withdrawal:', error);
        return false;
    }
    return true;
}

/**
 * Get all pending withdrawals (admin)
 */
async function getPendingWithdrawals() {
    const { data, error } = await window.supabase
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

/**
 * Get all withdrawals (admin)
 */
async function getAllWithdrawals() {
    const { data, error } = await window.supabase
        .from('withdrawals')
        .select('*')
        .order('date', { ascending: false });
    if (error) {
        console.error('Error fetching withdrawals:', error);
        return [];
    }
    return data;
}

/**
 * Get prize pool settings
 */
async function getPrizePool() {
    const { data, error } = await window.supabase
        .from('settings')
        .select('value')
        .eq('key', 'current_pool')
        .single();
    if (error) {
        console.error('Error fetching pool:', error);
        return 45230;
    }
    return parseFloat(data.value) || 45230;
}

/**
 * Update prize pool (admin)
 */
async function updatePrizePool(amount) {
    const { error } = await window.supabase
        .from('settings')
        .update({ value: String(amount), updated_at: new Date().toISOString() })
        .eq('key', 'current_pool');
    if (error) {
        console.error('Error updating pool:', error);
        return false;
    }
    return true;
}

/**
 * Get admin password
 */
async function getAdminPassword() {
    const { data, error } = await window.supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_password')
        .single();
    if (error) {
        console.error('Error fetching admin password:', error);
        return '';
    }
    return data.value || '';
}

/**
 * Set admin password (first time only)
 */
async function setAdminPassword(password) {
    const { error } = await window.supabase
        .from('settings')
        .upsert({ key: 'admin_password', value: password, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
        console.error('Error setting admin password:', error);
        return false;
    }
    return true;
}

/**
 * Get ad settings
 */
async function getAdSetting(key) {
    const { data, error } = await window.supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
    if (error) {
        return '';
    }
    return data.value || '';
}

/**
 * Update ad setting (admin)
 */
async function updateAdSetting(key, value) {
    const { error } = await window.supabase
        .from('settings')
        .upsert({ key: key, value: value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
        console.error('Error updating ad setting:', error);
        return false;
    }
    return true;
}

// Export functions globally
window.getUser = getUser;
window.createUser = createUser;
window.updateUserStats = updateUserStats;
window.updateUserBalance = updateUserBalance;
window.getAllUsers = getAllUsers;
window.getReferrals = getReferrals;
window.addReferral = addReferral;
window.activateReferral = activateReferral;
window.getWithdrawals = getWithdrawals;
window.createWithdrawal = createWithdrawal;
window.updateWithdrawalStatus = updateWithdrawalStatus;
window.getPendingWithdrawals = getPendingWithdrawals;
window.getAllWithdrawals = getAllWithdrawals;
window.getPrizePool = getPrizePool;
window.updatePrizePool = updatePrizePool;
window.getAdminPassword = getAdminPassword;
window.setAdminPassword = setAdminPassword;
window.getAdSetting = getAdSetting;
window.updateAdSetting = updateAdSetting;
