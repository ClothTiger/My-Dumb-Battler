// Game State Management
class GameState {
    constructor() {
        this.selectedHero = null;
        this.gold = 300;
        this.talents = {
            attack: { level: 0, value: 0 },
            crit: { level: 0, value: 0 },
            dodge: { level: 0, value: 0 },
            poison: { level: 0, value: 0 },
            heal: { level: 0, value: 0 },
            ultimate: { level: 0, value: 0 }
        };
        this.health = 100;
        this.maxHealth = 100;
        this.shopCards = [];
        this.battleLog = [];
    }

    getTalentConfig(talentType) {
        const configs = {
            attack: {
                name: 'Attack',
                icon: '⚔️',
                description: 'Increases damage output',
                valuePerLevel: 5,
                color: 'attack'
            },
            crit: {
                name: 'Crit',
                icon: '💥',
                description: 'Increases critical hit chance',
                valuePerLevel: 10,
                color: 'crit'
            },
            dodge: {
                name: 'Dodge',
                icon: '💨',
                description: 'Increases chance to avoid attacks',
                valuePerLevel: 8,
                color: 'dodge'
            },
            poison: {
                name: 'Poison',
                icon: '☠️',
                description: 'Adds poison damage over time',
                valuePerLevel: 3,
                color: 'poison'
            },
            heal: {
                name: 'Heal',
                icon: '💚',
                description: 'Provides healing abilities',
                valuePerLevel: 15,
                color: 'heal'
            },
            ultimate: {
                name: 'Ultimate',
                icon: '⭐',
                description: 'Unlocks powerful special abilities',
                valuePerLevel: 20,
                color: 'ultimate'
            }
        };
        return configs[talentType];
    }

    upgradeTalent(talentType) {
        if (this.gold >= 100) {
            this.gold -= 100;
            this.talents[talentType].level += 1;
            
            const config = this.getTalentConfig(talentType);
            this.talents[talentType].value = this.talents[talentType].level * config.valuePerLevel;
            
            this.addBattleMessage(`Upgraded ${config.name} to level ${this.talents[talentType].level}!`);
            return true;
        }
        return false;
    }

    canAfford(cost) {
        return this.gold >= cost;
    }

    spendGold(amount) {
        if (this.canAfford(amount)) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    getTotalDamage() {
        return 10 + this.talents.attack.value;
    }

    addBattleMessage(message) {
        this.battleLog.push({
            message,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Keep only last 50 messages
        if (this.battleLog.length > 50) {
            this.battleLog = this.battleLog.slice(-50);
        }
    }

    generateShopCards() {
        const talentTypes = Object.keys(this.talents);
        this.shopCards = [];
        
        for (let i = 0; i < 5; i++) {
            const randomTalent = talentTypes[Math.floor(Math.random() * talentTypes.length)];
            const config = this.getTalentConfig(randomTalent);
            
            this.shopCards.push({
                id: i,
                talentType: randomTalent,
                name: config.name,
                icon: config.icon,
                description: `${config.description} (+${config.valuePerLevel} per level)`,
                price: 100,
                color: config.color
            });
        }
    }

    reset() {
        this.gold = 300;
        this.talents = {
            attack: { level: 0, value: 0 },
            crit: { level: 0, value: 0 },
            dodge: { level: 0, value: 0 },
            poison: { level: 0, value: 0 },
            heal: { level: 0, value: 0 },
            ultimate: { level: 0, value: 0 }
        };
        this.health = 100;
        this.battleLog = [];
        this.generateShopCards();
    }
}

// UI Controller
class UIController {
    constructor(gameState) {
        this.gameState = gameState;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Hero selection
        document.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroOption = e.target.closest('.hero-option');
                const heroNumber = heroOption.dataset.hero;
                this.selectHero(heroNumber);
            });
        });

        // Shop interactions
        document.getElementById('reroll-btn').addEventListener('click', () => {
            this.rerollShop();
        });

        // Battle actions
        document.getElementById('battle-btn').addEventListener('click', () => {
            this.startBattle();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        // Shop card purchases
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.talent-card');
                const cardIndex = parseInt(card.dataset.card);
                this.purchaseCard(cardIndex);
            });
        });
    }

    selectHero(heroNumber) {
        this.gameState.selectedHero = heroNumber;
        
        // Update hero name and avatar
        document.getElementById('hero-name').textContent = `Hero ${heroNumber}`;
        document.getElementById('hero-avatar').textContent = heroNumber === '1' ? '⚔️' : '🛡️';
        
        // Initialize shop
        this.gameState.generateShopCards();
        
        // Switch to game screen
        document.getElementById('hero-selection').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        // Update all UI elements
        this.updateUI();
        
        this.gameState.addBattleMessage(`Selected Hero ${heroNumber}. Welcome to battle!`);
    }

    updateUI() {
        this.updateGoldDisplay();
        this.updateTalentDisplay();
        this.updateShopDisplay();
        this.updateHealthDisplay();
        this.updateBattleLog();
        this.updateTotalDamage();
    }

    updateGoldDisplay() {
        document.getElementById('gold-amount').textContent = this.gameState.gold;
    }

    updateTalentDisplay() {
        Object.keys(this.gameState.talents).forEach(talentType => {
            const talent = this.gameState.talents[talentType];
            document.getElementById(`${talentType}-level`).textContent = talent.level;
            document.getElementById(`${talentType}-value`).textContent = talent.value;
        });
    }

    updateShopDisplay() {
        this.gameState.shopCards.forEach((card, index) => {
            const cardElement = document.querySelector(`[data-card="${index}"]`);
            const iconElement = cardElement.querySelector('.card-talent-icon');
            const titleElement = cardElement.querySelector('.card-title');
            const descriptionElement = cardElement.querySelector('.card-description');
            const buyBtn = cardElement.querySelector('.buy-btn');

            // Update card content
            iconElement.textContent = card.icon;
            iconElement.className = `card-talent-icon ${card.color}`;
            titleElement.textContent = card.name;
            descriptionElement.textContent = card.description;

            // Update affordability styling
            const canAfford = this.gameState.canAfford(card.price);
            cardElement.className = `talent-card ${canAfford ? 'affordable' : 'unaffordable'}`;
            buyBtn.disabled = !canAfford;
        });

        // Update reroll button
        const rerollBtn = document.getElementById('reroll-btn');
        rerollBtn.disabled = !this.gameState.canAfford(20);
    }

    updateHealthDisplay() {
        const healthPercent = (this.gameState.health / this.gameState.maxHealth) * 100;
        document.querySelector('.health-fill').style.width = `${healthPercent}%`;
        document.getElementById('health-text').textContent = `${this.gameState.health}/${this.gameState.maxHealth}`;
    }

    updateBattleLog() {
        const messagesContainer = document.getElementById('battle-messages');
        messagesContainer.innerHTML = '';
        
        this.gameState.battleLog.slice(-10).forEach(logEntry => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `<span style="color: #718096;">[${logEntry.timestamp}]</span> ${logEntry.message}`;
            messagesContainer.appendChild(messageDiv);
        });
        
        // Auto scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateTotalDamage() {
        document.getElementById('total-damage').textContent = this.gameState.getTotalDamage();
    }

    rerollShop() {
        if (this.gameState.spendGold(20)) {
            this.gameState.generateShopCards();
            this.gameState.addBattleMessage('Re-rolled shop cards for 20 gold!');
            this.updateUI();
        } else {
            this.gameState.addBattleMessage('Not enough gold to re-roll shop!');
            this.updateBattleLog();
        }
    }

    purchaseCard(cardIndex) {
        const card = this.gameState.shopCards[cardIndex];
        if (!card) return;

        if (this.gameState.canAfford(card.price)) {
            const success = this.gameState.upgradeTalent(card.talentType);
            if (success) {
                // Add level up animation
                const talentElement = document.querySelector(`[data-talent="${card.talentType}"]`);
                talentElement.classList.add('level-up');
                setTimeout(() => {
                    talentElement.classList.remove('level-up');
                }, 500);

                // Generate new shop cards
                this.gameState.generateShopCards();
                this.updateUI();
            }
        } else {
            this.gameState.addBattleMessage('Not enough gold to purchase this talent!');
            this.updateBattleLog();
        }
    }

    startBattle() {
        // Simple battle simulation
        const enemyDamage = Math.floor(Math.random() * 15) + 5;
        const playerDamage = this.gameState.getTotalDamage();
        
        // Check for dodge
        const dodgeChance = this.gameState.talents.dodge.value;
        const dodged = Math.random() * 100 < dodgeChance;
        
        if (dodged) {
            this.gameState.addBattleMessage('You dodged the enemy attack!');
        } else {
            this.gameState.health = Math.max(0, this.gameState.health - enemyDamage);
            this.gameState.addBattleMessage(`Enemy dealt ${enemyDamage} damage to you!`);
        }

        // Check for crit
        const critChance = this.gameState.talents.crit.value;
        const crit = Math.random() * 100 < critChance;
        const finalDamage = crit ? playerDamage * 2 : playerDamage;
        
        if (crit) {
            this.gameState.addBattleMessage(`Critical hit! You dealt ${finalDamage} damage!`);
        } else {
            this.gameState.addBattleMessage(`You dealt ${finalDamage} damage to the enemy!`);
        }

        // Poison damage
        if (this.gameState.talents.poison.level > 0) {
            const poisonDamage = this.gameState.talents.poison.value;
            this.gameState.addBattleMessage(`Poison dealt ${poisonDamage} additional damage!`);
        }

        // Healing
        if (this.gameState.talents.heal.level > 0 && this.gameState.health < this.gameState.maxHealth) {
            const healAmount = Math.min(this.gameState.talents.heal.value, this.gameState.maxHealth - this.gameState.health);
            this.gameState.health += healAmount;
            this.gameState.addBattleMessage(`You healed for ${healAmount} health!`);
        }

        // Ultimate ability
        if (this.gameState.talents.ultimate.level > 0) {
            const ultimateChance = 20; // 20% chance to trigger
            if (Math.random() * 100 < ultimateChance) {
                const ultimateDamage = this.gameState.talents.ultimate.value;
                this.gameState.addBattleMessage(`ULTIMATE ABILITY! Dealt ${ultimateDamage} massive damage!`);
            }
        }

        // Award gold for battle
        const goldEarned = Math.floor(Math.random() * 30) + 20;
        this.gameState.gold += goldEarned;
        this.gameState.addBattleMessage(`Battle complete! Earned ${goldEarned} gold!`);

        this.updateUI();

        // Check if player died
        if (this.gameState.health <= 0) {
            this.gameState.addBattleMessage('You have been defeated! Game Over!');
            document.getElementById('battle-btn').disabled = true;
        }
    }

    resetGame() {
        // Reset game state
        this.gameState.reset();
        
        // Re-enable battle button
        document.getElementById('battle-btn').disabled = false;
        
        // Switch back to hero selection
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('hero-selection').classList.remove('hidden');
        
        // Clear selected hero
        this.gameState.selectedHero = null;
    }
}

// Error Handling and Validation
class ErrorHandler {
    static handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly error message
        const errorMessage = `An error occurred${context ? ` in ${context}` : ''}. Please try again.`;
        this.showErrorMessage(errorMessage);
    }

    static showErrorMessage(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fed7d7;
            color: #9b2c2c;
            padding: 15px 20px;
            border-radius: 8px;
            border: 1px solid #feb2b2;
            z-index: 9999;
            font-weight: bold;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    static validateGameState(gameState) {
        const errors = [];
        
        if (gameState.gold < 0) {
            errors.push('Gold cannot be negative');
        }
        
        if (gameState.health < 0) {
            errors.push('Health cannot be negative');
        }
        
        if (gameState.health > gameState.maxHealth) {
            errors.push('Health cannot exceed maximum health');
        }
        
        Object.keys(gameState.talents).forEach(talent => {
            if (gameState.talents[talent].level < 0) {
                errors.push(`${talent} level cannot be negative`);
            }
        });
        
        return errors;
    }
}

// Input Validation
class InputValidator {
    static validatePurchase(gameState, cost) {
        if (typeof cost !== 'number' || cost <= 0) {
            throw new Error('Invalid purchase cost');
        }
        
        if (!gameState.canAfford(cost)) {
            throw new Error('Insufficient funds for purchase');
        }
        
        return true;
    }

    static validateTalentType(talentType) {
        const validTalents = ['attack', 'crit', 'dodge', 'poison', 'heal', 'ultimate'];
        if (!validTalents.includes(talentType)) {
            throw new Error(`Invalid talent type: ${talentType}`);
        }
        return true;
    }
}

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    try {
        const gameState = new GameState();
        const uiController = new UIController(gameState);
        
        // Global error handling
        window.addEventListener('error', (event) => {
            ErrorHandler.handleError(event.error, 'Global');
        });
        
        // Validation on critical operations
        const originalUpgradeTalent = gameState.upgradeTalent.bind(gameState);
        gameState.upgradeTalent = function(talentType) {
            try {
                InputValidator.validateTalentType(talentType);
                InputValidator.validatePurchase(this, 100);
                const result = originalUpgradeTalent(talentType);
                
                const validationErrors = ErrorHandler.validateGameState(this);
                if (validationErrors.length > 0) {
                    throw new Error(`Game state validation failed: ${validationErrors.join(', ')}`);
                }
                
                return result;
            } catch (error) {
                ErrorHandler.handleError(error, 'Talent Upgrade');
                return false;
            }
        };
        
        console.log('My Dumb Battler game initialized successfully!');
        
    } catch (error) {
        ErrorHandler.handleError(error, 'Game Initialization');
    }
});