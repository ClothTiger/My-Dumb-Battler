// Game state object
const gameState = {
    selectedHero: '',
    gold: 300,
    branches: {
        attack: 0,
        crit: 0,
        dodge: 0,
        poison: 0,
        heal: 0,
        ultimate: 0
    },
    shopCards: []
};

// Branch names for display and color mapping
const branchNames = ['Attack', 'Crit', 'Dodge', 'Poison', 'Heal', 'Ultimate'];
const branchKeys = ['attack', 'crit', 'dodge', 'poison', 'heal', 'ultimate'];

// DOM elements
const heroSelectionScreen = document.getElementById('hero-selection');
const mainGameScreen = document.getElementById('main-game');
const hero1Btn = document.getElementById('hero1-btn');
const hero2Btn = document.getElementById('hero2-btn');
const heroNameElement = document.getElementById('hero-name');
const goldAmountElement = document.getElementById('gold-amount');
const shopCardsContainer = document.getElementById('shop-cards');
const rerollBtn = document.getElementById('reroll-btn');

// Initialize the game
function initGame() {
    // Add event listeners for hero selection
    hero1Btn.addEventListener('click', () => selectHero('Hero 1'));
    hero2Btn.addEventListener('click', () => selectHero('Hero 2'));
    
    // Add event listener for reroll button
    rerollBtn.addEventListener('click', rerollShop);
    
    // Generate initial shop cards
    generateShopCards();
}

// Select a hero and transition to main game
function selectHero(heroName) {
    gameState.selectedHero = heroName;
    heroNameElement.textContent = heroName;
    
    // Hide hero selection and show main game
    heroSelectionScreen.classList.add('hidden');
    mainGameScreen.classList.remove('hidden');
    
    // Update displays
    updateGoldDisplay();
    updateBranchDisplays();
    updateShopDisplay();
}

// Generate random shop cards
function generateShopCards() {
    gameState.shopCards = [];
    
    for (let i = 0; i < 5; i++) {
        const randomBranchIndex = Math.floor(Math.random() * branchNames.length);
        const branchName = branchNames[randomBranchIndex];
        const branchKey = branchKeys[randomBranchIndex];
        
        gameState.shopCards.push({
            id: i,
            branchName: branchName,
            branchKey: branchKey,
            cost: 100
        });
    }
}

// Update shop display
function updateShopDisplay() {
    shopCardsContainer.innerHTML = '';
    
    gameState.shopCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'shop-card';
        
        const cardText = document.createElement('span');
        cardText.className = 'card-text';
        cardText.innerHTML = `+1 <span class="${card.branchKey}">${card.branchName}</span> - ${card.cost} Gold`;
        
        const buyButton = document.createElement('button');
        buyButton.className = 'buy-btn';
        buyButton.textContent = 'Buy';
        buyButton.disabled = gameState.gold < card.cost;
        buyButton.addEventListener('click', () => buyCard(card));
        
        cardElement.appendChild(cardText);
        cardElement.appendChild(buyButton);
        shopCardsContainer.appendChild(cardElement);
    });
    
    // Update reroll button state
    rerollBtn.disabled = gameState.gold < 20;
}

// Buy a card from the shop
function buyCard(card) {
    if (gameState.gold >= card.cost) {
        // Deduct gold
        gameState.gold -= card.cost;
        
        // Increase branch value
        gameState.branches[card.branchKey] += 1;
        
        // Remove card from shop
        gameState.shopCards = gameState.shopCards.filter(c => c.id !== card.id);
        
        // Update displays
        updateGoldDisplay();
        updateBranchDisplays();
        updateShopDisplay();
    }
}

// Reroll shop cards
function rerollShop() {
    if (gameState.gold >= 20) {
        // Deduct reroll cost
        gameState.gold -= 20;
        
        // Generate new cards
        generateShopCards();
        
        // Update displays
        updateGoldDisplay();
        updateShopDisplay();
    }
}

// Update gold display
function updateGoldDisplay() {
    goldAmountElement.textContent = gameState.gold;
}

// Update branch value displays
function updateBranchDisplays() {
    branchKeys.forEach(branchKey => {
        const element = document.getElementById(`${branchKey}-value`);
        if (element) {
            element.textContent = gameState.branches[branchKey];
        }
    });
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);