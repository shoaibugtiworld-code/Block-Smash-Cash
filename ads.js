// ================================================================
// FILE: ads.js - CENTRAL AD MANAGEMENT
// All ad placements in one place for easy maintenance
// ================================================================

// ===== CONFIGURATION =====
// Change these links in one place - they will update everywhere
const AD_LINKS = {
    // Home Page Play Button Ad
    playButton: 'https://shrtslug.biz/8YSjH',
    
    // In-Game Replay / Game Over Ad
    replayAd: 'https://shrtslug.biz/8YSjH',
    
    // Reward Ad (Watch Ad for 2x/4x Score)
    rewardAd: 'https://shrtslug.biz/8YSjH'
};

// ===== AD FUNCTIONS =====

/**
 * Show ad on Play Button click (Home Page)
 * Opens ad link, then starts the game
 */
function showPlayButtonAd(callback) {
    console.log('🎯 Play Button Ad');
    const link = AD_LINKS.playButton;
    if (link) {
        window.open(link, '_blank');
    }
    // Execute callback after ad (with delay for ad to register)
    if (callback) {
        setTimeout(callback, 500);
    }
}

/**
 * Show ad on Game Over / Replay
 * Opens ad link, then restarts game
 */
function showReplayAd(callback) {
    console.log('🎯 Replay Ad');
    const link = AD_LINKS.replayAd;
    if (link) {
        window.open(link, '_blank');
    }
    if (callback) {
        setTimeout(callback, 500);
    }
}

/**
 * Show Rewarded Ad (Watch Ad for 2x or 4x Score)
 * Opens ad link, then applies bonus
 */
function showRewardAd(bonusMultiplier, callback) {
    console.log('🎯 Reward Ad - ' + bonusMultiplier + 'x Bonus');
    const link = AD_LINKS.rewardAd;
    if (link) {
        window.open(link, '_blank');
    }
    if (callback) {
        setTimeout(function() {
            callback(bonusMultiplier);
        }, 500);
    }
}

/**
 * Get random multiplier for reward ad (2x or 4x)
 * Returns 2 or 4
 */
function getRandomMultiplier() {
    const rand = Math.random();
    if (rand < 0.3) {
        return 4; // 30% chance for 4x
    }
    return 2; // 70% chance for 2x
}

// ================================================================
// GAME INTEGRATION - Use these in game.html
// ================================================================

/**
 * Track how many games played since last ad
 * This helps show ad every 3 games
 */
let gameCounterSinceAd = 0;
let totalGamesPlayed = 0;

/**
 * Call this when a game ends (Game Over)
 * Returns: true if ad should be shown, false otherwise
 */
function shouldShowAdAfterGame() {
    gameCounterSinceAd++;
    totalGamesPlayed++;
    
    // Show ad every 2-4 games (randomized for psychology)
    if (gameCounterSinceAd >= 3) {
        // Random: sometimes 4th game, sometimes 3rd
        if (Math.random() < 0.6 || gameCounterSinceAd >= 4) {
            gameCounterSinceAd = 0;
            return true;
        }
    }
    return false;
}

/**
 * Reset the game counter (call when user watches ad)
 */
function resetGameCounter() {
    gameCounterSinceAd = 0;
}

// ================================================================
// HOME PAGE INTEGRATION
// ================================================================

/**
 * Handle Play Button click on Home Page
 * Shows ad then navigates to game
 */
function handlePlayButtonClick() {
    showPlayButtonAd(function() {
        window.location.href = 'game.html';
    });
}

// ================================================================
// GAME PAGE INTEGRATION - Add these to game.html
// ================================================================

/**
 * Handle Game Over / Replay
 * Shows ad based on game counter, then restarts
 */
function handleGameOverWithAd() {
    if (shouldShowAdAfterGame()) {
        // Show ad, then restart
        showReplayAd(function() {
            restartGame(); // Call your game restart function
        });
    } else {
        // No ad, just restart
        restartGame(); // Call your game restart function
    }
}

/**
 * Handle Reward Ad (2x/4x Score)
 * Called when user clicks "Watch Ad for Bonus" button
 */
function handleRewardAd(currentScore) {
    const multiplier = getRandomMultiplier();
    showRewardAd(multiplier, function(bonus) {
        // Apply bonus to score
        const newScore = currentScore * bonus;
        // Update game score display
        // This function should be implemented in game.html
        if (typeof window.applyScoreBonus === 'function') {
            window.applyScoreBonus(newScore, bonus);
        }
    });
}

// ================================================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ================================================================

// For Home Page (index.html)
window.handlePlayButtonClick = handlePlayButtonClick;

// For Game Page (game.html)
window.handleGameOverWithAd = handleGameOverWithAd;
window.handleRewardAd = handleRewardAd;
window.shouldShowAdAfterGame = shouldShowAdAfterGame;
window.resetGameCounter = resetGameCounter;
window.getRandomMultiplier = getRandomMultiplier;
