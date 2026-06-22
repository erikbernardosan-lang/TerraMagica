// Configurações padrão do jogo salvas na memória
const gameSettings = {
    audio: { master: 80, music: 70 },
    controls: { up: 'W', down: 'S' },
    resolution: 'res-1920'
};

// 1. NAVEGAÇÃO ENTRE TELAS
function openScreen(screenId) {
    // Esconde todas as telas
    document.querySelectorAll('.menu-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Mostra a tela desejada
    document.getElementById(screenId).classList.add('active');
}

// 2. CONFIGURAÇÃO DE ÁUDIO
function updateAudio() {
    gameSettings.audio.master = document.getElementById('volume-master').value;
    gameSettings.audio.music = document.getElementById('volume-music').value;
    
    console.log("Áudio atualizado:", gameSettings.audio);
    // Aqui você integraria com a API de áudio do seu jogo (ex: HTML5 Audio volume)
}

// 3. CONFIGURAÇÃO DE CONTROLES (Keybinding)
let keyToRebind = null;

function rebindKey(action) {
    keyToRebind = action;
    const btn = document.getElementById(`btn-${action}`);
    btn.innerText = "Pressione uma tecla...";
    
    // Escuta a próxima tecla pressionada
    window.addEventListener('keydown', handleNewKey);
}

function handleNewKey(event) {
    if (!keyToRebind) return;

    const newKey = event.key.toUpperCase();
    gameSettings.controls[keyToRebind] = newKey;

    // Atualiza o texto do botão correspondente
    document.getElementById(`btn-${keyToRebind}`).innerText = newKey;
    console.log("Controles atualizados:", gameSettings.controls);

    // Limpa o evento para não continuar escutando
    keyToRebind = null;
    window.removeEventListener('keydown', handleNewKey);
}

// 4. CONFIGURAÇÃO DE GRÁFICOS (Resolução)
function updateResolution() {
    const container = document.getElementById('game-container');
    const select = document.getElementById('resolution-select');
    
    // Remove as classes antigas de resolução
    container.classList.remove('res-1920', 'res-1280', 'res-800');
    
    // Aplica a nova resolução selecionada
    const selectedRes = select.value;
    container.classList.add(selectedRes);
    gameSettings.resolution = selectedRes;
    
    console.log("Resolução alterada para:", selectedRes);
}

// Botões de Ação Principal
function startGame() {
    alert("Iniciando o jogo com as configurações salvas!");
    console.log("Configurações finais aplicadas:", gameSettings);
}

function exitGame() {
    alert("Saindo do jogo...");
}
