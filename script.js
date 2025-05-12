const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('typeFilter');
const rarityFilter = document.getElementById('rarityFilter');

// Pokemon rarity definitions
const rarityMap = {
    legendary: [144, 145, 146, 150, 151],
    mythical: [151],
    rare: [149, 134, 135, 136, 143, 131, 130, 142, 141, 139],
    uncommon: [133, 132, 127, 123, 115, 113, 108, 107, 106, 105],
    // Rest will be common
};

const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

async function fetchPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        createPokemonCard(data);
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
    }
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const types = pokemon.types.map(type => type.type.name);
    
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>#${pokemon.id.toString().padStart(3, '0')}</p>
        <div class="types">
            ${types.map(type => `
                <span class="type" style="background-color: ${typeColors[type]}">
                    ${type}
                </span>
            `).join('')}
        </div>
    `;

    pokemonContainer.appendChild(card);
}

// Load first 151 Pokemon (First Generation)
function loadPokemon() {
    for (let i = 1; i <= 151; i++) {
        fetchPokemon(i);
    }
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const pokemonCards = document.querySelectorAll('.pokemon-card');

    pokemonCards.forEach(card => {
        const pokemonName = card.querySelector('h3').textContent.toLowerCase();
        if (pokemonName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Initialize the Pokedex
loadPokemon();

// Add this at the beginning of your script.js file
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Set initial theme based on user's system preference
function setInitialTheme() {
    if (localStorage.getItem('theme')) {
        document.body.setAttribute('data-theme', localStorage.getItem('theme'));
    } else if (prefersDarkScheme.matches) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
    }
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Listen for system theme changes
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// Initialize theme
setInitialTheme();

// Tab functionality
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Add this after your typeColors object
// Create type list in the info tab
function createTypeList() {
    const typeList = document.querySelector('.type-list');
    Object.entries(typeColors).forEach(([type, color]) => {
        const typeElement = document.createElement('div');
        typeElement.classList.add('type');
        typeElement.style.backgroundColor = color;
        typeElement.textContent = type;
        typeList.appendChild(typeElement);
    });
}

// Call this function after loadPokemon()
createTypeList();

async function fetchPokemonData() {
    try {
        const promises = [];
        for (let i = 1; i <= 151; i++) {
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
        }
        const pokemonList = await Promise.all(promises);
        
        // Populate type filter
        const types = new Set();
        pokemonList.forEach(pokemon => {
            pokemon.types.forEach(type => types.add(type.type.name));
        });
        
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeFilter.appendChild(option);
        });

        displayPokemon(pokemonList);
        
        // Set up event listeners for filtering
        typeFilter.addEventListener('change', () => filterPokemon(pokemonList));
        rarityFilter.addEventListener('change', () => filterPokemon(pokemonList));
        searchInput.addEventListener('input', () => filterPokemon(pokemonList));
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
    }
}

function getRarity(pokemonId) {
    if (rarityMap.mythical.includes(pokemonId)) return 'mythical';
    if (rarityMap.legendary.includes(pokemonId)) return 'legendary';
    if (rarityMap.rare.includes(pokemonId)) return 'rare';
    if (rarityMap.uncommon.includes(pokemonId)) return 'uncommon';
    return 'common';
}

function filterPokemon(pokemonList) {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedRarity = rarityFilter.value;

    const filteredPokemon = pokemonList.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm);
        const matchesType = selectedType === 'all' || pokemon.types.some(type => type.type.name === selectedType);
        const matchesRarity = selectedRarity === 'all' || getRarity(pokemon.id) === selectedRarity;
        return matchesSearch && matchesType && matchesRarity;
    });

    displayPokemon(filteredPokemon);
}

function displayPokemon(pokemonList) {
    pokemonContainer.innerHTML = '';
    pokemonList.forEach(pokemon => {
        const rarity = getRarity(pokemon.id);
        const card = document.createElement('div');
        card.className = `pokemon-card ${rarity}`;
        
        const types = pokemon.types.map(type => type.type.name);
        
        card.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
            <p>#${pokemon.id.toString().padStart(3, '0')}</p>
            <div class="types">
                ${types.map(type => `
                    <span class="type" style="background-color: ${typeColors[type]}">
                        ${type}
                    </span>
                `).join('')}
            </div>
            <div class="rarity-badge">${rarity}</div>
        `;

        pokemonContainer.appendChild(card);
    });
}

// Initialize
fetchPokemonData();