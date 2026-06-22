// Configurações Globais
const global = {
    pause: true,
    view_width: 800,   // Defina a largura do seu canvas
    view_height: 600,  // Defina a altura do seu canvas
    key_revert: "KeyX",
    key_enter: "Enter",
    key_left: "ArrowLeft",
    key_right: "ArrowRight",
    key_up: "ArrowUp",
    key_down: "ArrowDown"
};

// Enums equivalentes
const MenuPage = {
    main: 0, settings: 1, audio: 2, difficulty: 3, graphics: 4, controls: 5
};

const MenuElementType = {
    script_runner: "script_runner",
    page_transfer: "page_transfer",
    slider: "slider",
    shift: "shift",
    toggle: "toggle",
    input: "input"
};

// Funções de exemplo (Scripts executáveis)
const resume_game = () => global.pause = false;
const exit_game = () => console.log("Exit Game");
const change_volume = (val) => console.log("Volume alterado para:", val);
const change_difficulty = (val) => console.log("Dificuldade alterada para:", val);
const change_resolution = (val) => console.log("Resolução alterada para:", val);
const change_window_mode = (val) => console.log("Modo de janela alterado para:", val);

// Criação das Páginas do Menu (Substitui as ds_grids)
const menu_pages = [
    // MAIN MENU (Index 0)
    [
        { name: "RESUME", type: MenuElementType.script_runner, action: resume_game },
        { name: "SETTINGS", type: MenuElementType.page_transfer, target: MenuPage.settings },
        { name: "EXIT", type: MenuElementType.script_runner, action: exit_game }
    ],
    // SETTINGS (Index 1)
    [
        { name: "AUDIO", type: MenuElementType.page_transfer, target: MenuPage.audio },
        { name: "DIFFICULTY", type: MenuElementType.page_transfer, target: MenuPage.difficulty },
        { name: "GRAPHICS", type: MenuElementType.page_transfer, target: MenuPage.graphics },
        { name: "CONTROLS", type: MenuElementType.page_transfer, target: MenuPage.controls },
        { name: "BACK", type: MenuElementType.page_transfer, target: MenuPage.main }
    ],
    // AUDIO (Index 2)
    [
        { name: "MASTER", type: MenuElementType.slider, action: change_volume, value: 0.5, limits: [0, 1] },
        { name: "SOUNDS", type: MenuElementType.slider, action: change_volume, value: 0.2, limits: [0, 1] },
        { name: "MUSIC", type: MenuElementType.slider, action: change_volume, value: 1.0, limits: [0, 1] },
        { name: "BACK", type: MenuElementType.page_transfer, target: MenuPage.settings }
    ],
    // DIFFICULTY (Index 3)
    [
        { name: "ENEMIES", type: MenuElementType.shift, action: change_difficulty, value: 0, options: ["HARMLESS", "NORMAL", "TERRIBLE"] },
        { name: "ALLIES", type: MenuElementType.shift, action: change_difficulty, value: 0, options: ["DIM-WITTED", "NORMAL", "HELPFUL"] },
        { name: "BACK", type: MenuElementType.page_transfer, target: MenuPage.settings }
    ],
    // GRAPHICS (Index 4)
    [
        { name: "RESOLUTION", type: MenuElementType.shift, action: change_resolution, value: 0, options: ["384x216", "768x432", "1152x648", "1920x1080"] },
        { name: "WINDOW MODE", type: MenuElementType.toggle, action: change_window_mode, value: 1, options: ["FULLSCREEN", "WINDOWED"] },
        { name: "BACK", type: MenuElementType.page_transfer, target: MenuPage.settings }
    ],
    // CONTROLS (Index 5)
    [
        { name: "UP", type: MenuElementType.input, target_key: "key_up", value: "ArrowUp" },
        { name: "LEFT", type: MenuElementType.input, target_key: "key_left", value: "ArrowLeft" },
        { name: "RIGHT", type: MenuElementType.input, target_key: "key_right", value: "ArrowRight" },
        { name: "DOWN", type: MenuElementType.input, target_key: "key_down", value: "ArrowDown" },
        { name: "BACK", type: MenuElementType.page_transfer, target: MenuPage.settings }
    ]
];

// Estado do Menu
let currentPage = MenuPage.main;
let menu_option = new Array(menu_pages.length).fill(0); // Armazena a opção selecionada de cada página
let inputting = false;

// Monitor de teclas (Input System)
const keysPressed = {};
const keysDown = {};

window.addEventListener("keydown", (e) => {
    if (!keysDown[e.code]) keysPressed[e.code] = true; // Apenas no frame do clique
    keysDown[e.code] = true;
});

window.addEventListener("keyup", (e) => {
    keysDown[e.code] = false;
});

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function updateMenu() {
    if (!global.pause) return;

    // Captura os inputs do frame
    let input_up_p = keysPressed[global.key_up] ? 1 : 0;
    let input_down_p = keysPressed[global.key_down] ? 1 : 0;
    let input_enter_p = keysPressed[global.key_enter] ? 1 : 0;
    let input_left_p = keysPressed[global.key_left] ? 1 : 0;
    let input_right_p = keysPressed[global.key_right] ? 1 : 0;

    // Inputs contínuos para o Slider
    let hinput_continuous = (keysDown[global.key_right] ? 1 : 0) - (keysDown[global.key_left] ? 1 : 0);
    // Inputs de clique único para Shift/Toggle
    let hinput_pressed = input_right_p - input_left_p;

    let page_elements = menu_pages[currentPage];
    let current_option = menu_option[currentPage];
    let element = page_elements[current_option];

    if (inputting) {
        switch (element.type) {
            case MenuElementType.shift:
                if (hinput_pressed !== 0) {
                    element.value += hinput_pressed;
                    element.value = clamp(element.value, 0, element.options.length - 1);
                }
                break;

            case MenuElementType.slider:
                if (hinput_continuous !== 0) {
                    element.value += hinput_continuous * 0.01;
                    element.value = clamp(element.value, element.limits[0], element.limits[1]);
                    element.action(element.value); // Executa a mudança de áudio em tempo real
                }
                break;

            case MenuElementType.toggle:
                if (hinput_pressed !== 0) {
                    element.value = element.value === 0 ? 1 : 0; // Inverte o toggle
                }
                break;

            case MenuElementType.input:
                // Captura a última tecla pressionada que não seja Enter
                let lastKey = Object.keys(keysPressed).find(k => keysPressed[k] && k !== "Enter");
                if (lastKey) {
                    element.value = lastKey;
                    global[element.target_key] = lastKey; // Atualiza a tecla global do jogo
                    inputting = false; // Sai automaticamente do modo input
                }
                break;
        }
    } else {
        // Navegação vertical normal
        let ochange = input_down_p - input_up_p;
        if (ochange !== 0) {
            menu_option[currentPage] += ochange;
            if (menu_option[currentPage] > page_elements.length - 1) menu_option[currentPage] = 0;
            if (menu_option[currentPage] < 0) menu_option[currentPage] = page_elements.length - 1;
        }
    }

    // Pressionar ENTER para confirmar ou entrar/sair do modo de edição
    if (input_enter_p) {
        switch (element.type) {
            case MenuElementType.script_runner:
                element.action();
                break;

            case MenuElementType.page_transfer:
                currentPage = element.target;
                break;

            case MenuElementType.shift:
            case MenuElementType.slider:
            case MenuElementType.toggle:
                if (inputting) {
                    element.action(element.value); // Executa o script ao salvar
                }
                inputting = !inputting;
                break;

            case MenuElementType.input:
                inputting = !inputting;
                break;
        }
    }

    // Limpa as teclas pressionadas para o próximo frame (Reset do Pressed)
    for (let key in keysPressed) keysPressed[key] = false;
}

function drawMenu(ctx) {
    if (!global.pause) return;

    let gwidth = global.view_width;
    let gheight = global.view_height;

    let page_elements = menu_pages[currentPage];
    let ds_height = page_elements.length;
    let y_buffer = 32;
    let x_buffer = 16;
    let start_y = (gheight / 2) - (((ds_height - 1) / 2) * y_buffer);
    let start_x = gwidth / 2;

    // Fundo Preto do Menu
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gwidth, gheight);

    // Configuração básica do texto
    ctx.font = "16px Arial";
    ctx.textBaseline = "middle";

    // 1. DESENHAR LADO ESQUERDO (Nomes das Opções)
    ctx.textAlign = "right";
    let ltx = start_x - x_buffer;

    for (let yy = 0; yy < ds_height; yy++) {
        let lty = start_y + (yy * y_buffer);
        let xo = 0;

        if (yy === menu_option[currentPage]) {
            ctx.fillStyle = "orange";
            xo = -(x_buffer / 2);
        } else {
            ctx.fillStyle = "white";
        }

        ctx.fillText(page_elements[yy].name, ltx + xo, lty);
    }

    // 2. DESENHAR LINHA DIVISÓRIA
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(start_x, start_y - y_buffer);
    ctx.lineTo(start_x, start_y + (ds_height * y_buffer));
    ctx.stroke();

    // 3. DESENHAR LADO DIREITO (Valores e Controles)
    ctx.textAlign = "left";
    let rtx = start_x + x_buffer;

    for (let yy = 0; yy < ds_height; yy++) {
        let rty = start_y + (yy * y_buffer);
        let element = page_elements[yy];

        // Define a cor base do elemento selecionado ou editando
        let color = "white";
        if (yy === menu_option[currentPage]) {
            color = inputting ? "yellow" : "white";
        }
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        switch (element.type) {
            case MenuElementType.shift:
                let left_shift = element.value === 0 ? "" : "<< ";
                let right_shift = element.value === element.options.length - 1 ? "" : " >>";
                ctx.fillText(left_shift + element.options[element.value] + right_shift, rtx, rty);
                break;

            case MenuElementType.slider:
                let len = 64;
                // Cálculo de posição normalizado corrigido
                let circle_pos = (element.value - element.limits[0]) / (element.limits[1] - element.limits[0]);
                
                // Desenha a linha do slider
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(rtx, rty);
                ctx.lineTo(rtx + len, rty);
                ctx.stroke();

                // Desenha a bolinha (Círculo)
                ctx.beginPath();
                ctx.arc(rtx + (circle_pos * len), rty, 4, 0, 2 * Math.PI);
                ctx.fill();

                // Texto da Porcentagem
                ctx.fillText(Math.floor(circle_pos * 100) + "%", rtx + (len * 1.2), rty);
                break;

            case MenuElementType.toggle:
                if (element.value === 0) {
                    ctx.fillStyle = color; ctx.fillText("ON", rtx, rty);
                    ctx.fillStyle = "gray";  ctx.fillText("OFF", rtx + 32, rty);
                } else {
                    ctx.fillStyle = "gray";  ctx.fillText("ON", rtx, rty);
                    ctx.fillStyle = color; ctx.fillText("OFF", rtx + 32, rty);
                }
                break;

            case MenuElementType.input:
                ctx.fillText(element.value.toUpperCase(), rtx, rty);
                break;
        }
    }
}
